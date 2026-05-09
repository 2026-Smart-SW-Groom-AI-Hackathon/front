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
  const [lastSaved, setLastSaved] = useState(null)
  const [history, setHistory] = useState([])
  const [auto, setAuto] = useState({ progress: 0, aligned_frames: 0, required: 24, cooldown: 0, enabled: true })

  const wsRef = useRef(null)
  const frameCountRef = useRef(0)
  const lastFpsTimeRef = useRef(performance.now())
  const reportResolversRef = useRef(new Map())   // req_id → resolve fn

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

  const send = useCallback((obj) => {
    const ws = wsRef.current
    if (!ws || ws.readyState !== WebSocket.OPEN) return false
    try {
      ws.send(typeof obj === 'string' ? obj : JSON.stringify(obj))
      return true
    } catch {
      return false
    }
  }, [])

  // AI 리포트 요청 — Promise<report | null>. 타임아웃 시 null.
  const requestAIReport = useCallback((survey, measurement, timeoutMs = 30000) => {
    return new Promise((resolve) => {
      const ws = wsRef.current
      if (!ws || ws.readyState !== WebSocket.OPEN) return resolve(null)
      const reqId = 'r_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8)
      reportResolversRef.current.set(reqId, resolve)
      const timer = setTimeout(() => {
        if (reportResolversRef.current.has(reqId)) {
          reportResolversRef.current.delete(reqId)
          resolve(null)
        }
      }, timeoutMs)
      const wrapped = (val) => { clearTimeout(timer); resolve(val) }
      reportResolversRef.current.set(reqId, wrapped)
      try {
        ws.send(JSON.stringify({
          type: 'build_report',
          req_id: reqId,
          survey,
          measurement,
        }))
      } catch {
        reportResolversRef.current.delete(reqId)
        clearTimeout(timer)
        resolve(null)
      }
    })
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

      if (data.type === 'history' || data.type === 'auto_saved') {
        if (data.saved) {
          setLastSaved(data.saved)
          addLog(`측정 저장됨: HCI=${data.saved.hci ?? '—'} mm=${data.saved.forehead_mm ?? '—'}`, 'ok')
        }
        if (Array.isArray(data.items)) setHistory(data.items)
        return
      }

      if (data.type === 'save_error') {
        addLog(`저장 실패: ${data.error}`, 'error')
        return
      }

      if (data.type === 'report') {
        const resolve = reportResolversRef.current.get(data.req_id)
        if (resolve) {
          reportResolversRef.current.delete(data.req_id)
          resolve(data.report || null)
        }
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
      if (data.auto) setAuto(data.auto)
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
    lastSaved,
    history,
    auto,
    send,
    requestAIReport,
    connect,
    disconnect,
  }
}
