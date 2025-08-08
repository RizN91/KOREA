import { useEffect, useRef, useState } from 'react'
import jsQR from 'jsqr'

export default function Scanner({ onResult }: { onResult: (text: string)=>void }){
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(document.createElement('canvas'))
  const [error, setError] = useState('')

  useEffect(()=>{
    let stream: MediaStream
    const start = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play() }
        tick()
      } catch (e:any) { setError(String(e)) }
    }
    start()
    return ()=>{ stream?.getTracks().forEach(t=>t.stop()) }
  }, [])

  async function tick() {
    const v = videoRef.current!
    const c = canvasRef.current
    const ctx = c.getContext('2d')!
    c.width = v.videoWidth; c.height = v.videoHeight
    const loop = () => {
      if (!v.paused && !v.ended) {
        ctx.drawImage(v, 0, 0, c.width, c.height)
        const img = ctx.getImageData(0, 0, c.width, c.height)
        const code = jsQR(img.data, img.width, img.height)
        if (code?.data) { onResult(code.data); return }
      }
      requestAnimationFrame(loop)
    }
    loop()
  }

  return (
    <div className="space-y-2">
      {error && <div className="text-rose-500 text-sm">{error}</div>}
      <video ref={videoRef} className="w-full rounded" />
    </div>
  )
}