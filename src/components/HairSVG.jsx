// 정면 + 약간 위 시점 헤어라인 일러스트
const SKIN = '#f5d4b3'
const SKIN_STROKE = '#c89678'
const HAIR = '#2d2420'

export default function HairSVG({ type }) {
  const head = (
    <path
      d="M30 62 C30 32, 90 32, 90 62 C90 92, 78 108, 60 108 C42 108, 30 92, 30 62 Z"
      fill={SKIN}
      stroke={SKIN_STROKE}
      strokeWidth="1.5"
    />
  )

  const ears = (
    <>
      <path d="M28 68 C22 68, 22 80, 28 82 Z" fill={SKIN} stroke={SKIN_STROKE} strokeWidth="1" />
      <path d="M92 68 C98 68, 98 80, 92 82 Z" fill={SKIN} stroke={SKIN_STROKE} strokeWidth="1" />
    </>
  )

  const face = (
    <>
      <ellipse cx="48" cy="78" rx="1.8" ry="2.4" fill="#3b2f2a" />
      <ellipse cx="72" cy="78" rx="1.8" ry="2.4" fill="#3b2f2a" />
      <path d="M44 73 L52 71" stroke="#7a5d49" strokeWidth="1.2" strokeLinecap="round" fill="none" />
      <path d="M68 71 L76 73" stroke="#7a5d49" strokeWidth="1.2" strokeLinecap="round" fill="none" />
      <path d="M55 92 Q60 95 65 92" stroke="#3b2f2a" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </>
  )

  const sideBase = (
    <path
      d="M30 62 C30 78, 32 92, 38 100
         L38 70 C38 64, 34 60, 30 62 Z
         M90 62 C90 78, 88 92, 82 100
         L82 70 C82 64, 86 60, 90 62 Z"
      fill={HAIR}
    />
  )

  let hair = null
  switch (type) {
    case 'normal':
      hair = (
        <path
          d="M30 60
             C30 38, 42 28, 60 28
             C78 28, 90 38, 90 60
             C90 64, 88 66, 86 66
             C84 56, 76 50, 60 50
             C44 50, 36 56, 34 66
             C32 66, 30 64, 30 60 Z"
          fill={HAIR}
        />
      )
      break
    case 'mShape':
      hair = (
        <path
          d="M30 60
             C30 38, 42 28, 60 28
             C78 28, 90 38, 90 60
             C90 64, 88 66, 86 66
             C86 58, 82 50, 74 46
             C70 50, 66 56, 62 60
             C61 56, 60 54, 60 52
             C60 54, 59 56, 58 60
             C54 56, 50 50, 46 46
             C38 50, 34 58, 34 66
             C32 66, 30 64, 30 60 Z"
          fill={HAIR}
        />
      )
      break
    case 'crown':
      hair = (
        <>
          <path
            d="M30 60
               C30 38, 42 28, 60 28
               C78 28, 90 38, 90 60
               C90 64, 88 66, 86 66
               C84 56, 76 50, 60 50
               C44 50, 36 56, 34 66
               C32 66, 30 64, 30 60 Z"
            fill={HAIR}
          />
          <ellipse cx="60" cy="40" rx="13" ry="9" fill={SKIN} stroke={SKIN_STROKE} strokeWidth="0.8" />
          <ellipse cx="60" cy="40" rx="9" ry="6" fill={SKIN} opacity="0.7" />
        </>
      )
      break
    case 'diffuse':
      hair = (
        <>
          <path
            d="M30 60
               C30 38, 42 28, 60 28
               C78 28, 90 38, 90 60
               C90 64, 88 66, 86 66
               C84 56, 76 50, 60 50
               C44 50, 36 56, 34 66
               C32 66, 30 64, 30 60 Z"
            fill={HAIR}
            opacity="0.45"
          />
          {[
            [38, 58, 40, 42], [44, 54, 46, 36], [50, 52, 52, 32],
            [56, 50, 58, 30], [60, 50, 62, 30], [64, 50, 66, 30],
            [70, 52, 72, 32], [76, 54, 78, 36], [82, 58, 84, 42],
            [42, 62, 44, 46], [54, 52, 56, 34], [68, 52, 70, 34],
            [48, 52, 50, 34], [72, 54, 74, 38],
          ].map(([x1, y1, x2, y2], i) => (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke={HAIR} strokeWidth="0.8" strokeLinecap="round" opacity="0.85" />
          ))}
        </>
      )
      break
    case 'uShape':
      hair = (
        <>
          <path
            d="M30 62
               C30 56, 32 54, 36 58
               L36 74
               C34 72, 32 70, 31 68
               C30 66, 30 64, 30 62 Z"
            fill={HAIR}
          />
          <path
            d="M90 62
               C90 56, 88 54, 84 58
               L84 74
               C86 72, 88 70, 89 68
               C90 66, 90 64, 90 62 Z"
            fill={HAIR}
          />
        </>
      )
      break
    default:
      hair = null
  }

  return (
    <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      {ears}
      {head}
      {sideBase}
      {hair}
      {face}
    </svg>
  )
}
