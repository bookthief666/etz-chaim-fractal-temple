import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { BUILD_INFO } from './data/buildInfo.js'
import './styles.css'

// Mobile WebGL QA runs through Vite's development runtime on the Fold. React
// StrictMode deliberately remounts components/effects in development, which is
// useful for ordinary DOM apps but can duplicate WebGL material/program setup
// exactly when a heavy raymarched realm is entering. Production builds do not
// need that dev-only stress behavior, and neither does physical shader QA.
console.info(`[Etz Chaim ${BUILD_INFO.milestone}] ${BUILD_INFO.codename} · ${BUILD_INFO.runtime}`)

document.documentElement.dataset.etzBuild = BUILD_INFO.runtime
document.title = `Etz Chaim · The Fractal Temple · ${BUILD_INFO.milestone}`
createRoot(document.getElementById('root')).render(<App />)
