import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Templates from './pages/Templates'
import Recipients from './pages/Recipients'
import Send from './pages/Send'
import Settings from './pages/Settings'
import AdminUsers from './pages/AdminUsers'
import Login from './pages/Login'
import ResetPassword from './pages/ResetPassword'
import Landing from './pages/Landing'
import Docs from './pages/Docs'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/" element={<Landing />} />
      <Route path="/docs" element={<Docs />} />
      <Route path="/app" element={<Layout />}>
        <Route index element={<Templates />} />
        <Route path="recipients" element={<Recipients />} />
        <Route path="send" element={<Send />} />
        <Route path="settings" element={<Settings />} />
        <Route path="admin/users" element={<AdminUsers />} />
      </Route>
    </Routes>
  )
}