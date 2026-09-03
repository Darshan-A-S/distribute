import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Templates from './pages/Templates'
import Recipients from './pages/Recipients'
import Send from './pages/Send'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Templates />} />
        <Route path="/recipients" element={<Recipients />} />
        <Route path="/send" element={<Send />} />
      </Route>
    </Routes>
  )
}
