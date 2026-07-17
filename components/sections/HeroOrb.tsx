'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import styles from './HeroOrb.module.css'

/**
 * L'orb dell'hero: sfera di particelle (Fibonacci sphere, ~380k punti)
 * displacciata in vertex shader con simplex 3D + rigonfiamento morbido
 * verso il cursore. Palette monocroma che segue il tema del sito.
 * Zone "hot" direzionali attorno alla sfera: puntando a sinistra/alto/
 * destra si accendono le HUD delle tre sezioni principali
 * (academy / coworking / recording) con linea, punto e testo in stagger.
 * Particelle ambient rade sullo sfondo, fuori dalla rotazione.
 */

const PARTICLES = 380000
const RADIUS = 1.42

const NOISE_GLSL = /* glsl */ `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0);const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.0-g;vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857;vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z);
  vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0;vec4 s1=floor(b1)*2.0+1.0;vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}
`

type Zone = 'l' | 'r' | 't' | null

const HUD_LABELS: { zone: Exclude<Zone, null>; label: string }[] = [
  { zone: 'l', label: 'Academy' },
  { zone: 't', label: 'Coworking' },
  { zone: 'r', label: 'Recording' },
]

export function HeroOrb({
  className,
  hrefs,
}: {
  className?: string
  /** destinazioni delle zone hot: [academy, coworking, recording] */
  hrefs?: [string, string, string]
}) {
  const hostRef = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(false)
  const [zone, setZone] = useState<Zone>(null)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return

    let disposed = false
    let cleanup: (() => void) | undefined

    ;(async () => {
      let THREE: typeof import('three')
      try {
        THREE = await import('three')
      } catch {
        return // WebGL/moduli non disponibili
      }
      if (disposed) return

      let renderer: import('three').WebGLRenderer
      try {
        renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true })
      } catch {
        return
      }
      const dpr = Math.min(window.devicePixelRatio, 1.75)
      renderer.setPixelRatio(dpr)
      renderer.domElement.className = styles.canvas
      renderer.domElement.setAttribute('aria-hidden', 'true')
      host.appendChild(renderer.domElement)

      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100)
      camera.position.z = 4.4

      /* ——— sfera: Fibonacci + guscio sottile ——— */
      const pos = new Float32Array(PARTICLES * 3)
      const rnd = new Float32Array(PARTICLES)
      const gold = Math.PI * (3 - Math.sqrt(5))
      for (let i = 0; i < PARTICLES; i++) {
        const y = 1 - (i / (PARTICLES - 1)) * 2
        const rr = Math.sqrt(Math.max(0, 1 - y * y))
        const th = gold * i
        const r = RADIUS + (Math.random() - 0.5) * 0.055
        pos[i * 3] = Math.cos(th) * rr * r
        pos[i * 3 + 1] = y * r
        pos[i * 3 + 2] = Math.sin(th) * rr * r
        rnd[i] = Math.random()
      }
      const geo = new THREE.BufferGeometry()
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
      geo.setAttribute('aRnd', new THREE.BufferAttribute(rnd, 1))

      const uniforms = {
        uTime: { value: 0 },
        uPointer: { value: 0 },
        uPointerDir: { value: new THREE.Vector3(0, 0, 1) },
        uTheme: { value: 0 },
        uSize: { value: 4.4 * dpr },
      }

      const mat = new THREE.ShaderMaterial({
        uniforms,
        transparent: true,
        depthWrite: false,
        blending: THREE.NormalBlending,
        vertexShader: /* glsl */ `
          ${NOISE_GLSL}
          uniform float uTime;
          uniform float uPointer;
          uniform vec3  uPointerDir;
          uniform float uSize;
          attribute float aRnd;
          varying float vGlow;
          varying float vFace;
          varying float vBand;
          varying float vTwk;
          varying float vHalo;
          varying float vTemp;

          vec3 displace(vec3 p){
            vec3 n = normalize(p);
            float t = uTime*0.13;
            float amp = 1.0 + uPointer*0.9;
            float d  = snoise(n*1.1 + vec3(0.0, t, 0.0)) * 0.095 * amp;
            d += snoise(n*2.3 + vec3(t*0.55, 0.0, t*0.3)) * 0.045 * amp;
            d += snoise(n*4.6 - vec3(0.0, 0.0, t*0.5)) * 0.018 * amp;
            // rigonfiamento morbido verso il cursore
            float facing = max(dot(n, normalize(uPointerDir+0.0001)), 0.0);
            d += pow(facing,1.6) * uPointer * 0.20;
            return p + n * d;
          }
          void main(){
            vec3 n0 = normalize(position);
            // correnti tangenziali: bande che scorrono sulla superficie
            float drift = snoise(n0*0.9 + vec3(0.0, uTime*0.045, 0.0)) * (0.16 + uPointer*0.06);
            float ca = cos(drift), sa = sin(drift);
            vec3 pr = vec3(position.x*ca - position.z*sa,
                           position.y,
                           position.x*sa + position.z*ca);
            vec3 n = normalize(pr);
            // vortice sotto il cursore: il mouse mescola la nuvola
            vec3 pdir = normalize(uPointerDir + 0.0001);
            float facing = max(dot(n, pdir), 0.0);
            vec3 swirl = normalize(cross(n, pdir) + 0.0001);
            pr += swirl * pow(facing, 2.2) * uPointer * 0.07
                * sin(uTime*0.6 + aRnd*6.2831);
            vec3 p = displace(pr);
            // alone: il 7% delle particelle vive su un guscio esterno che respira
            vHalo = step(0.93, aRnd);
            p *= 1.0 + vHalo * (0.09 + 0.05*sin(uTime*0.32 + aRnd*40.0));
            vGlow = length(p) - ${RADIUS.toFixed(2)};
            // fronte di densità: una macro-onda di luce che attraversa la sfera
            vBand = 0.72 + 0.28*snoise(n*1.5 + vec3(uTime*0.05, 0.0, uTime*0.032));
            // twinkle individuale, lento e sfasato
            vTwk = 0.86 + 0.14*sin(uTime*(0.5 + aRnd*1.3) + aRnd*6.2831);
            vTemp = aRnd;
            // orientamento verso la camera: davanti pieno, retro in penombra
            vec3 vn = normalize((modelViewMatrix * vec4(n, 0.0)).xyz);
            vFace = clamp(vn.z, 0.0, 1.0);
            vec4 mv = modelViewMatrix * vec4(p,1.0);
            gl_Position = projectionMatrix * mv;
            gl_PointSize = uSize * (1.0 / -mv.z)
              * (0.85 + aRnd*0.3)
              * (0.7 + 0.5*vFace)     // i punti dietro rimpiccioliscono: volume
              * (1.0 - vHalo*0.35);   // l'alone è fatto di grani più fini
          }
        `,
        fragmentShader: /* glsl */ `
          precision mediump float;
          uniform float uTheme;
          varying float vGlow;
          varying float vFace;
          varying float vBand;
          varying float vTwk;
          varying float vHalo;
          varying float vTemp;
          void main(){
            vec2 c = gl_PointCoord - 0.5;
            float dd = dot(c,c);
            if(dd > 0.25) discard;
            float a = smoothstep(0.25, 0.05, dd);          // punto definito
            float core = smoothstep(0.07, 0.0, dd);        // nucleo brillante
            float b = clamp(vGlow*1.6, -0.2, 0.3) + 0.5;   // estruso = più chiaro
            vec3 darkP  = mix(vec3(0.20,0.21,0.23), vec3(0.45,0.46,0.49), b); // tema light
            vec3 lightP = mix(vec3(0.60,0.68,0.76), vec3(0.95,0.97,1.0), b);  // tema dark
            vec3 col = mix(darkP, lightP, uTheme);
            col *= 0.45 + 0.75*vFace;                      // chiaroscuro: il retro affonda
            col *= vBand * vTwk;                           // fronti di densità + twinkle
            // micro-temperatura per grano: monocromo più ricco
            col *= mix(vec3(1.025, 1.0, 0.965), vec3(0.965, 1.0, 1.035), vTemp);
            col += core * mix(0.08, 0.20, uTheme) * vBand; // scintilla sul davanti
            float alpha = a * (0.28 + 0.48*vFace) * (1.0 - vHalo*0.45);
            gl_FragColor = vec4(col, alpha);
          }
        `,
      })

      const points = new THREE.Points(geo, mat)
      const group = new THREE.Group()
      group.add(points)
      scene.add(group)

      /* ——— particelle ambient di sfondo (fuori dal group: non ruotano) ——— */
      const BG_N = 220
      const bgPos = new Float32Array(BG_N * 3)
      const bgRnd = new Float32Array(BG_N)
      for (let i = 0; i < BG_N; i++) {
        bgPos[i * 3] = (Math.random() - 0.5) * 3.4
        bgPos[i * 3 + 1] = (Math.random() - 0.5) * 3.0
        bgPos[i * 3 + 2] = -0.3 - Math.random() * 3.0
        bgRnd[i] = Math.random()
      }
      const bgGeo = new THREE.BufferGeometry()
      bgGeo.setAttribute('position', new THREE.BufferAttribute(bgPos, 3))
      bgGeo.setAttribute('aRnd', new THREE.BufferAttribute(bgRnd, 1))
      const bgMat = new THREE.ShaderMaterial({
        uniforms: {
          uTime: uniforms.uTime,
          uTheme: uniforms.uTheme,
          uSize: { value: 16.0 * dpr },
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.NormalBlending,
        vertexShader: /* glsl */ `
          uniform float uTime; uniform float uSize; attribute float aRnd; varying float vA;
          void main(){
            vec3 p = position;
            p.y += sin(uTime*0.16 + aRnd*6.2831)*0.45;
            p.x += cos(uTime*0.12 + aRnd*6.2831)*0.38;
            vA = 0.22 + 0.24*aRnd;
            vec4 mv = modelViewMatrix * vec4(p,1.0);
            gl_Position = projectionMatrix * mv;
            gl_PointSize = uSize * (0.6 + aRnd*0.8) * (1.0/-mv.z);
          }
        `,
        fragmentShader: /* glsl */ `
          precision mediump float; uniform float uTheme; varying float vA;
          void main(){
            vec2 c = gl_PointCoord-0.5; float dd = dot(c,c);
            if(dd>0.25) discard;
            float a = smoothstep(0.25,0.02,dd)*vA;
            vec3 col = mix(vec3(0.28,0.28,0.31), vec3(0.80,0.84,0.90), uTheme);
            gl_FragColor = vec4(col, a);
          }
        `,
      })
      const bgPoints = new THREE.Points(bgGeo, bgMat)
      scene.add(bgPoints)

      /* ——— tema: segue [data-theme] del sito ——— */
      const themeOf = () =>
        document.documentElement.getAttribute('data-theme') === 'dark' ? 1 : 0
      let themeTarget = themeOf()
      uniforms.uTheme.value = themeTarget
      const mo = new MutationObserver(() => {
        themeTarget = themeOf()
      })
      mo.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-theme'],
      })

      /* ——— interazione: tilt + zone hot direzionali ——— */
      const touch = window.matchMedia('(hover: none)').matches
      const mouse = { x: 0, y: 0 }
      const target = { rx: 0, ry: 0 }
      const current = { rx: 0, ry: 0 }
      let pointerTarget = 0
      let pointerCur = 0
      let activeZone: Zone = null

      const setZoneOnce = (z: Zone) => {
        if (z !== activeZone) {
          activeZone = z
          setZone(z)
        }
      }

      const onPointerMove = (e: PointerEvent) => {
        if (touch) return // su touch guida l'autoplay, non il drag
        const r = host.getBoundingClientRect()
        // fuori dall'hero (sotto il bordo inferiore dello stage): spegni
        if (e.clientY > r.bottom + 80) {
          pointerTarget = 0
          setZoneOnce(null)
          return
        }
        const cx = r.left + r.width / 2
        const cy = r.top + r.height / 2
        // normalizzazione sul semi-lato dello stage: la sfera è il riferimento
        const nx = (e.clientX - cx) / (r.width / 2)
        const ny = -((e.clientY - cy) / (r.height / 2))
        mouse.x = nx
        mouse.y = ny
        target.ry = nx * 0.75
        target.rx = ny * 0.55
        pointerTarget = 1

        const rad = Math.hypot(nx, ny)
        if (rad < 0.28) {
          setZoneOnce(null)
        } else {
          // settori allineati alle label: alto-sx (academy),
          // alto-dx (recording), basso-dx (coworking)
          const a = (Math.atan2(ny, nx) * 180) / Math.PI
          if (a >= 5 && a < 90) setZoneOnce('r')
          else if (a >= 90 && a < 175) setZoneOnce('l')
          else if (a < -5 && a >= -90) setZoneOnce('t')
          else setZoneOnce(null)
        }
      }
      const onPointerLeave = () => {
        pointerTarget = 0
        setZoneOnce(null)
        target.rx = 0
        target.ry = 0
      }
      window.addEventListener('pointermove', onPointerMove, { passive: true })
      document.documentElement.addEventListener('pointerleave', onPointerLeave)

      /* ——— autoplay su touch: cicla le zone e gonfia la sfera verso la label ——— */
      const AUTO_DIR: Record<Exclude<Zone, null>, [number, number]> = {
        l: [-0.7, 0.6],
        t: [0.7, -0.6],
        r: [0.7, 0.6],
      }
      const AUTO_SEQ: Exclude<Zone, null>[] = ['l', 't', 'r']
      let autoIdx = 0
      const autoTimers: ReturnType<typeof setTimeout>[] = []
      const autoStep = () => {
        const z = AUTO_SEQ[autoIdx % AUTO_SEQ.length]
        autoIdx++
        const [ax, ay] = AUTO_DIR[z]
        mouse.x = ax
        mouse.y = ay
        target.ry = ax * 0.55
        target.rx = ay * 0.4
        pointerTarget = 1
        setZoneOnce(z)
        // label visibile ~3.2s, poi pausa breve prima della prossima
        autoTimers.push(
          setTimeout(() => {
            setZoneOnce(null)
            pointerTarget = 0
            autoTimers.push(setTimeout(autoStep, 1100))
          }, 3200)
        )
      }

      const resize = () => {
        const w = host.clientWidth
        const h = host.clientHeight
        if (!w || !h) return
        renderer.setSize(w, h)
        camera.aspect = w / h
        camera.updateProjectionMatrix()
      }
      resize()
      const ro = new ResizeObserver(resize)
      ro.observe(host)

      const reduced = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches

      // niente puntatore: le zone si presentano da sole (senza navigare)
      if (touch && !reduced) autoTimers.push(setTimeout(autoStep, 1600))

      let raf = 0
      const t0 = performance.now()
      const frame = () => {
        const t = (performance.now() - t0) / 1000
        uniforms.uTime.value = t

        current.rx += (target.rx - current.rx) * 0.038
        current.ry += (target.ry - current.ry) * 0.038
        pointerCur += (pointerTarget - pointerCur) * 0.035
        uniforms.uPointer.value = pointerCur
        uniforms.uTheme.value += (themeTarget - uniforms.uTheme.value) * 0.06

        group.rotation.y = current.ry + t * 0.022
        group.rotation.x = current.rx + Math.sin(t * 0.22) * 0.05
        // galleggiamento: bob leggero + oscillazione laterale
        group.position.y = Math.sin(t * 0.45) * 0.045
        group.position.x = Math.sin(t * 0.31 + 1.7) * 0.03

        uniforms.uPointerDir.value.set(mouse.x, mouse.y, 0.85).normalize()
        renderer.render(scene, camera)
        if (!reduced) raf = requestAnimationFrame(frame)
      }
      frame()
      setReady(true)

      cleanup = () => {
        cancelAnimationFrame(raf)
        autoTimers.forEach(clearTimeout)
        window.removeEventListener('pointermove', onPointerMove)
        document.documentElement.removeEventListener(
          'pointerleave',
          onPointerLeave
        )
        mo.disconnect()
        ro.disconnect()
        geo.dispose()
        bgGeo.dispose()
        mat.dispose()
        bgMat.dispose()
        renderer.dispose()
        renderer.domElement.remove()
      }
    })()

    return () => {
      disposed = true
      cleanup?.()
    }
  }, [])

  return (
    <div
      ref={hostRef}
      className={[styles.host, ready ? styles.ready : '', className]
        .filter(Boolean)
        .join(' ')}
    >
      {HUD_LABELS.map(({ zone: z, label }, i) => {
        const href = hrefs?.[i]
        const cls = [
          styles.hud,
          styles[`hud_${z}`],
          zone === z ? styles.on : '',
        ]
          .filter(Boolean)
          .join(' ')
        const inner = (
          <>
            <span className={styles.hudTxt}>{label}</span>
            <span className={styles.hudArm} aria-hidden="true">
              <span className={styles.hudLn} />
              <span className={styles.hudDot} />
            </span>
          </>
        )
        return href ? (
          <Link key={z} href={href} className={cls}>
            {inner}
          </Link>
        ) : (
          <div key={z} className={cls} aria-hidden="true">
            {inner}
          </div>
        )
      })}
    </div>
  )
}
