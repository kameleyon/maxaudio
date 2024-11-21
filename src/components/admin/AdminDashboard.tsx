import { Link } from 'react-router-dom'
import { Settings, FileText, Users, Bell } from 'lucide-react'

export function AdminDashboard() {
  const adminModules = [
    {
      title: 'Blog Management',
      icon: FileText,
      description: 'Manage blog posts, articles, and announcements',
      link: '/admin/blog'
    },
    {
      title: 'Homepage Editor',
      icon: Settings,
      description: 'Edit homepage content and layout',
      link: '/admin/homepage'
    },
    {
      title: 'Subscription Management',
      icon: Users,
      description: 'Manage subscription plans and pricing',
      link: '/admin/subscriptions'
    },
    {
      title: 'Announcements',
      icon: Bell,
      description: 'Create and manage system announcements',
      link: '/admin/announcements'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {adminModules.map((module) => (
        <Link
          key={module.title}
          to={module.link}
          className="p-6 bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-colors"
        >
          <div className="flex items-start gap-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <module.icon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">{module.title}</h3>
              <p className="text-white/60">{module.description}</p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}