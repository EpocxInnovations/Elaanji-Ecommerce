import {
  Camera,
  Mesh,
  Plane,
  Program,
  Renderer,
  Texture,
  Transform,
} from 'ogl'
import { useEffect, useRef } from 'react'

function debounce(func, wait) {
  let timeout
  return function (...args) {
    clearTimeout(timeout)
    timeout = setTimeout(() => func.apply(this, args), wait)
  }
}

function lerp(p1, p2, t) {
  return p1 + (p2 - p1) * t
}

function autoBind(instance) {
  const proto = Object.getPrototypeOf(instance)
  Object.getOwnPropertyNames(proto).forEach((key) => {
    if (key !== 'constructor' && typeof instance[key] === 'function') {
      instance[key] = instance[key].bind(instance)
    }
  })
}

class Media {
  constructor({
    geometry,
    gl,
    image,
    index,
    length,
    renderer,
    scene,
    screen,
    text,
    subtext,
    viewport,
    bend,
    borderRadius = 0.05,
    rawItem,
  }) {
    this.geometry = geometry
    this.gl = gl
    this.image = image
    this.index = index
    this.length = length
    this.renderer = renderer
    this.scene = scene
    this.screen = screen
    this.text = text
    this.subtext = subtext
    this.viewport = viewport
    this.bend = bend
    this.borderRadius = borderRadius
    this.rawItem = rawItem

    this.extra = 0
    this.widthTotal = 0
    this.width = 0
    this.x = 0
    this.scale = 1
    this.padding = 1.4
    this.speed = 0
    this.isBefore = false
    this.isAfter = false

    this.createShader()
    this.createMesh()
    this.onResize()
  }

  createShader() {
    const texture = new Texture(this.gl, { generateMipmaps: true })
    this.program = new Program(this.gl, {
      depthTest: true,
      depthWrite: true,
      vertex: `
        precision highp float;
        attribute vec3 position;
        attribute vec2 uv;
        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;
        uniform float uTime;
        uniform float uSpeed;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          vec3 p = position;
          p.z = (sin(p.x * 3.5 + uTime) * 1.1 + cos(p.y * 2.0 + uTime) * 1.1) * (0.05 + min(abs(uSpeed) * 0.3, 0.35));
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        }
      `,
      fragment: `
        precision highp float;
        uniform vec2 uImageSizes;
        uniform vec2 uPlaneSizes;
        uniform sampler2D tMap;
        uniform float uBorderRadius;
        varying vec2 vUv;
        
        float roundedBoxSDF(vec2 p, vec2 b, float r) {
          vec2 d = abs(p) - b;
          return length(max(d, vec2(0.0))) + min(max(d.x, d.y), 0.0) - r;
        }
        
        void main() {
          vec2 ratio = vec2(
            min((uPlaneSizes.x / uPlaneSizes.y) / (uImageSizes.x / uImageSizes.y), 1.0),
            min((uPlaneSizes.y / uPlaneSizes.x) / (uImageSizes.y / uImageSizes.x), 1.0)
          );
          vec2 uv = vec2(
            vUv.x * ratio.x + (1.0 - ratio.x) * 0.5,
            vUv.y * ratio.y + (1.0 - ratio.y) * 0.5
          );
          vec4 color = texture2D(tMap, uv);
          
          float d = roundedBoxSDF(vUv - 0.5, vec2(0.5 - uBorderRadius), uBorderRadius);
          float edgeSmooth = 0.003;
          float alpha = 1.0 - smoothstep(-edgeSmooth, edgeSmooth, d);
          
          gl_FragColor = vec4(color.rgb, alpha);
        }
      `,
      uniforms: {
        tMap: { value: texture },
        uPlaneSizes: { value: [0, 0] },
        uImageSizes: { value: [0, 0] },
        uSpeed: { value: 0 },
        uTime: { value: 100 * Math.random() },
        uBorderRadius: { value: this.borderRadius },
      },
      transparent: true,
    })

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = this.image
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const targetW = img.naturalWidth || 900
      const targetH = img.naturalHeight || 1200
      canvas.width = targetW
      canvas.height = targetH
      const ctx = canvas.getContext('2d')

      // 1. Draw base authentic saree photo
      ctx.drawImage(img, 0, 0, targetW, targetH)

      // 2. Draw cinematic luxury dark gradient on the bottom
      const gradH = Math.round(targetH * 0.46)
      const grad = ctx.createLinearGradient(0, targetH - gradH, 0, targetH)
      grad.addColorStop(0, 'rgba(10, 9, 8, 0)')
      grad.addColorStop(0.25, 'rgba(10, 9, 8, 0.35)')
      grad.addColorStop(0.7, 'rgba(10, 9, 8, 0.85)')
      grad.addColorStop(1, 'rgba(10, 9, 8, 0.96)')
      ctx.fillStyle = grad
      ctx.fillRect(0, targetH - gradH, targetW, gradH)

      // 3. Layout positions
      const padLeft = Math.round(targetW * 0.075)
      const baseBottom = targetH - Math.round(targetH * 0.075)

      // 4. Draw Subtitle / Tag (e.g. "TAMIL NADU · HERITAGE")
      if (this.subtext) {
        ctx.font = `600 ${Math.round(targetW * 0.034)}px "Inter", sans-serif`
        ctx.fillStyle = '#D4AF37' // Luxury gold
        ctx.textBaseline = 'bottom'
        ctx.textAlign = 'left'
        ctx.fillText(this.subtext.toUpperCase(), padLeft, baseBottom - Math.round(targetW * 0.105))
      }

      // 5. Draw Main Category Title (e.g. "KANJIVARAM SILK")
      ctx.font = `bold ${Math.round(targetW * 0.065)}px "Cinzel", Georgia, serif`
      ctx.fillStyle = '#FAF7F2' // Warm paper ivory
      ctx.textBaseline = 'bottom'
      ctx.textAlign = 'left'
      ctx.fillText(this.text, padLeft, baseBottom - Math.round(targetW * 0.022))

      // 6. Draw Gold Accent Hairline below Title
      ctx.strokeStyle = '#D4AF37'
      ctx.lineWidth = Math.max(2, Math.round(targetW * 0.004))
      ctx.beginPath()
      ctx.moveTo(padLeft, baseBottom + Math.round(targetW * 0.012))
      ctx.lineTo(padLeft + Math.round(targetW * 0.32), baseBottom + Math.round(targetW * 0.012))
      ctx.stroke()

      // Assign composite canvas as texture
      texture.image = canvas
      this.program.uniforms.uImageSizes.value = [targetW, targetH]
    }
  }

  createMesh() {
    this.plane = new Mesh(this.gl, {
      geometry: this.geometry,
      program: this.program,
    })
    this.plane.setParent(this.scene)
  }

  update(scroll, direction) {
    this.plane.position.x = this.x - scroll.current - this.extra

    const x = this.plane.position.x
    const H = this.viewport.width / 2

    if (this.bend === 0) {
      this.plane.position.y = 0
      this.plane.position.z = 0
      this.plane.rotation.y = 0
      this.plane.rotation.z = 0
    } else {
      const B_abs = Math.abs(this.bend)
      const R = (H * H + B_abs * B_abs) / (2 * B_abs)
      const effectiveX = Math.min(Math.abs(x), H)
      const arc = R - Math.sqrt(Math.max(0, R * R - effectiveX * effectiveX))

      // True 3D cylinder depth: curves cards backwards into screen
      this.plane.position.z = -arc * 1.5
      this.plane.rotation.y = -Math.sign(x) * Math.asin(effectiveX / R) * 0.95
      this.plane.position.y = -arc * 0.12
      this.plane.rotation.z = -Math.sign(x) * Math.asin(effectiveX / R) * 0.08
    }

    this.speed = scroll.current - scroll.last
    this.program.uniforms.uTime.value += 0.035
    this.program.uniforms.uSpeed.value = this.speed

    const planeOffset = this.plane.scale.x / 2
    const viewportOffset = this.viewport.width / 2
    this.isBefore = this.plane.position.x + planeOffset < -viewportOffset
    this.isAfter = this.plane.position.x - planeOffset > viewportOffset

    if (direction === 'right' && this.isBefore) {
      this.extra -= this.widthTotal
      this.isBefore = this.isAfter = false
    }
    if (direction === 'left' && this.isAfter) {
      this.extra += this.widthTotal
      this.isBefore = this.isAfter = false
    }
  }

  onResize({ screen, viewport } = {}) {
    if (screen) this.screen = screen
    if (viewport) {
      this.viewport = viewport
      if (this.plane.program.uniforms.uViewportSizes) {
        this.plane.program.uniforms.uViewportSizes.value = [this.viewport.width, this.viewport.height]
      }
    }
    this.scale = this.screen.height / 1500
    this.plane.scale.y = (this.viewport.height * (880 * this.scale)) / this.screen.height
    this.plane.scale.x = (this.viewport.width * (630 * this.scale)) / this.screen.width
    this.program.uniforms.uPlaneSizes.value = [this.plane.scale.x, this.plane.scale.y]
    this.padding = 1.4
    this.width = this.plane.scale.x + this.padding
    this.widthTotal = this.width * this.length
    this.x = this.width * this.index
  }
}

class CircularGalleryApp {
  constructor(container, {
    items = [],
    bend = 2.4,
    borderRadius = 0.05,
    scrollSpeed = 1.8,
    scrollEase = 0.06,
    onItemClick,
  }) {
    this.container = container
    this.scrollSpeed = scrollSpeed
    this.scroll = { ease: scrollEase, current: 0, target: 0, last: 0, position: 0 }
    this.onItemClick = onItemClick
    this.onCheckDebounce = debounce(this.onCheck.bind(this), 200)

    this.isDown = false
    this.startX = 0
    this.startY = 0
    this.hasMoved = false
    this.isPaused = false

    autoBind(this)

    this.createRenderer()
    this.createCamera()
    this.createScene()
    this.onResize()
    this.createGeometry()
    this.createMedias(items, bend, borderRadius)
    this.update()
    this.addEventListeners()
  }

  createRenderer() {
    this.renderer = new Renderer({
      alpha: true,
      antialias: true,
      dpr: Math.min(window.devicePixelRatio || 1, 2),
    })
    this.gl = this.renderer.gl
    this.gl.clearColor(0, 0, 0, 0)
    this.container.appendChild(this.gl.canvas)
  }

  createCamera() {
    this.camera = new Camera(this.gl)
    this.camera.fov = 45
    this.camera.position.z = 20
  }

  createScene() {
    this.scene = new Transform()
  }

  createGeometry() {
    this.planeGeometry = new Plane(this.gl, {
      heightSegments: 40,
      widthSegments: 80,
    })
  }

  createMedias(items, bend, borderRadius) {
    if (!items || items.length === 0) return

    // Auto-tile minimal items so the circumference always has at least 12 items for seamless cylinder
    let tiledItems = [...items]
    while (tiledItems.length < 12) {
      tiledItems = [...tiledItems, ...items]
    }
    // Duplicate once more to ensure clean infinite wrapping
    tiledItems = [...tiledItems, ...tiledItems]

    this.mediasImages = tiledItems
    this.medias = this.mediasImages.map((data, index) => {
      return new Media({
        geometry: this.planeGeometry,
        gl: this.gl,
        image: data.image,
        index,
        length: this.mediasImages.length,
        renderer: this.renderer,
        scene: this.scene,
        screen: this.screen,
        text: data.text || data.label || '',
        subtext: data.subtext || data.tag || '',
        viewport: this.viewport,
        bend,
        borderRadius,
        rawItem: data,
      })
    })
  }

  onTouchDown(e) {
    this.isDown = true
    this.hasMoved = false
    this.isPaused = true
    this.scroll.position = this.scroll.current
    this.startX = 'touches' in e ? e.touches[0].clientX : e.clientX
    this.startY = 'touches' in e ? e.touches[0].clientY : e.clientY
  }

  onTouchMove(e) {
    if (!this.isDown) return
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    const dist = Math.abs(this.startX - clientX)
    if (dist > 6) {
      this.hasMoved = true
    }
    const distance = (this.startX - clientX) * (this.scrollSpeed * 0.022)
    this.scroll.target = this.scroll.position + distance
  }

  onTouchUp() {
    if (!this.isDown) return
    this.isDown = false
    this.isPaused = false
    this.onCheck()

    // If tap/click without dragging, trigger navigation on center-most clicked item
    if (!this.hasMoved && this.onItemClick && this.medias) {
      let closest = null
      let minDist = Infinity
      this.medias.forEach((m) => {
        const d = Math.abs(m.plane.position.x)
        if (d < minDist) {
          minDist = d
          closest = m
        }
      })
      if (closest && closest.rawItem) {
        this.onItemClick(closest.rawItem)
      }
    }
  }

  onWheel(e) {
    const delta = e.deltaY || e.wheelDelta || e.detail
    this.scroll.target += (delta > 0 ? this.scrollSpeed : -this.scrollSpeed) * 0.18
    this.onCheckDebounce()
  }

  onCheck() {
    if (!this.medias || !this.medias[0]) return
    const width = this.medias[0].width
    const itemIndex = Math.round(Math.abs(this.scroll.target) / width)
    const item = width * itemIndex
    this.scroll.target = this.scroll.target < 0 ? -item : item
  }

  onResize() {
    this.screen = {
      width: this.container.clientWidth,
      height: this.container.clientHeight,
    }
    this.renderer.setSize(this.screen.width, this.screen.height)
    this.camera.perspective({
      aspect: this.screen.width / this.screen.height,
    })
    const fov = (this.camera.fov * Math.PI) / 180
    const height = 2 * Math.tan(fov / 2) * this.camera.position.z
    const width = height * this.camera.aspect
    this.viewport = { width, height }
    if (this.medias) {
      this.medias.forEach((media) =>
        media.onResize({ screen: this.screen, viewport: this.viewport })
      )
    }
  }

  next() {
    if (!this.medias || !this.medias[0]) return
    this.scroll.target += this.medias[0].width
    this.onCheckDebounce()
  }

  prev() {
    if (!this.medias || !this.medias[0]) return
    this.scroll.target -= this.medias[0].width
    this.onCheckDebounce()
  }

  update() {
    // Subtle auto-drift when user is not interacting
    if (!this.isPaused && !this.isDown) {
      this.scroll.target += 0.008
    }

    this.scroll.current = lerp(
      this.scroll.current,
      this.scroll.target,
      this.scroll.ease
    )
    const direction = this.scroll.current > this.scroll.last ? 'right' : 'left'
    if (this.medias) {
      this.medias.forEach((media) => media.update(this.scroll, direction))
    }
    this.renderer.render({ scene: this.scene, camera: this.camera })
    this.scroll.last = this.scroll.current
    this.raf = window.requestAnimationFrame(this.update)
  }

  addEventListeners() {
    this.boundOnResize = this.onResize
    this.boundOnWheel = this.onWheel
    this.boundOnTouchDown = this.onTouchDown
    this.boundOnTouchMove = this.onTouchMove
    this.boundOnTouchUp = this.onTouchUp

    window.addEventListener('resize', this.boundOnResize)
    this.container.addEventListener('wheel', this.boundOnWheel, { passive: true })
    this.container.addEventListener('mousedown', this.boundOnTouchDown)
    window.addEventListener('mousemove', this.boundOnTouchMove)
    window.addEventListener('mouseup', this.boundOnTouchUp)
    this.container.addEventListener('touchstart', this.boundOnTouchDown, { passive: true })
    window.addEventListener('touchmove', this.boundOnTouchMove, { passive: true })
    window.addEventListener('touchend', this.boundOnTouchUp)
  }

  destroy() {
    window.cancelAnimationFrame(this.raf)
    window.removeEventListener('resize', this.boundOnResize)
    this.container.removeEventListener('wheel', this.boundOnWheel)
    this.container.removeEventListener('mousedown', this.boundOnTouchDown)
    window.removeEventListener('mousemove', this.boundOnTouchMove)
    window.removeEventListener('mouseup', this.boundOnTouchUp)
    this.container.removeEventListener('touchstart', this.boundOnTouchDown)
    window.removeEventListener('touchmove', this.boundOnTouchMove)
    window.removeEventListener('touchend', this.boundOnTouchUp)

    if (this.renderer && this.renderer.gl && this.renderer.gl.canvas.parentNode) {
      this.renderer.gl.canvas.parentNode.removeChild(this.renderer.gl.canvas)
    }
  }
}

export function CircularGallery({
  items = [],
  bend = 2.4,
  borderRadius = 0.05,
  scrollSpeed = 1.8,
  scrollEase = 0.06,
  onItemClick,
  className = '',
}) {
  const containerRef = useRef(null)
  const appRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current) return

    const app = new CircularGalleryApp(containerRef.current, {
      items,
      bend,
      borderRadius,
      scrollSpeed,
      scrollEase,
      onItemClick,
    })
    appRef.current = app

    return () => {
      app.destroy()
      appRef.current = null
    }
  }, [items, bend, borderRadius, scrollSpeed, scrollEase, onItemClick])

  return (
    <div className={`relative w-full overflow-hidden ${className}`}>
      <div
        ref={containerRef}
        className="w-full h-full cursor-grab active:cursor-grabbing select-none"
      />
      {/* Navigation Buttons */}
      <button
        type="button"
        onClick={() => appRef.current?.prev()}
        className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-ink/70 hover:bg-ink text-paper border border-gold/40 flex items-center justify-center backdrop-blur-md shadow-luxury hover:scale-105 transition-all duration-300"
        aria-label="Previous Category"
      >
        &#8592;
      </button>
      <button
        type="button"
        onClick={() => appRef.current?.next()}
        className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-ink/70 hover:bg-ink text-paper border border-gold/40 flex items-center justify-center backdrop-blur-md shadow-luxury hover:scale-105 transition-all duration-300"
        aria-label="Next Category"
      >
        &#8594;
      </button>
    </div>
  )
}
