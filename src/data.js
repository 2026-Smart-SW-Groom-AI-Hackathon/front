// ---- 점수 가중치 ----
export const FAMILY_WEIGHTS = {
  dad:     { label: '아빠',     weight: 25 },
  mom:     { label: '엄마',     weight: 15 },
  grandpa: { label: '할아버지', weight: 10 },
  grandma: { label: '할머니',   weight: 8 },
  others:  { label: '그 외',    weight: 5 },
}

export const HAIR_TYPES = {
  normal:  { label: '표준',         desc: '특별한 후퇴 없음',     weight: 0 },
  mShape:  { label: 'M자형',        desc: '이마 양쪽 후퇴',        weight: 30 },
  crown:   { label: '정수리 탈모',  desc: '정수리 부위 비어있음', weight: 30 },
  diffuse: { label: '전반적 숱 감소', desc: '머리 전체 밀도 저하', weight: 25 },
  uShape:  { label: 'U자형',        desc: '진행된 전반적 후퇴',    weight: 40 },
}

// ---- 점수 계산 ----
export function calcScore(data) {
  let score = 0
  if (data.hasFamilyHairLoss) {
    score += 10
    data.family.forEach(k => { score += FAMILY_WEIGHTS[k]?.weight || 0 })
  }
  if (data.hasMedication) score += 12
  data.hairTypes.forEach(k => { score += HAIR_TYPES[k]?.weight || 0 })
  if (data.gender === 'female') score *= 0.7
  return Math.min(100, Math.round(score))
}

// ---- 결과 리포트 저장 키 ----
export const STORAGE_KEY = 'hairlensReport'

// ---- 측정값 + 설문 → 리포트 ----
const STAGE_BY_LEVEL = {
  0: '정상 범위',
  1: '중등도 진행',
  2: '심각 진행',
}

const ONE_LINER_BY_LEVEL = {
  0: '아직 정상 범위예요. 지금 습관만 유지해도 충분합니다.',
  1: '중등도 진행 중기, 6개월 안에 멈출 수 있는 골든타임이에요.',
  2: '진행이 빠른 단계예요. 지금 개입이 가장 큰 효과를 냅니다.',
}

const REC_BANK = {
  minoxidil: { title: '미녹시딜 5% 매일 1ml', desc: '샤워 후 두피가 살짝 마른 상태에서 정수리/M자 부위에 분사. 6개월 꾸준히 하면 약 70%가 진행 정지 또는 회복을 경험.' },
  finas:     { title: '피나스테리드 처방 검토', desc: '복용 중이면 현재 처방 점검, 미복용이면 피부과 1회 방문해 적합성 확인.' },
  massage:   { title: '두피 마사지 1분', desc: '샴푸할 때 손끝으로 정수리 원형 마사지. 혈류 자극으로 약 흡수율 상승.' },
  protein:   { title: '단백질 + 비오틴', desc: '닭가슴살/달걀 매 끼니 + 비오틴 5,000mcg. 케라틴 합성 원료가 부족하면 약 효과도 반감.' },
  habit:     { title: '흡연/과음 줄이기', desc: '두피 혈류 감소가 모낭 영양 공급을 떨어뜨립니다. 6개월만이라도 줄이면 체감 차이 큼.' },
  monthly:   { title: '월 1회 정수리 사진', desc: '같은 조명/각도로 매달 기록. 본인 눈으로 변화를 확인하는 게 가장 강력한 동기 부여.' },
  uv:        { title: '자외선 차단', desc: '직사광선은 모낭 산화 스트레스의 주범. 외출 시 모자 또는 두피용 SPF.' },
  sleep:     { title: '7시간 수면', desc: '코르티솔이 높으면 휴지기 모낭 비율이 늘어납니다. 수면 부족 자체가 탈모 가속 인자.' },
}

const RECS_BY_LEVEL = {
  0: ['monthly', 'protein', 'habit', 'sleep'],
  1: ['minoxidil', 'finas', 'massage', 'protein', 'habit', 'monthly'],
  2: ['minoxidil', 'finas', 'massage', 'protein', 'habit', 'uv', 'sleep', 'monthly'],
}

const FUTURE_3M = {
  0: '큰 변화는 없습니다. 매달 같은 각도로 셀카만 남겨두면 본인 눈으로 변동을 추적할 수 있어요.',
  1: '관리 시작하면 정수리 잔모가 굵어지기 시작합니다. 안 하면 진행도 5~10점 추가 상승 가능.',
  2: '약물·생활 개입 시 3개월쯤 되면 빠지는 양이 눈에 띄게 줄어요. 방치하면 측두부 후퇴가 한 단계 더 진행.',
}

const FUTURE_6M = {
  0: '6개월 후도 비슷합니다. 지금 패턴 유지하면 30대 후반까지도 안전 범위.',
  1: '꾸준히 했다면 가르마 부위가 덜 비치는 게 본인 눈에 보입니다. 친구가 "머리 풍성해진 듯?" 묻는 시점.',
  2: '6개월은 가장 결정적 구간이에요. 적극 관리한 케이스와 방치한 케이스의 시각적 차이가 가장 크게 벌어집니다.',
}

const TIPS_BANK = [
  '이마 가린 앞머리 컷 대신 사이드 시원한 크롭 컷이 M자를 덜 부각',
  '왁스보다 매트 페이스트로 정수리 볼륨 살리기',
  '두피 톤이 너무 밝으면 헤어라인이 도드라짐, 외출 시 모자 활용',
  '셀카는 카메라를 살짝 아래에서, 정수리 노출 각도 회피',
  '가르마 위치를 자주 바꿔 한 곳만 눌리지 않게',
]

function buildInsights(data, m) {
  const out = []
  if (m && m.hci != null)
    out.push(`HCI ${m.hci.toFixed(2)}: 두피 영역 대비 머리카락 비율 측정값`)
  if (m && m.m_index != null)
    out.push(`M-index ${m.m_index.toFixed(3)}: 헤어라인 좌우 진폭 (값이 클수록 M자 진행)`)
  if (m && m.forehead_mm)
    out.push(`이마 높이 ${m.forehead_mm.toFixed(1)}mm: 눈썹 ↔ 헤어라인 실측 거리`)
  if (m && m.recession_ratio != null)
    out.push(`헤어라인 후퇴비 ${m.recession_ratio.toFixed(2)}: 정상 ~0.50, 클수록 후퇴`)
  if (data?.hasFamilyHairLoss && data.family && data.family.size > 0) {
    const labels = [...data.family].map(k => FAMILY_WEIGHTS[k]?.label).filter(Boolean).join(', ')
    out.push(`가족력 ${labels}: 유전적 진행 가속 요인`)
  }
  if (data?.hasMedication)
    out.push('현재 약물 복용 중: 진행이 통제되는 상태, 임의 중단 금물')
  if (data?.hairTypes && data.hairTypes.size > 0) {
    const labels = [...data.hairTypes].map(k => HAIR_TYPES[k]?.label).filter(Boolean).join(', ')
    out.push(`자가 진단 패턴: ${labels}`)
  }
  return out
}

function buildRisks(data, m) {
  const out = []
  if (data?.hasFamilyHairLoss) out.push('가족력 보유: 진행 속도가 평균보다 빠를 가능성')
  if (m?.label === '심각' || m?.level === 2) out.push('현 단계 측정값이 심각 구간 — 1개월 내 피부과 진료 권장')
  if (m?.label === '중등도' || m?.level === 1) out.push('중등도 구간은 진행/정지의 분기점 — 6개월 적극 관리가 향후 5년을 결정')
  if (data?.hairTypes?.has?.('mShape') || data?.hairTypes?.has?.('uShape'))
    out.push('측두부 후퇴 패턴은 한 번 진행되면 자연 회복이 어려움')
  if (data?.hairTypes?.has?.('crown'))
    out.push('정수리 패턴은 본인 눈으로 발견이 늦어지는 경향')
  if (data?.hasMedication)
    out.push('약물 중단 시 6개월 내 진행 재개 가능성이 큼')
  if (out.length === 0) out.push('현 시점 위험 신호 없음 — 정기 셀프 모니터링만 유지하세요')
  return out
}

export function buildReport(data, score, measurement) {
  const m = measurement || null
  const measLevelScore = { 0: 20, 1: 55, 2: 85 }[m?.level] ?? 40
  const total = m
    ? Math.min(100, Math.round(score * 0.45 + measLevelScore * 0.55))
    : Math.min(100, Math.round(score))

  const level = m?.level ?? (total >= 70 ? 2 : total >= 40 ? 1 : 0)
  const stage = STAGE_BY_LEVEL[level] ?? '평가 보류'
  const summary = ONE_LINER_BY_LEVEL[level]

  const recKeys = RECS_BY_LEVEL[level] || RECS_BY_LEVEL[1]
  const recommendations = recKeys.map(k => REC_BANK[k]).filter(Boolean)

  const fullParts = []
  if (m && m.hci != null && m.m_index != null) {
    fullParts.push(`측정 결과: HCI ${m.hci.toFixed(2)}, M-index ${m.m_index.toFixed(3)}.`)
  }
  if (m?.forehead_mm) {
    fullParts.push(`이마 높이는 ${m.forehead_mm.toFixed(1)}mm로 측정됐어요.`)
  }
  if (data?.hasFamilyHairLoss) {
    fullParts.push('가족력이 있어 진행 속도가 평균보다 빠를 수 있는 체질이에요.')
  }
  if (data?.hasMedication) {
    fullParts.push('이미 약물 관리를 시작한 상태라 통제권은 본인 손에 있습니다.')
  }
  fullParts.push(
    level === 0
      ? '지금처럼만 관리하면 30대 중후반까지도 안전 범위에 머무를 수 있어요. 한 달에 한 번 셀카 비교만 잊지 마세요.'
      : level === 1
      ? '중기 단계는 멈출 수 있는 골든타임입니다. 미녹시딜과 피부과 한 번이면 6개월 뒤 거울이 달라집니다.'
      : '진행이 빠른 구간이지만, 약물 + 생활 개입을 병행하면 6개월 안에 시각적 차이가 가장 크게 나는 구간이기도 해요.'
  )

  return {
    total_score: total,
    stage_text: stage,
    one_line_summary: summary,
    full_report: fullParts.join(' '),
    key_insights: buildInsights(data, m),
    recommendations,
    future_3months: FUTURE_3M[level],
    future_6months: FUTURE_6M[level],
    visual_tips: TIPS_BANK,
    risk_factors: buildRisks(data, m),
    image_b64: m?.image_b64 || '',
    _meta: {
      generated_at: Date.now(),
      survey_score: score,
      measurement: m ? { ...m, image_b64: undefined } : null,  // localStorage 절약
    },
  }
}

// ---- 데모 리포트 (window.__REPORT__ / localStorage 둘 다 없을 때) ----
export const DEMO_REPORT = {
  total_score: 71,
  stage_text: '중등도 M자형 진행',
  one_line_summary: '중등도 M자 진행 중기, 그래도 6개월 안에 멈출 수 있는 골든타임이에요.',
  full_report:
    'HCI 0.72에 M-index 0.142, 솔직히 말해 또래 평균 대비 정수리 밀도가 한 단계 낮고 양쪽 측두부도 살짝 후퇴한 상태예요. 헬스장 거울에서 위에서 비치는 조명, 카톡 셀카 위에서 찍는 각도가 점점 신경 쓰이기 시작하는 그 시점입니다. 다행히 아버지·할아버지 가족력이 있어 진행 속도는 빠른 편이지만, 지금 이미 약을 시작한 상태라서 통제권은 본인 손에 있어요. 미녹시딜 1ml 매일과 다음 주 피부과 한 번. 이거 두 개로 6개월 뒤 거울 앞 표정이 확실히 달라집니다.',
  key_insights: [
    'HCI 0.72: 정수리 밀도가 또래 평균 대비 약 18% 낮은 상태',
    'M-index 0.142: 양쪽 측두부 후퇴 중기 단계, 진행 차단 가능 구간',
    '종합 진행도 71/100: 적극 관리가 필요한 시점이지만 회복 여지 충분',
    '가족력 부+조부: 유전적 진행 가속 약 1.5배, 조기 개입의 효과가 큼',
    '현재 약물 복용 중: 진행이 통제되고 있는 상태, 절대 중단 금물',
  ],
  recommendations: [
    { title: '미녹시딜 5% 매일 1ml', desc: '샤워 후 두피가 살짝 마른 상태에서 정수리/M자 부위에 분사. 6개월 꾸준히 시 약 70%가 진행 정지 또는 회복 경험.' },
    { title: '피나스테리드 처방 검토', desc: '이미 약 복용 중이라면 현재 처방 점검, 미복용이면 피부과 1회 방문해 적합성 확인.' },
    { title: '두피 마사지 1분', desc: '샴푸할 때 손끝으로 정수리 원형 마사지. 혈류 자극으로 미녹시딜 흡수율 상승.' },
    { title: '단백질 + 비오틴', desc: '닭가슴살/달걀 매 끼니 + 비오틴 5,000mcg. 케라틴 합성 원료 부족하면 약 효과도 반감.' },
    { title: '흡연/과음 줄이기', desc: '두피 혈류 감소로 모낭 영양 공급 감소. 6개월만이라도 줄이면 체감 차이 큼.' },
    { title: '월 1회 정수리 사진', desc: '같은 조명/각도로 매달 기록. 본인 눈으로 변화 확인이 가장 강력한 동기 부여.' },
  ],
  future_3months: '지속 관리 시 정수리 잔모가 굵어지는 게 보이기 시작합니다. 관리 안 하면 진행도 5~10점 추가 상승 가능.',
  future_6months: '꾸준히 했다면 헬스장 거울 가르마 부위가 덜 비치는 게 본인 눈에 보입니다. 친구들이 \'머리 풍성해진 듯?\' 묻는 시점.',
  visual_tips: [
    '이마 가린 앞머리 컷 대신 사이드 시원한 크롭 컷이 M자를 덜 부각',
    '왁스보다 매트 페이스트로 정수리 볼륨 살리기',
    '두피 톤이 너무 밝으면 헤어라인 도드라짐, 외출 시 모자 활용',
    '셀카는 카메라를 살짝 아래에서, 정수리 노출 각도 회피',
  ],
  risk_factors: [
    '가족력(아버지, 할아버지): 30대 중반까지 빠르게 진행되는 패턴 가능성',
    'M자형 진행 패턴: 측두부 후퇴는 한 번 진행되면 자연 회복이 어려움',
    '정수리 패턴 동반: 본인 눈으로 확인 어려워 발견 시점이 늦는 편',
    '약물 중단 시 6개월 내 진행 재개 가능성 매우 높음',
  ],
}
