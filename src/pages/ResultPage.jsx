import { useEffect, useState } from 'react'
import { STORAGE_KEY, DEMO_REPORT } from '../data.js'

export default function ResultPage({ onRetake }) {
  const [report, setReport] = useState(null)
  const [copied, setCopied] = useState(false)

  // 데이터 로딩 — window.__REPORT__ > localStorage > DEMO_REPORT
  useEffect(() => {
    if (typeof window !== 'undefined' && window.__REPORT__ && typeof window.__REPORT__ === 'object') {
      setReport(window.__REPORT__)
      return
    }
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed && typeof parsed === 'object') {
          setReport(parsed)
          return
        }
      }
    } catch {}
    setReport(DEMO_REPORT)
  }, [])

  // 진행 바 애니메이션
  useEffect(() => {
    if (!report) return
    requestAnimationFrame(() => {
      const bar = document.getElementById('hl-bar')
      if (!bar) return
      const s = Math.max(0, Math.min(100, Number(report.total_score ?? 0)))
      bar.style.width = s + '%'
    })
  }, [report])

  if (!report) {
    return (
      <div className="card">
        <div className="hl-empty">
          <h2>리포트 데이터를 찾을 수 없어요</h2>
          <p>분석 단계로 돌아가 다시 시도해주세요.</p>
        </div>
      </div>
    )
  }

  const score = Number(report.total_score ?? 0)
  const stage = report.stage_text ?? ''
  const imageSrc = report.image_b64 ? 'data:image/jpeg;base64,' + report.image_b64 : ''
  const summary = report.one_line_summary ?? ''
  const fullReport = report.full_report ?? ''
  const insights = Array.isArray(report.key_insights) ? report.key_insights : []
  const recs = Array.isArray(report.recommendations) ? report.recommendations : []
  const future3 = report.future_3months ?? ''
  const future6 = report.future_6months ?? ''
  const tips = Array.isArray(report.visual_tips) ? report.visual_tips : []
  const risks = Array.isArray(report.risk_factors) ? report.risk_factors : []

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(summary)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {}
  }

  const handleRetake = () => {
    try { localStorage.removeItem(STORAGE_KEY) } catch {}
    onRetake && onRetake()
  }

  const d = new Date()
  const dateStr =
    d.getFullYear() + '.' +
    String(d.getMonth() + 1).padStart(2, '0') + '.' +
    String(d.getDate()).padStart(2, '0') + ' 분석'

  return (
    <div className="hl-container">
      <header className="hl-header">
        <div className="hl-brand">HairLens</div>
        <div className="hl-meta">{dateStr}</div>
      </header>

      {imageSrc && (
        <section className="hl-snapshot hl-fade-in">
          <img
            src={imageSrc}
            alt="측정 스냅샷"
            style={{
              width: '100%',
              borderRadius: 12,
              display: 'block',
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            }}
          />
        </section>
      )}

      <section className="hl-hero hl-fade-in">
        <div className="hl-hero-label">종합 진행도</div>
        <div className="hl-hero-score">{score}<sub>/100</sub></div>
        <div className="hl-hero-stage">{stage}</div>
        <div className="hl-progress">
          <div className="hl-progress-fill" id="hl-bar" />
        </div>
      </section>

      <section className="hl-summary hl-fade-in" style={{ animationDelay: '.05s' }}>
        {summary}
      </section>

      <section className="hl-card hl-fade-in" style={{ animationDelay: '.1s' }}>
        <h3>종합 리포트</h3>
        <p className="hl-fullreport">{fullReport}</p>
      </section>

      <section className="hl-card hl-fade-in" style={{ animationDelay: '.15s' }}>
        <h3>핵심 발견</h3>
        <ul className="hl-list">
          {insights.map((i, idx) => <li key={idx}>{i}</li>)}
        </ul>
      </section>

      <section className="hl-card hl-fade-in" style={{ animationDelay: '.2s' }}>
        <h3>실행 권장사항</h3>
        <div className="hl-recs">
          {recs.map((r, idx) => (
            <article className="hl-rec" key={idx}>
              <div className="hl-rec-num">{String(idx + 1).padStart(2, '0')}</div>
              <div className="hl-rec-title">{r.title}</div>
              <div className="hl-rec-desc">{r.desc}</div>
            </article>
          ))}
        </div>
      </section>

      <section className="hl-card hl-fade-in" style={{ animationDelay: '.25s' }}>
        <h3>시간선 전망</h3>
        <div className="hl-timeline">
          <div className="hl-tl-card">
            <span className="hl-tl-label">3개월 후</span>
            <p className="hl-tl-text">{future3}</p>
          </div>
          <div className="hl-tl-card">
            <span className="hl-tl-label">6개월 후</span>
            <p className="hl-tl-text">{future6}</p>
          </div>
        </div>
      </section>

      <section className="hl-card hl-fade-in" style={{ animationDelay: '.3s' }}>
        <h3>즉효성 외형 팁</h3>
        <ul className="hl-list">
          {tips.map((t, idx) => <li key={idx}>{t}</li>)}
        </ul>
      </section>

      <section className="hl-card hl-fade-in" style={{ animationDelay: '.35s' }}>
        <h3>개인 위험 요인</h3>
        <ul className="hl-list hl-list-danger">
          {risks.map((r, idx) => <li key={idx}>{r}</li>)}
        </ul>
      </section>

      <div className="hl-actions hl-fade-in" style={{ animationDelay: '.4s' }}>
        <button className="hl-btn" onClick={handleCopy}>
          {copied ? '복사 완료!' : '한 줄 요약 복사'}
        </button>
        <button className="hl-btn hl-btn-primary" onClick={handleRetake}>
          다시 분석하기
        </button>
      </div>
    </div>
  )
}
