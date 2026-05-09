import { useState, useRef, useCallback, useEffect } from 'react'

const FPS_HISTORY_LEN = 144
const MAX_LOGS = 80

export function useHairLensSocket() {
  const [status, setStatus] = useState('') // '', 'connecting', 'connected', 'error'
  const [frameSrc, setFrameSrc] = useState(null)
  const [fps, setFps] = useState(0)
  const [fpsHistory, setFpsHistory] = useState(() => new Array(FPS_HISTORY_LEN).fill(0))
  const [detections, setDetections] = useState([])
  const [logs, setLogs] = useState([])
  const [hud, setHud] = useState({ frameIdx: null, ts: null })

  const wsRef = useRef(null)
  const frameCountRef = useRef(0)
  const lastFpsTimeRef = useRef(performance.now())

  const addLog = useCallback((msg, type = 'info') => {
    const ts = new Date().toLocaleTimeString('ko', { hour12: false })
    setLogs(prev => [{ msg, type, ts, id: Date.now() + Math.random() }, ...prev].slice(0, MAX_LOGS))
  }, [])

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
  }, [])

  const connect = useCallback((url) => {
    if (!url) return
    if (wsRef.current) wsRef.current.close()

    setStatus('connecting')
    addLog(`Connecting to ${url} …`, 'info')

    const ws = new WebSocket(url)
    wsRef.current = ws

    ws.onopen = () => {
      setStatus('connected')
      addLog('WebSocket connected ✓', 'ok')
      frameCountRef.current = 0
      lastFpsTimeRef.current = performance.now()
    }

    ws.onmessage = (e) => {
      let data
      try {
        data = JSON.parse(e.data)
      } catch {
        addLog('Invalid JSON from server', 'error')
        return
      }

      if (data.error) {
        addLog(`Server error: ${data.error}`, 'error')
        return
      }

      if (data.frame) setFrameSrc('data:image/jpeg;base64,' + data.frame)

      // FPS
      frameCountRef.current += 1
      const now = performance.now()
      const elapsed = (now - lastFpsTimeRef.current) / 1000
      if (elapsed >= 0.5) {
        const cur = Math.round(frameCountRef.current / elapsed)
        frameCountRef.current = 0
        lastFpsTimeRef.current = now
        setFps(cur)
        setFpsHistory(prev => {
          const next = prev.slice(1)
          next.push(cur)
          return next
        })
      }

      setHud({
        frameIdx: data.frame_idx ?? null,
        ts: data.timestamp ? new Date(data.timestamp * 1000) : null,
      })
      setDetections(data.detections || [])
    }

    ws.onclose = () => {
      setStatus('')
      addLog('Connection closed', 'warn')
      setFrameSrc(null)
    }

    ws.onerror = () => {
      setStatus('error')
      addLog('WebSocket error — server가 실행 중인지 확인하세요', 'error')
    }
  }, [addLog])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (wsRef.current) wsRef.current.close()
    }
  }, [])

  return {
    status,
    frameSrc,
    fps,
    fpsHistory,
    detections,
    logs,
    hud,
    connect,
    disconnect,
  }
}
