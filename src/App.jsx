import { useMemo, useState } from 'react'
import { calcScore } from './data.js'
import GeneticsPage from './pages/GeneticsPage.jsx'
import HairlinePage from './pages/HairlinePage.jsx'
import StreamingPage from './pages/StreamingPage.jsx'
import ResultPage from './pages/ResultPage.jsx'

const initialData = () => ({
  gender: null,
  hasFamilyHairLoss: null,
  family: new Set(),
  hasMedication: null,
  hairTypes: new Set(),
})

export default function App() {
  const [step, setStep] = useState(1)
  const [data, setData] = useState(initialData)
  const score = useMemo(() => calcScore(data), [data])

  const reset = () => {
    setData(initialData())
    setStep(1)
  }

  return (
    <div className="app">
      <div className="progress-bar">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className={'progress-step ' + (step >= s ? 'active' : '')} />
        ))}
      </div>

      {step === 1 && (
        <GeneticsPage data={data} setData={setData} onNext={() => setStep(2)} />
      )}
      {step === 2 && (
        <HairlinePage
          data={data}
          setData={setData}
          score={score}
          onPrev={() => setStep(1)}
          onNext={() => setStep(3)}
        />
      )}
      {step === 3 && (
        <StreamingPage
          data={data}
          score={score}
          onPrev={() => setStep(2)}
          onNext={() => setStep(4)}
        />
      )}
      {step === 4 && (
        <ResultPage onRetake={reset} />
      )}
    </div>
  )
}
