import { Routes, Route } from 'react-router-dom'
import { BlogManagement } from '../components/admin/BlogManagement'
import { HomepageEditor } from '../components/admin/HomepageEditor'
import { SubscriptionManagement } from '../components/admin/SubscriptionManagement'
import { AnnouncementManagement } from '../components/admin/AnnouncementManagement'
import { AdminDashboard } from '../components/admin/AdminDashboard'

export function Admin() {
  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
      <p className="text-white/60 mb-8">Manage AUDIOMAX platform settings and content</p>

      <Routes>
        <Route index element={<AdminDashboard />} />
        <Route path="blog" element={<BlogManagement />} />
        <Route path="homepage" element={<HomepageEditor />} />
        <Route path="subscriptions" element={<SubscriptionManagement />} />
        <Route path="announcements" element={<AnnouncementManagement />} />
      </Routes>
    </div>
  )
}