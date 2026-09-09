import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Templates from './pages/Templates'
import Recipients from './pages/Recipients'
import Send from './pages/Send'
import Settings from './pages/Settings'
import AdminUsers from './pages/AdminUsers'
import Login from './pages/Login'
import ResetPassword from './pages/ResetPassword'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route element={<Layout />}>
        <Route path="/" element={<Templates />} />
        <Route path="/recipients" element={<Recipients />} />
        <Route path="/send" element={<Send />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/admin/users" element={<AdminUsers />} />
      </Route>
    </Routes>
  )
}