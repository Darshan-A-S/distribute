import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Templates from './pages/Templates'
import Recipients from './pages/Recipients'
import Send from './pages/Send'
import Login from './pages/Login'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<Layout />}>
        <Route path="/" element={<Templates />} />
        <Route path="/recipients" element={<Recipients />} />
        <Route path="/send" element={<Send />} />
      </Route>
    </Routes>
  )
}