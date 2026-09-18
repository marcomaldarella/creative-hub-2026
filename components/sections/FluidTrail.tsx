'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

type RGB = [number, number, number]

/**
 * Scia fluida dietro al mouse: port 1:1 della reference CodeGrid/Cappen
 * (config, shader e passi identici a js/FluidSimulation.js + script.js).
 * Differenze deliberate: scopata al contenitore invece che al viewport
 * (la pagina sotto scorre normale), pausa fuori viewport, e l'inchiostro
 * viene lerp-ato verso il colore della voce attiva invece del bianco
 * fisso. Su touch la scia vive di tap (burst radiale: il dito fermo non
 * ha velocità) e segue lo swipe con listener PASSIVI: mai preventDefault,
 * lo scroll nativo dello slider non viene toccato.
 */

/* config IDENTICA alla reference CodeGrid (js/script.js) */
const CONFIG = {
  simResolution: 256,
  dyeResolution: 1024,
  curl: 50,
  pressureIterations: 40,
  velocityDissipation: 0.95,
  dyeDissipation: 0.95,
  splatRadius: 0.3,
  forceStrength: 8.5,
  pressureDecay: 0.75,
  threshold: 1.0,
  edgeSoftness: 0.0,
  /* 0 = tinta piatta come la reference; 1 = colore modulato dalla
     densità del fluido (core acceso, bordi scuri) */
  shade: 0.0,
}

const VERT = `varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position,1.); }`
const P = `precision highp float;`
const S = `precision mediump sampler2D;`

const FRAG = {
  /* splat gaussiano del template, usato per forza e inchiostro */
  splat: `${P} ${S}
    uniform sampler2D uTarget; uniform float aspectRatio,radius; uniform vec3 color; uniform vec2 point; varying vec2 vUv;
    void main(){ vec2 p=vUv-point; p.x*=aspectRatio; gl_FragColor=vec4(texture2D(uTarget,vUv).xyz+exp(-dot(p,p)/radius)*color,1.); }`,
  advection: `${P} ${S}
    uniform sampler2D uVelocity,uSource; uniform vec2 texelSize; uniform float dt,dissipation; varying vec2 vUv;
    void main(){ gl_FragColor=vec4(dissipation*texture2D(uSource,vUv-dt*texture2D(uVelocity,vUv).xy*texelSize).rgb,1.); }`,
  divergence: `${P} ${S}
    uniform sampler2D uVelocity; uniform vec2 texelSize; varying vec2 vUv;
    vec2 vel(vec2 uv){ vec2 e=vec2(1.); if(uv.x<0.){uv.x=0.;e.x=-1.;} if(uv.x>1.){uv.x=1.;e.x=-1.;} if(uv.y<0.){uv.y=0.;e.y=-1.;} if(uv.y>1.){uv.y=1.;e.y=-1.;} return e*texture2D(uVelocity,uv).xy; }
    void main(){ vec2 L=vUv-vec2(texelSize.x,0.),R=vUv+vec2(texelSize.x,0.),T=vUv+vec2(0.,texelSize.y),B=vUv-vec2(0.,texelSize.y); gl_FragColor=vec4(.5*(vel(R).x-vel(L).x+vel(T).y-vel(B).y),0.,0.,1.); }`,
  curl: `${P} ${S}
    uniform sampler2D uVelocity; uniform vec2 texelSize; varying vec2 vUv;
    void main(){ vec2 L=vUv-vec2(texelSize.x,0.),R=vUv+vec2(texelSize.x,0.),T=vUv+vec2(0.,texelSize.y),B=vUv-vec2(0.,texelSize.y); gl_FragColor=vec4(texture2D(uVelocity,R).y-texture2D(uVelocity,L).y-texture2D(uVelocity,T).x+texture2D(uVelocity,B).x,0.,0.,1.); }`,
  vorticity: `${P} ${S}
    uniform sampler2D uVelocity,uCurl; uniform vec2 texelSize; uniform float curlStrength,dt; varying vec2 vUv;
    void main(){ vec2 L=vUv-vec2(texelSize.x,0.),R=vUv+vec2(texelSize.x,0.),T=vUv+vec2(0.,texelSize.y),B=vUv-vec2(0.,texelSize.y); vec2 f=normalize(vec2(abs(texture2D(uCurl,T).x)-abs(texture2D(uCurl,B).x),abs(texture2D(uCurl,R).x)-abs(texture2D(uCurl,L).x))+.0001)*curlStrength*texture2D(uCurl,vUv).x; gl_FragColor=vec4(texture2D(uVelocity,vUv).xy+f*dt,0.,1.); }`,
  pressure: `${P} ${S}
    uniform sampler2D uPressure,uDivergence; uniform vec2 texelSize; varying vec2 vUv;
    void main(){ vec2 L=clamp(vUv-vec2(texelSize.x,0.),0.,1.),R=clamp(vUv+vec2(texelSize.x,0.),0.,1.),T=clamp(vUv+vec2(0.,texelSize.y),0.,1.),B=clamp(vUv-vec2(0.,texelSize.y),0.,1.); gl_FragColor=vec4((texture2D(uPressure,L).x+texture2D(uPressure,R).x+texture2D(uPressure,T).x+texture2D(uPressure,B).x-texture2D(uDivergence,vUv).x)*.25,0.,0.,1.); }`,
  gradientSubtract: `${P} ${S}
    uniform sampler2D uPressure,uVelocity; uniform vec2 texelSize; varying vec2 vUv;
    void main(){ float pL=texture2D(uPressure,clamp(vUv-vec2(texelSize.x,0.),0.,1.)).x,pR=texture2D(uPressure,clamp(vUv+vec2(texelSize.x,0.),0.,1.)).x,pT=texture2D(uPressure,clamp(vUv+vec2(0.,texelSize.y),0.,1.)).x,pB=texture2D(uPressure,clamp(vUv-vec2(0.,texelSize.y),0.,1.)).x; gl_FragColor=vec4(texture2D(uVelocity,vUv).xy-vec2(pR-pL,pT-pB),0.,1.); }`,
  clear: `${P} ${S}
    uniform sampler2D uTexture; uniform float value; varying vec2 vUv;
    void main(){ gl_FragColor=value*texture2D(uTexture,vUv); }`,
  /* display identico al template con shade 0 (soglia netta, tinta
     piatta); con shade 1 il colore segue la densità: core acceso fino a
     oltre l'inchiostro, bordi che scuriscono — la scia smette di essere
     una sagoma piatta (usato su touch) */
  display: `${P}
    uniform sampler2D uTexture; uniform float threshold,edgeSoftness,shade; uniform vec3 inkColor; varying vec2 vUv;
    void main(){ float d=clamp(length(texture2D(uTexture,vUv).rgb),0.,1.); float a=edgeSoftness>0.?smoothstep(threshold-edgeSoftness*.5,threshold+edgeSoftness*.5,d):step(threshold,d); vec3 col=mix(inkColor,inkColor*(.34+.95*d*d),shade); gl_FragColor=vec4(col,a); }`,
}

type Double = {
  read: THREE.WebGLRenderTarget
  write: THREE.WebGLRenderTarget
  swap(): void
}

export class Fluid {
  private renderer: THREE.WebGLRenderer
  private scene = new THREE.Scene()
  private camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
  private quad: THREE.Mesh
  private host: HTMLElement
  private dpr: number
  private width = 1
  private height = 1
  private simSize = { w: 1, h: 1 }
  private dyeSize = { w: 1, h: 1 }
  private velocity!: Double
  private dye!: Double
  private divergence!: THREE.WebGLRenderTarget
  private curl!: THREE.WebGLRenderTarget
  private pressure!: Double
  private material: Record<string, THREE.ShaderMaterial> = {}
  private mouse = { x: 0, y: 0, vx: 0, vy: 0, moved: false }
  private touch = { x: 0, y: 0 }
  /* splat in attesa (tap/swipe): consumati tutti al prossimo frame */
  private queue: { x: number; y: number; vx: number; vy: number }[] = []
  private ink = new THREE.Color(1, 1, 1)
  private inkTarget = new THREE.Color(1, 1, 1)
  private raf: number | null = null
  private running = false
  private lastTime = 0
  private targets: THREE.WebGLRenderTarget[] = []
  private onMove: (e: PointerEvent) => void
  private onTouchStart: (e: TouchEvent) => void
  private onTouchMove: (e: TouchEvent) => void
  private onResize: ResizeObserver
  private cfg: typeof CONFIG

  constructor(
    canvas: HTMLCanvasElement,
    host: HTMLElement,
    opts: { coarse?: boolean } = {},
  ) {
    this.host = host
    /* coarse = touch: dye e iterazioni ridotti (la GPU dei telefoni non
       regge la config desktop a schermo pieno) e resa NON piatta —
       bordo morbido + shade: sui video la sagoma a tinta unita leggeva
       da adesivo, così ha un core acceso e i bordi che sfumano scuri */
    this.cfg = opts.coarse
      ? {
          ...CONFIG,
          dyeResolution: 512,
          pressureIterations: 24,
          threshold: 0.6,
          edgeSoftness: 0.5,
          shade: 1.0,
        }
      : { ...CONFIG }
    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true })
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, opts.coarse ? 1.5 : 2))
    this.dpr = this.renderer.getPixelRatio()
    this.quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2))
    this.scene.add(this.quad)
    this.resize()
    this.setupTargets()
    this.setupMaterials()

    this.onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      const r = this.host.getBoundingClientRect()
      const x = (e.clientX - r.left) * this.dpr
      const y = (e.clientY - r.top) * this.dpr
      this.mouse.vx = (x - this.mouse.x) * this.cfg.forceStrength
      this.mouse.vy = (y - this.mouse.y) * this.cfg.forceStrength
      this.mouse.x = x
      this.mouse.y = y
      this.mouse.moved = true
    }
    host.addEventListener('pointermove', this.onMove)

    /* touch: il tap accende un burst radiale sul punto, lo swipe lascia
       la scia lungo il gesto. Passivi e senza capture: il browser resta
       padrone dello scroll (slider e pagina scorrono come prima) */
    this.onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0]
      if (!t) return
      const r = this.host.getBoundingClientRect()
      const x = (t.clientX - r.left) * this.dpr
      const y = (t.clientY - r.top) * this.dpr
      this.touch.x = x
      this.touch.y = y
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2 + Math.random() * 0.9
        const f = (150 + Math.random() * 240) * this.dpr
        this.queue.push({ x, y, vx: Math.cos(a) * f, vy: Math.sin(a) * f })
      }
    }
    this.onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0]
      if (!t) return
      const r = this.host.getBoundingClientRect()
      const x = (t.clientX - r.left) * this.dpr
      const y = (t.clientY - r.top) * this.dpr
      this.queue.push({
        x,
        y,
        vx: (x - this.touch.x) * this.cfg.forceStrength,
        vy: (y - this.touch.y) * this.cfg.forceStrength,
      })
      this.touch.x = x
      this.touch.y = y
    }
    host.addEventListener('touchstart', this.onTouchStart, { passive: true })
    host.addEventListener('touchmove', this.onTouchMove, { passive: true })

    this.onResize = new ResizeObserver(() => this.resize())
    this.onResize.observe(host)
  }

  private resize() {
    const w = this.host.clientWidth || 1
    const h = this.host.clientHeight || 1
    /* updateStyle false: il canvas è dimensionato dal CSS (inset 0) */
    this.renderer.setSize(w, h, false)
    this.width = w * this.dpr
    this.height = h * this.dpr
  }

  private setupTargets() {
    const aspect = this.width / this.height
    const options = {
      type: THREE.HalfFloatType,
      depthBuffer: false,
    } as const
    const single = (w: number, h: number) => {
      const t = new THREE.WebGLRenderTarget(w, h, options)
      this.targets.push(t)
      return t
    }
    const double = (w: number, h: number): Double => ({
      read: single(w, h),
      write: single(w, h),
      swap() {
        ;[this.read, this.write] = [this.write, this.read]
      },
    })
    this.simSize = {
      w: this.cfg.simResolution,
      h: Math.max(1, Math.round(this.cfg.simResolution / aspect)),
    }
    this.dyeSize = {
      w: this.cfg.dyeResolution,
      h: Math.max(1, Math.round(this.cfg.dyeResolution / aspect)),
    }
    this.velocity = double(this.simSize.w, this.simSize.h)
    this.dye = double(this.dyeSize.w, this.dyeSize.h)
    this.divergence = single(this.simSize.w, this.simSize.h)
    this.curl = single(this.simSize.w, this.simSize.h)
    this.pressure = double(this.simSize.w, this.simSize.h)
  }

  private setupMaterials() {
    const make = (frag: string, uniforms: Record<string, THREE.IUniform>) =>
      new THREE.ShaderMaterial({
        vertexShader: VERT,
        fragmentShader: frag,
        uniforms,
      })
    const tex = () => ({ value: null })
    const num = (v = 0) => ({ value: v })
    const vec2 = () => ({ value: new THREE.Vector2() })

    this.material = {
      splat: make(FRAG.splat, {
        uTarget: tex(),
        aspectRatio: num(),
        radius: num(),
        color: { value: new THREE.Vector3() },
        point: { value: new THREE.Vector2() },
      }),
      advection: make(FRAG.advection, {
        uVelocity: tex(),
        uSource: tex(),
        texelSize: vec2(),
        dt: num(),
        dissipation: num(),
      }),
      divergence: make(FRAG.divergence, {
        uVelocity: tex(),
        texelSize: vec2(),
      }),
      curl: make(FRAG.curl, { uVelocity: tex(), texelSize: vec2() }),
      vorticity: make(FRAG.vorticity, {
        uVelocity: tex(),
        uCurl: tex(),
        texelSize: vec2(),
        curlStrength: num(),
        dt: num(),
      }),
      pressure: make(FRAG.pressure, {
        uPressure: tex(),
        uDivergence: tex(),
        texelSize: vec2(),
      }),
      gradientSubtract: make(FRAG.gradientSubtract, {
        uPressure: tex(),
        uVelocity: tex(),
        texelSize: vec2(),
      }),
      clear: make(FRAG.clear, { uTexture: tex(), value: num() }),
      display: make(FRAG.display, {
        uTexture: tex(),
        threshold: num(),
        edgeSoftness: num(),
        shade: num(),
        inkColor: { value: new THREE.Color() },
      }),
    }
  }

  setColor([r, g, b]: RGB) {
    this.inkTarget.setRGB(r, g, b)
  }

  private pass(material: THREE.ShaderMaterial, target?: THREE.WebGLRenderTarget) {
    this.quad.material = material
    this.renderer.setRenderTarget(target ?? null)
    this.renderer.render(this.scene, this.camera)
  }

  private set(material: THREE.ShaderMaterial, values: Record<string, unknown>) {
    Object.entries(values).forEach(
      ([key, val]) => (material.uniforms[key].value = val),
    )
    return material
  }

  /* identico al template: gaussiana stretta, dye (3,3,3) */
  private splat() {
    const { material: m, velocity: vel, dye } = this
    this.set(m.splat, {
      aspectRatio: this.width / this.height,
      point: new THREE.Vector2(
        this.mouse.x / this.width,
        1 - this.mouse.y / this.height,
      ),
      radius: this.cfg.splatRadius / 100,
    })
    this.set(m.splat, {
      uTarget: vel.read.texture,
      color: new THREE.Vector3(this.mouse.vx, -this.mouse.vy, 0),
    })
    this.pass(m.splat, vel.write)
    vel.swap()
    this.set(m.splat, {
      uTarget: dye.read.texture,
      color: new THREE.Vector3(3, 3, 3),
    })
    this.pass(m.splat, dye.write)
    dye.swap()
  }

  private simulate(dt: number) {
    const { material: m, velocity: vel, dye, pressure: pres } = this
    const simTexel = new THREE.Vector2(1 / this.simSize.w, 1 / this.simSize.h)

    this.pass(
      this.set(m.curl, { uVelocity: vel.read.texture, texelSize: simTexel }),
      this.curl,
    )
    this.pass(
      this.set(m.vorticity, {
        uVelocity: vel.read.texture,
        uCurl: this.curl.texture,
        texelSize: simTexel,
        curlStrength: this.cfg.curl,
        dt,
      }),
      vel.write,
    )
    vel.swap()
    this.pass(
      this.set(m.divergence, {
        uVelocity: vel.read.texture,
        texelSize: simTexel,
      }),
      this.divergence,
    )
    this.pass(
      this.set(m.clear, {
        uTexture: pres.read.texture,
        value: this.cfg.pressureDecay,
      }),
      pres.write,
    )
    pres.swap()

    this.set(m.pressure, {
      uDivergence: this.divergence.texture,
      texelSize: simTexel,
    })
    for (let i = 0; i < this.cfg.pressureIterations; i++) {
      m.pressure.uniforms.uPressure.value = pres.read.texture
      this.pass(m.pressure, pres.write)
      pres.swap()
    }

    this.pass(
      this.set(m.gradientSubtract, {
        uPressure: pres.read.texture,
        uVelocity: vel.read.texture,
        texelSize: simTexel,
      }),
      vel.write,
    )
    vel.swap()

    this.set(m.advection, {
      uVelocity: vel.read.texture,
      uSource: vel.read.texture,
      texelSize: simTexel,
      dt,
      dissipation: this.cfg.velocityDissipation,
    })
    this.pass(m.advection, vel.write)
    vel.swap()

    this.set(m.advection, {
      uSource: dye.read.texture,
      texelSize: new THREE.Vector2(1 / this.dyeSize.w, 1 / this.dyeSize.h),
      dissipation: this.cfg.dyeDissipation,
    })
    this.pass(m.advection, dye.write)
    dye.swap()
  }

  start() {
    if (this.running) return
    this.running = true
    this.lastTime = Date.now()
    const tick = () => {
      if (!this.running) return
      const dt = Math.min((Date.now() - this.lastTime) / 1000, 0.016)
      this.lastTime = Date.now()
      if (this.mouse.moved) {
        this.splat()
        this.mouse.moved = false
      }
      /* splat touch accodati (tap/swipe): passano tutti dal punto mouse */
      if (this.queue.length) {
        for (const q of this.queue) {
          this.mouse.x = q.x
          this.mouse.y = q.y
          this.mouse.vx = q.vx
          this.mouse.vy = q.vy
          this.splat()
        }
        this.queue.length = 0
      }
      this.ink.lerp(this.inkTarget, 0.08)
      this.simulate(dt)
      this.pass(
        this.set(this.material.display, {
          uTexture: this.dye.read.texture,
          threshold: this.cfg.threshold,
          edgeSoftness: this.cfg.edgeSoftness,
          shade: this.cfg.shade,
          inkColor: this.ink,
        }),
      )
      this.raf = requestAnimationFrame(tick)
    }
    this.raf = requestAnimationFrame(tick)
  }

  stop() {
    this.running = false
    if (this.raf) cancelAnimationFrame(this.raf)
    this.raf = null
  }

  dispose() {
    this.stop()
    this.host.removeEventListener('pointermove', this.onMove)
    this.host.removeEventListener('touchstart', this.onTouchStart)
    this.host.removeEventListener('touchmove', this.onTouchMove)
    this.onResize.disconnect()
    this.targets.forEach((t) => t.dispose())
    Object.values(this.material).forEach((m) => m.dispose())
    this.quad.geometry.dispose()
    this.renderer.dispose()
  }
}

export function FluidTrail({
  color,
  className,
}: {
  /* colore inchiostro corrente (0-1), lerp-ato nel loop */
  color: RGB
  className?: string
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fluidRef = useRef<Fluid | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const host = canvas?.parentElement
    if (!canvas || !host) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    /* su touch la sim gira in versione coarse (tap + swipe, vedi Fluid) */
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches

    let fluid: Fluid
    try {
      fluid = new Fluid(canvas, host, { coarse: !fine })
    } catch {
      return /* niente WebGL: la hero vive benissimo senza scia */
    }
    fluidRef.current = fluid

    /* gira solo quando la hero è in viewport */
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) fluid.start()
        else fluid.stop()
      },
      { threshold: 0.05 },
    )
    io.observe(host)

    return () => {
      io.disconnect()
      fluid.dispose()
      fluidRef.current = null
    }
  }, [])

  useEffect(() => {
    fluidRef.current?.setColor(color)
  }, [color])

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />
}
