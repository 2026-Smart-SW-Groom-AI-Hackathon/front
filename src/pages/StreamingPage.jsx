import { useEffect, useRef, useState } from 'react'
import { useHairLensSocket } from '../hooks/useHairLensSocket.js'

const SEVERITY_GRADIENTS = {
  0: 'linear-gradient(90deg, #00ffc8, #00c8ff)',
  1: 'linear-gradient(90deg, #00c8ff, #ffd400)',
  2: 'linear-gradient(90deg, #ffd400, #ff9d00)',
  3: 'linear-gradient(90deg, #ff9d00, #ff3d5a)',
}

const STATUS_LABELS = {
  connected: 'STREAMING',
  connecting: 'CONNECTING',
  error: 'ERROR',
  '': 'DISCONNECTED',
}

export default function StreamingPage({ onPrev, onNext }) {
  const [url, setUrl] = useState('ws://localhost:8765')
  const fpsCanvasRef = useRef(null)
  const { status, frameSrc, fps, fpsHistory, detections, logs, connect, disconnect } = useHairLensSocket()

  // FPS 그래프 그리기
  useEffect(() => {
    const canvas = fpsCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    canvas.width = 284
    canvas.height = 56

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    const max = Math.max(...fpsHistory, 30)
    const w = canvas.width / fpsHistory.length

    ctx.beginPath()
    ctx.moveTo(0, canvas.height)
    fpsHistory.forEach((v, i) => {
      ctx.lineTo(i * w, canvas.height - (v / max) * canvas.height * 0.85)
    })
    ctx.lineTo(canvas.width, canvas.height)
    ctx.closePath()
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height)
    grad.addColorStop(0, 'rgba(0,200,255,0.3)')
    grad.addColorStop(1, 'rgba(0,200,255,0.02)')
    ctx.fillStyle = grad
    ctx.fill()

    ctx.beginPath()
    fpsHistory.forEach((v, i) => {
      const x = i * w
      const y = canvas.height - (v / max) * canvas.height * 0.85
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
    })
    ctx.strokeStyle = 'rgba(0,200,255,0.9)'
    ctx.lineWidth = 1.5
    ctx.stroke()
  }, [fpsHistory])

  const d0 = detections[0] || null
  const faceCount = detections.length
  const totalPts = detections.reduce((s, d) => s + (d.hairline_points || 0), 0)
  const avgConf = detections.length
    ? detections.reduce((s, d) => s + (d.confidence || 0), 0) / detections.length
    : null

  let foreheadStr = '—'
  if (d0) {
    if (d0.forehead_mm != null && d0.forehead_mm > 0) foreheadStr = d0.forehead_mm.toFixed(1) + ' mm'
    else if (d0.forehead_px > 0) foreheadStr = Math.round(d0.forehead_px) + ' px'
  }

  const hairlinePos = d0 && d0.hairline_y_normalized != null ? d0.hairline_y_normalized : null
  const hairlinePct = hairlinePos != null ? Math.round(hairlinePos * 100) : null

  let severityPct = 0
  let severityGrad = SEVERITY_GRADIENTS[0]
  if (d0 && d0.forehead_ratio != null) {
    severityPct = Math.max(0, Math.min(100, Math.round(((d0.forehead_ratio - 0.4) / 0.6) * 100)))
    severityGrad = SEVERITY_GRADIENTS[d0.severity_level] || SEVERITY_GRADIENTS[0]
  }

  const isConnected = status === 'connected'
  const isConnecting = status === 'connecting'

  return (
    <div className="card">
      <h1>3단계 · 카메라 분석</h1>
      <p className="subtitle">실시간 헤어라인 분석을 시작합니다. 서버가 실행 중이어야 합니다.</p>

      <div style={{ marginBottom: 28 }}>
        <div className="cam-frame">
          {frameSrc ? (
            <img className="cam-feed" src={frameSrc} alt="HairLens stream" />
          ) : (
            <div className="cam-idle">
              <div className="cam-spinner" />
              <div>{url} 대기 중<br />서버를 실행한 뒤 CONNECT를 누르세요</div>
            </div>
          )}
        </div>
      </div>

      <div style={{ marginBottom: 28 }}>
        <div className="connect-row">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={isConnected || isConnecting}
          />
          <button
            className="btn-primary"
            style={{ flex: '0 0 auto' }}
            onClick={() => connect(url)}
            disabled={isConnected || isConnecting}
          >
            CONNECT
          </button>
          <button
            className="btn-danger"
            onClick={disconnect}
            disabled={!isConnected}
          >
            DISCONNECT
          </button>
        </div>
        <div className="status-row">
          <div className={'status-dot ' + status} />
          <span>{STATUS_LABELS[status] || 'DISCONNECTED'}</span>
        </div>
      </div>

      <div className="metrics-grid">
        <div className="metric">
          <div className="metric-label">FACES DETECTED</div>
          <div className="metric-value">{faceCount > 0 ? faceCount : '—'}</div>
        </div>
        <div className="metric">
          <div className="metric-label">HAIRLINE POINTS</div>
          <div className="metric-value">{totalPts > 0 ? totalPts : '—'}</div>
        </div>
        <div className="metric">
          <div className="metric-label">CONFIDENCE</div>
          <div className="metric-value">{avgConf != null ? (avgConf * 100).toFixed(1) + '%' : '—'}</div>
        </div>
        <div className="metric">
          <div className="metric-label">눈썹 ↔ 헤어라인</div>
          <div className="metric-value">{foreheadStr}</div>
        </div>
      </div>

      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14 }}>
          <span>HAIRLINE POSITION</span>
          <span>{hairlinePct != null ? hairlinePct + '%' : '—'}</span>
        </div>
        <div className="bar-track">
          <div className="bar-fill" style={{ width: (hairlinePct ?? 0) + '%' }} />
        </div>
      </div>

      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14 }}>
          <span>탈모 심각도</span>
          <span>{d0?.severity ?? '—'}</span>
        </div>
        <div className="bar-track">
          <div className="bar-fill" style={{ width: severityPct + '%', background: severityGrad }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 12, color: '#6b7280' }}>
          <span>FOREHEAD RATIO</span>
          <span>{d0?.forehead_ratio != null ? d0.forehead_ratio.toFixed(2) : '—'}</span>
        </div>
      </div>

      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 14, marginBottom: 8 }}>Frame Rate</div>
        <div style={{ position: 'relative', height: 60 }}>
          <canvas ref={fpsCanvasRef} style={{ width: '100%', height: 60, borderRadius: 4 }} />
          <div style={{ position: 'absolute', top: 8, left: 12, fontSize: 20, fontWeight: 'bold', color: '#3b82f6' }}>
            {fps} fps
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 14, marginBottom: 12 }}>Detections</div>
        <div className="det-list">
          {detections.length === 0 ? (
            <div style={{ color: '#6b7280', textAlign: 'center' }}>스트림 대기 중 …</div>
          ) : (
            detections.map((d) => {
              const [x1, y1, x2, y2] = d.bbox || [0, 0, 0, 0]
              const w = x2 - x1
              const h = y2 - y1
              const posStr = d.hairline_y_normalized != null
                ? (d.hairline_y_normalized * 100).toFixed(1) + '%'
                : '—'
              return (
                <div className="det-card" key={d.id}>
                  <div className="det-header">
                    <span className="det-id">FACE #{d.id}</span>
                    <span className="det-conf">{(d.confidence * 100).toFixed(1)}%</span>
                  </div>
                  <div className="det-row"><span>BBox</span><span>{w}×{h}px</span></div>
                  <div className="det-row"><span>Position</span><span>{x1}, {y1}</span></div>
                  <div className="det-row"><span>Hairline pts</span><span>{d.hairline_points}</span></div>
                  <div className="det-row"><span>Hairline Y</span><span>{posStr}</span></div>
                </div>
              )
            })
          )}
        </div>
      </div>

      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 14, marginBottom: 12 }}>Log</div>
        <div className="log-wrap">
          {logs.map((l) => (
            <div key={l.id} className={'log-entry ' + l.type}>
              [{l.ts}] {l.msg}
            </div>
          ))}
        </div>
      </div>

      <div className="actions">
        <button className="btn-secondary" onClick={onPrev}>이전</button>
        <button className="btn-primary" onClick={onNext}>리포트 보기</button>
      </div>
    </div>
  )
}
