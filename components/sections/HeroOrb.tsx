'use client'

import { useEffect, useRef, useState } from 'react'
import styles from './HeroOrb.module.css'

/**
 * L'orb dell'hero: blob di metallo liquido renderizzato in three.js.
 * Displacement interamente in vertex shader (simplex 3D + domain warp,
 * normali ricalcolate numericamente) su un icosaedro denso: superficie
 * definita e movimento fluido senza costi CPU. Chrome fisico con
 * clearcoat, shell wireframe e luci cyan. Tilt interattivo mouse/touch.
 * Poster jpg finché il WebGL non è pronto; frame statico con
 * prefers-reduced-motion.
 */

// snoise 3D (Ashima/IQ, standard) + campo fbm con domain warp
const NOISE_GLSL = /* glsl */ `
vec3 mod289(vec3 x){return x - floor(x * (1.0/289.0)) * 289.0;}
vec4 mod289(vec4 x){return x - floor(x * (1.0/289.0)) * 289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+10.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
float snoise(vec3 v){
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
    i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.5 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 105.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}

uniform float uTime;
uniform float uAmp;

/* campo fluido: fbm con domain warp che "scorre" nel tempo */
float field(vec3 n){
  float t = uTime;
  vec3 q = n * 1.35 + vec3(0.0, 0.0, t * 0.10);
  vec3 w = vec3(
    snoise(q),
    snoise(q + vec3(5.2, 1.3, 2.8)),
    snoise(q + vec3(1.7, 9.2, 3.1))
  );
  vec3 p = n * 1.55 + 0.62 * w + vec3(t * 0.085, t * 0.06, -t * 0.075);
  float v = 0.0;
  v += 0.58 * snoise(p);
  v += 0.30 * snoise(p * 2.15 + vec3(t * 0.12));
  v += 0.12 * snoise(p * 4.4);
  return v;
}

vec3 orbDisplace(vec3 n){
  return n * (1.0 + uAmp * field(n));
}
`

// sostituisce begin_vertex + beginnormal_vertex: posizione displacciata e
// normale ricostruita da due vicini sulla sfera unitaria
const VERTEX_PATCH = /* glsl */ `
vec3 nDir = normalize(position);
vec3 tangA = normalize(cross(nDir, abs(nDir.y) < 0.99 ? vec3(0.0,1.0,0.0) : vec3(1.0,0.0,0.0)));
vec3 tangB = cross(nDir, tangA);
float eps = 0.012;
vec3 dP0 = orbDisplace(nDir);
vec3 dPA = orbDisplace(normalize(nDir + eps * tangA));
vec3 dPB = orbDisplace(normalize(nDir + eps * tangB));
vec3 orbNormal = normalize(cross(dPA - dP0, dPB - dP0));
`

export function HeroOrb({ className }: { className?: string }) {
  const hostRef = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return

    let disposed = false
    let cleanup: (() => void) | undefined

    ;(async () => {
      let THREE: typeof import('three')
      let RoomEnvironment: typeof import('three/addons/environments/RoomEnvironment.js').RoomEnvironment
      try {
        THREE = await import('three')
        ;({ RoomEnvironment } = await import(
          'three/addons/environments/RoomEnvironment.js'
        ))
      } catch {
        return // WebGL/moduli non disponibili: resta il poster
      }
      if (disposed) return

      let renderer: import('three').WebGLRenderer
      try {
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
      } catch {
        return
      }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.domElement.className = styles.canvas
      host.appendChild(renderer.domElement)

      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 20)
      camera.position.set(0, 0, 3.4)

      const pmrem = new THREE.PMREMGenerator(renderer)
      const env = pmrem.fromScene(new RoomEnvironment(), 0.04)
      scene.environment = env.texture

      // uniforms condivise tra chrome e wireframe
      const uTime = { value: 0.8 }
      const uAmp = { value: 0.24 }

      const patchShader = (shader: { uniforms: Record<string, unknown>; vertexShader: string }) => {
        shader.uniforms.uTime = uTime
        shader.uniforms.uAmp = uAmp
        shader.vertexShader = shader.vertexShader
          .replace(
            '#include <common>',
            `#include <common>\n${NOISE_GLSL}`
          )
          .replace(
            '#include <beginnormal_vertex>',
            `${VERTEX_PATCH}\nvec3 objectNormal = orbNormal;\n#ifdef USE_TANGENT\nvec3 objectTangent = vec3( tangent.xyz );\n#endif`
          )
          .replace(
            '#include <begin_vertex>',
            // autosufficiente: nel basic (wireframe) il chunk delle normali non c'è
            'vec3 transformed = orbDisplace(normalize(position));'
          )
      }

      // geometria densa: il displacement è in GPU, la CPU non la tocca più
      const geo = new THREE.IcosahedronGeometry(1, 80)

      const chrome = new THREE.MeshPhysicalMaterial({
        color: 0xd2d8dc,
        metalness: 1,
        roughness: 0.07,
        clearcoat: 0.65,
        clearcoatRoughness: 0.22,
        envMapIntensity: 1.7,
        emissive: 0x06333c,
        emissiveIntensity: 0.5,
      })
      chrome.onBeforeCompile = patchShader
      const blob = new THREE.Mesh(geo, chrome)
      scene.add(blob)

      const wireGeo = new THREE.IcosahedronGeometry(1.012, 40)
      const wireMat = new THREE.MeshBasicMaterial({
        wireframe: true,
        color: 0x9fe4ef,
        transparent: true,
        opacity: 0.09,
      })
      wireMat.onBeforeCompile = patchShader
      const wire = new THREE.Mesh(wireGeo, wireMat)
      scene.add(wire)

      // riflessi elettrici cyan + key light fredda
      const cyanA = new THREE.PointLight(0x35d6e8, 22, 12)
      cyanA.position.set(1.9, -1.3, 1.6)
      const cyanB = new THREE.PointLight(0x2bb8cc, 12, 12)
      cyanB.position.set(-2.1, 1.7, -0.8)
      const key = new THREE.DirectionalLight(0xffffff, 1.5)
      key.position.set(-1.4, 2.2, 2.6)
      scene.add(cyanA, cyanB, key)

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

      // interattività: il solido si inclina verso il puntatore (mouse/touch)
      const pointer = { x: 0, y: 0 }
      const tilt = { x: 0, y: 0 }
      const onPointerMove = (e: PointerEvent) => {
        const r = host.getBoundingClientRect()
        pointer.x = ((e.clientX - (r.left + r.width / 2)) / r.width) * 2
        pointer.y = ((e.clientY - (r.top + r.height / 2)) / r.height) * 2
      }
      window.addEventListener('pointermove', onPointerMove, { passive: true })

      let raf = 0
      const t0 = performance.now()
      const frame = () => {
        uTime.value = 0.8 + (performance.now() - t0) / 1000
        tilt.x += (pointer.y * 0.38 - tilt.x) * 0.045
        tilt.y += (pointer.x * 0.55 - tilt.y) * 0.045
        blob.rotation.x = tilt.x
        blob.rotation.y = uTime.value * 0.06 + tilt.y
        blob.rotation.z = Math.sin(uTime.value * 0.1) * 0.08
        wire.rotation.copy(blob.rotation)
        renderer.render(scene, camera)
        if (!reduced) raf = requestAnimationFrame(frame)
      }
      frame()
      setReady(true)

      cleanup = () => {
        cancelAnimationFrame(raf)
        window.removeEventListener('pointermove', onPointerMove)
        ro.disconnect()
        env.texture.dispose()
        pmrem.dispose()
        geo.dispose()
        wireGeo.dispose()
        chrome.dispose()
        wireMat.dispose()
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
      aria-hidden="true"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/img/hero-orb.jpg" alt="" className={styles.poster} />
    </div>
  )
}
