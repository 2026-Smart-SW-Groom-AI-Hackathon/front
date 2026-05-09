import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles.css'

// StrictMode는 dev에서 컴포넌트를 의도적으로 mount→unmount→mount 시키는데,
// WebSocket이 열리는 시점에 unmount가 끼면 서버가 카메라를 release해서
// Windows에서 카메라 핸들이 잠기는 증상이 있어 비활성화.
ReactDOM.createRoot(document.getElementById('root')).render(<App />)
