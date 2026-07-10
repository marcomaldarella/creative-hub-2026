'use client'

import { useEffect, useRef, useState } from 'react'
import styles from './HeroOrb.module.css'

/**
 * L'orb dell'hero: blob metallico renderizzato in three.js — icosaedro
 * displacciato con simplex noise, materiale chrome (env RoomEnvironment),
 * shell wireframe e luci cyan. Finché il WebGL non è pronto mostra il
 * poster jpg; con prefers-reduced-motion renderizza un solo frame statico.
 */
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
      let SimplexNoise: typeof import('three/addons/math/SimplexNoise.js').SimplexNoise
      let RoomEnvironment: typeof import('three/addons/environments/RoomEnvironment.js').RoomEnvironment
      try {
        THREE = await import('three')
        ;({ SimplexNoise } = await import('three/addons/math/SimplexNoise.js'))
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

      const geo = new THREE.IcosahedronGeometry(1, 28)
      const base = Float32Array.from(
        geo.attributes.position.array as Float32Array
      )

      const chrome = new THREE.MeshPhysicalMaterial({
        color: 0xc9cfd3,
        metalness: 1,
        roughness: 0.14,
        envMapIntensity: 1.5,
        emissive: 0x06333c,
        emissiveIntensity: 0.55,
      })
      const blob = new THREE.Mesh(geo, chrome)
      scene.add(blob)

      const wireMat = new THREE.MeshBasicMaterial({
        wireframe: true,
        color: 0x9fe4ef,
        transparent: true,
        opacity: 0.1,
      })
      const wire = new THREE.Mesh(geo, wireMat)
      wire.scale.setScalar(1.014)
      scene.add(wire)

      // riflessi elettrici cyan + key light fredda
      const cyanA = new THREE.PointLight(0x35d6e8, 22, 12)
      cyanA.position.set(1.9, -1.3, 1.6)
      const cyanB = new THREE.PointLight(0x2bb8cc, 12, 12)
      cyanB.position.set(-2.1, 1.7, -0.8)
      const key = new THREE.DirectionalLight(0xffffff, 1.5)
      key.position.set(-1.4, 2.2, 2.6)
      scene.add(cyanA, cyanB, key)

      const noise = new SimplexNoise()
      const pos = geo.attributes.position
      const v = new THREE.Vector3()

      const displace = (t: number) => {
        for (let i = 0; i < pos.count; i++) {
          v.fromArray(base, i * 3)
          const n =
            0.16 * noise.noise4d(v.x * 1.1, v.y * 1.1, v.z * 1.1, t * 0.28) +
            0.055 * noise.noise4d(v.x * 2.9, v.y * 2.9, v.z * 2.9, t * 0.6)
          const s = 1 + n
          pos.setXYZ(i, v.x * s, v.y * s, v.z * s)
        }
        pos.needsUpdate = true
        geo.computeVertexNormals()
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
        const t = 0.8 + (performance.now() - t0) / 1000
        displace(t)
        // lerp morbido verso il puntatore
        tilt.x += (pointer.y * 0.38 - tilt.x) * 0.045
        tilt.y += (pointer.x * 0.55 - tilt.y) * 0.045
        blob.rotation.x = tilt.x
        blob.rotation.y = t * 0.07 + tilt.y
        blob.rotation.z = Math.sin(t * 0.12) * 0.09
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
