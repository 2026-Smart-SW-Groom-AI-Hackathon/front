import { FAMILY_WEIGHTS } from '../data.js'

export default function GeneticsPage({ data, setData, onNext }) {
  const toggleFamily = (key) => {
    const next = new Set(data.family)
    next.has(key) ? next.delete(key) : next.add(key)
    setData({ ...data, family: next })
  }

  const canNext =
    data.gender !== null &&
    data.hasFamilyHairLoss !== null &&
    data.hasMedication !== null &&
    (data.hasFamilyHairLoss === false || data.family.size > 0)

  return (
    <div className="card">
      <h1>1단계 · 유전 정보</h1>
      <p className="subtitle">기본 정보와 가족력, 약 복용 경험을 알려주세요.</p>

      <div className="question">
        <div className="question-title">0. 성별을 선택해주세요</div>
        <div className="options">
          {[{ v: 'male', l: '남성' }, { v: 'female', l: '여성' }].map(o => (
            <label key={o.v} className={'option ' + (data.gender === o.v ? 'checked' : '')}>
              <input
                type="radio"
                name="gender"
                checked={data.gender === o.v}
                onChange={() => setData({ ...data, gender: o.v })}
              />
              {o.l}
            </label>
          ))}
        </div>
      </div>

      <div className="question">
        <div className="question-title">1. 가족 중 탈모를 가진 인원이 있습니까?</div>
        <div className="options">
          {[{ v: true, l: '예' }, { v: false, l: '아니오' }].map(o => (
            <label key={String(o.v)} className={'option ' + (data.hasFamilyHairLoss === o.v ? 'checked' : '')}>
              <input
                type="radio"
                name="hasFamilyHairLoss"
                checked={data.hasFamilyHairLoss === o.v}
                onChange={() => setData({
                  ...data,
                  hasFamilyHairLoss: o.v,
                  family: o.v ? data.family : new Set(),
                })}
              />
              {o.l}
            </label>
          ))}
        </div>
      </div>

      {data.hasFamilyHairLoss && (
        <div className="question">
          <div className="question-title">2. 누구입니까? (중복 선택 가능)</div>
          <div className="options">
            {Object.entries(FAMILY_WEIGHTS).map(([key, info]) => (
              <label key={key} className={'option ' + (data.family.has(key) ? 'checked' : '')}>
                <input
                  type="checkbox"
                  checked={data.family.has(key)}
                  onChange={() => toggleFamily(key)}
                />
                {info.label}
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="question">
        <div className="question-title">3. 탈모를 벗어나기 위해 약을 드신 경험이 있습니까?</div>
        <div className="options">
          {[{ v: true, l: '예' }, { v: false, l: '아니오' }].map(o => (
            <label key={String(o.v)} className={'option ' + (data.hasMedication === o.v ? 'checked' : '')}>
              <input
                type="radio"
                name="hasMedication"
                checked={data.hasMedication === o.v}
                onChange={() => setData({ ...data, hasMedication: o.v })}
              />
              {o.l}
            </label>
          ))}
        </div>
      </div>

      <div className="actions">
        <button className="btn-primary" disabled={!canNext} onClick={onNext}>
          다음 단계
        </button>
      </div>
    </div>
  )
}
