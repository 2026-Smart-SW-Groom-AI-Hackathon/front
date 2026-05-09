import { HAIR_TYPES } from '../data.js'
import HairSVG from '../components/HairSVG.jsx'

export default function HairlinePage({ data, setData, onPrev, onNext, score }) {
  const toggle = (key) => {
    const next = new Set(data.hairTypes)
    if (key === 'normal') {
      next.clear()
      next.add('normal')
    } else {
      next.delete('normal')
      next.has(key) ? next.delete(key) : next.add(key)
    }
    setData({ ...data, hairTypes: next })
  }

  const canNext = data.hairTypes.size > 0

  return (
    <div className="card">
      <h1>2단계 · 현재 헤어라인</h1>
      <p className="subtitle">본인의 상태와 가장 가까운 항목을 모두 선택해주세요.</p>

      <div className="hair-grid">
        {Object.entries(HAIR_TYPES).map(([key, info]) => (
          <div
            key={key}
            className={'hair-card ' + (data.hairTypes.has(key) ? 'checked' : '')}
            onClick={() => toggle(key)}
          >
            <HairSVG type={key} />
            <div className="hair-label">{info.label}</div>
            <div className="hair-desc">{info.desc}</div>
          </div>
        ))}
      </div>

      <div className="score-box">
        <div style={{ fontSize: 13, color: '#475569', marginBottom: 6 }}>예상 탈모 진행도</div>
        <div className="score-value">{score}%</div>
        <div className="score-meter">
          <div className="score-fill" style={{ width: score + '%' }} />
        </div>
        <div className="hint">설문 기반 추정치입니다. 카메라 분석 결과와 함께 종합 판단됩니다.</div>
      </div>

      <div className="actions">
        <button className="btn-secondary" onClick={onPrev}>이전</button>
        <button className="btn-primary" disabled={!canNext} onClick={onNext}>
          카메라 분석으로 이동
        </button>
      </div>
    </div>
  )
}
