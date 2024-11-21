import { Settings, FileText, Users, Bell } from 'lucide-react'

export function AdminSection() {
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
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-2">Admin Dashboard</h2>
        <p className="text-white/60">Manage AUDIOMAX content and settings</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {adminModules.map((module) => (
          <div
            key={module.title}
            className="p-4 bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-colors"
          >
            <div className="flex items-start gap-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <module.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium mb-1">{module.title}</h3>
                <p className="text-sm text-white/60 mb-4">{module.description}</p>
                <button
                  onClick={() => console.log(`Navigate to ${module.link}`)}
                  className="px-4 py-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg transition-colors"
                >
                  Manage
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
        <p className="text-yellow-500 text-sm">
          Note: Admin panel features are currently in development. Full functionality coming soon.
        </p>
      </div>
    </div>
  )
}