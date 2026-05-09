import { useEffect, useRef } from 'react'
import { useHairLensSocket } from '../hooks/useHairLensSocket.js'
import { buildReport, STORAGE_KEY } from '../data.js'

const WS_URL = 'ws://localhost:8765'

function serializeSurvey(d) {
  if (!d) return {}
  return {
    gender: d.gender ?? null,
    hasFamilyHairLoss: d.hasFamilyHairLoss ?? null,
    family: d.family instanceof Set ? [...d.family] : (Array.isArray(d.family) ? d.family : []),
    hasMedication: d.hasMedication ?? null,
    hairTypes: d.hairTypes instanceof Set ? [...d.hairTypes] : (Array.isArray(d.hairTypes) ? d.hairTypes : []),
  }
}

export default function StreamingPage({ data, score, onPrev, onNext }) {
  const { status, frameSrc, lastSaved, auto, requestAIReport, connect } = useHairLensSocket()
  const progress = Math.max(0, Math.min(1, auto?.progress ?? 0))
  const progressPct = Math.round(progress * 100)
  const navigatedRef = useRef(false)
  const frameSrcRef  = useRef(null)
  const connectedOnceRef = useRef(false)

  // 페이지 진입 즉시 자동 연결
  useEffect(() => {
    if (connectedOnceRef.current) return
    connectedOnceRef.current = true
    connect(WS_URL)
  }, [connect])

  useEffect(() => { frameSrcRef.current = frameSrc }, [frameSrc])

  // 자동 캡처 응답 → AI 리포트 요청 → 페이지 이동 (실패 시 로컬 폴백)
  useEffect(() => {
    if (!lastSaved || navigatedRef.current) return

    let imageB64 = lastSaved.image_b64 || ''
    if (!imageB64 && frameSrcRef.current) {
      const m = String(frameSrcRef.current).match(/^data:image\/[^;]+;base64,(.*)$/)
      if (m) imageB64 = m[1]
    }
    if (!imageB64) return

    navigatedRef.current = true
    const measurement = { ...lastSaved, image_b64: imageB64 }
    const survey = serializeSurvey(data)

    // 1) 로컬 폴백을 즉시 저장하고 바로 다음 페이지로 이동
    try {
      const fallback = buildReport(data, score, measurement)
      fallback._meta = { ...(fallback._meta || {}), source: 'local-fallback' }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fallback))
      if (typeof window !== 'undefined') window.__REPORT__ = fallback
    } catch (e) {
      console.warn('local report build failed', e)
    }
    onNext && onNext()

    // 2) AI 리포트는 백그라운드로 받아서 도착하면 덮어쓰기
    ;(async () => {
      const measurementForAI = { ...measurement }
      delete measurementForAI.image_b64
      try {
        const ai = await requestAIReport(survey, measurementForAI)
        if (ai && typeof ai === 'object') {
          const report = { ...ai, image_b64: imageB64, _meta: { ...(ai._meta || {}), source: 'claude', survey_score: score } }
          localStorage.setItem(STORAGE_KEY, JSON.stringify(report))
          if (typeof window !== 'undefined') {
            window.__REPORT__ = report
            window.dispatchEvent(new CustomEvent('report:updated', { detail: report }))
          }
        }
      } catch (e) {
        console.warn('AI 리포트 요청 오류', e)
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastSaved])

  return (
    <div className="card">
      <h1>3단계 · 카메라 분석</h1>
      <p className="subtitle">얼굴을 가이드 안에 1초 동안 정렬하면 자동 촬영 후 리포트로 이동합니다.</p>

      <div style={{ marginBottom: 28, position: 'relative' }}>
        <div className="cam-frame">
          {frameSrc ? (
            <img className="cam-feed" src={frameSrc} alt="HairLens stream" />
          ) : (
            <div className="cam-idle">
              <div className="cam-spinner" />
              <div>
                {status === 'error'
                  ? '서버 연결 실패 — python server.py 실행 중인지 확인해주세요'
                  : '카메라 연결 중…'}
              </div>
            </div>
          )}
        </div>

        {frameSrc && (
          <div
            style={{
              position: 'absolute',
              left: 16,
              right: 16,
              bottom: 16,
              padding: '10px 14px',
              background: 'rgba(0,0,0,0.55)',
              backdropFilter: 'blur(6px)',
              borderRadius: 10,
              color: '#fff',
              pointerEvents: 'none',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6, opacity: 0.85 }}>
              <span>{progress > 0 ? '정렬 유지 중…' : '얼굴을 가이드 안에 맞춰주세요'}</span>
              <span>{progressPct}%</span>
            </div>
            <div style={{ height: 6, background: 'rgba(255,255,255,0.2)', borderRadius: 3, overflow: 'hidden' }}>
              <div
                style={{
                  width: progressPct + '%',
                  height: '100%',
                  background: progressPct >= 100
                    ? 'linear-gradient(90deg, #00ffc8, #00c8ff)'
                    : 'linear-gradient(90deg, #00c8ff, #3b82f6)',
                  transition: 'width 80ms linear',
                }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="actions">
        <button className="btn-secondary" onClick={onPrev}>이전</button>
      </div>
    </div>
  )
}
