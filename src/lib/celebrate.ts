// Confetti + chime, ported from the prototype. Triggered when the whole day is completed.

let audioCtx: AudioContext | null = null

export function celebrate(root: HTMLElement | null): void {
  confetti(root)
  chime()
}

function confetti(root: HTMLElement | null): void {
  try {
    const host = root || document.body
    const W = host.clientWidth || 390
    const H = host.clientHeight || window.innerHeight
    const c = document.createElement('canvas')
    c.width = W
    c.height = H
    c.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:80;'
    host.appendChild(c)
    const ctx = c.getContext('2d')
    if (!ctx) {
      c.remove()
      return
    }
    const colors = ['#B8896A', '#8FA892', '#7A9AAA', '#E8B4A0', '#D9A441']
    const P = Array.from({ length: 130 }, (_, i) => ({
      x: W / 2 + (Math.random() - 0.5) * 70,
      y: H * 0.34,
      vx: (Math.random() - 0.5) * 9,
      vy: -7 - Math.random() * 8,
      g: 0.3,
      r: 4 + Math.random() * 4,
      c: colors[i % colors.length],
      rot: Math.random() * 6,
      vr: (Math.random() - 0.5) * 0.45,
      a: 1,
    }))
    const t0 = performance.now()
    const tick = (t: number) => {
      ctx.clearRect(0, 0, W, H)
      let alive = false
      P.forEach((p) => {
        p.vy += p.g
        p.x += p.vx
        p.y += p.vy
        p.rot += p.vr
        if (t - t0 > 950) p.a -= 0.045
        if (p.a > 0 && p.y < H + 20) {
          alive = true
          ctx.save()
          ctx.globalAlpha = Math.max(0, p.a)
          ctx.translate(p.x, p.y)
          ctx.rotate(p.rot)
          ctx.fillStyle = p.c
          ctx.fillRect(-p.r, -p.r * 0.6, p.r * 2, p.r * 1.2)
          ctx.restore()
        }
      })
      if (alive && t - t0 < 2400) requestAnimationFrame(tick)
      else if (c.parentNode) c.parentNode.removeChild(c)
    }
    requestAnimationFrame(tick)
  } catch {
    /* noop */
  }
}

function chime(): void {
  try {
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const A = audioCtx || (audioCtx = new Ctor())
    if (A.state === 'suspended') void A.resume()
    const now = A.currentTime
    ;[523.25, 659.25, 783.99].forEach((f, i) => {
      const o = A.createOscillator()
      const g = A.createGain()
      o.type = 'sine'
      o.frequency.value = f
      o.connect(g)
      g.connect(A.destination)
      const tt = now + i * 0.11
      g.gain.setValueAtTime(0, tt)
      g.gain.linearRampToValueAtTime(0.16, tt + 0.02)
      g.gain.exponentialRampToValueAtTime(0.001, tt + 0.5)
      o.start(tt)
      o.stop(tt + 0.55)
    })
  } catch {
    /* noop */
  }
}
