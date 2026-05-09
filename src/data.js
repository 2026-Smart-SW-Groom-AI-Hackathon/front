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
