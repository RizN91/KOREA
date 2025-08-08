import { useEffect, useRef } from 'react'
import QRCode from 'qrcode'

export default function QR({ text }: { text: string }){
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useEffect(()=>{ if(canvasRef.current) QRCode.toCanvas(canvasRef.current, text, { width: 160 }) }, [text])
  return (
    <div className="flex items-center gap-2">
      <canvas ref={canvasRef} className="border rounded bg-white" />
      <a className="btn-secondary" href={canvasRef.current?.toDataURL()} download="qr.png">Download</a>
    </div>
  )
}