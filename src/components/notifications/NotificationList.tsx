import { MessageSquare, GitCommit, Megaphone } from 'lucide-react'

interface NotificationListProps {
  filter: string
}

export function NotificationList({ filter }: NotificationListProps) {
  const notifications = [
    {
      id: '1',
      type: 'announcements',
      title: 'New Voice Cloning Features Released',
      date: 'December 20, 2023',
      time: '3:45 PM',
      content: "We're excited to announce our latest voice cloning technology with improved accuracy and natural speech patterns.",
      icon: Megaphone
    },
    {
      id: '2',
      type: 'articles',
      title: 'Best Practices for Audio Generation',
      date: 'December 19, 2023',
      time: '11:20 AM',
      content: 'Learn how to get the most out of AUDIOMAX with our comprehensive guide to audio generation.',
      icon: MessageSquare
    },
    {
      id: '3',
      type: 'changelog',
      title: 'Platform Updates - Version 2.4.0',
      date: 'December 18, 2023',
      time: '2:30 PM',
      content: `• Improved voice cloning accuracy
• Added new voice customization options
• Enhanced audio processing speed
• Fixed minor UI issues
• Updated token usage tracking`,
      icon: GitCommit
    }
  ]

  const filteredNotifications = notifications.filter(
    notification => filter === 'all' || notification.type === filter
  )

  return (
    <div className="space-y-6">
      {filteredNotifications.map((notification) => (
        <div
          key={notification.id}
          className="bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-colors"
        >
          <div className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <notification.icon className="w-5 h-5 text-primary" />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold">{notification.title}</h3>
                  <div className="text-sm text-white/60">
                    <span>{notification.date}</span>
                    <span className="mx-2">•</span>
                    <span>{notification.time}</span>
                  </div>
                </div>
                
                <div className="text-white/80 whitespace-pre-line">
                  {notification.content}
                </div>
              </div>
            </div>
          </div>
          
          {notification.type === 'articles' && (
            <div className="px-6 py-4 border-t border-white/10 flex justify-end">
              <button className="px-4 py-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg transition-colors">
                Read More
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}