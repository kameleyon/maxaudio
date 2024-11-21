import { useState } from 'react'

export function SupportTicket() {
  const [formData, setFormData] = useState({
    subject: '',
    category: 'technical',
    priority: 'normal',
    description: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle ticket submission
    console.log('Ticket submitted:', formData)
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Submit a Support Ticket</h2>
      <p className="text-white/60 mb-6">
        Need help? Submit a ticket and our support team will assist you.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="subject" className="block text-sm font-medium mb-2">
            Subject
          </label>
          <input
            type="text"
            id="subject"
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg 
                     focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary
                     placeholder-white/50 text-white"
            placeholder="Brief description of your issue"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="category" className="block text-sm font-medium mb-2">
              Category
            </label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg 
                       focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary
                       text-white"
            >
              <option value="technical">Technical Issue</option>
              <option value="billing">Billing</option>
              <option value="account">Account</option>
              <option value="feature">Feature Request</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="priority" className="block text-sm font-medium mb-2">
              Priority
            </label>
            <select
              id="priority"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg 
                       focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary
                       text-white"
            >
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-2">
            Description
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg 
                     focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary
                     placeholder-white/50 text-white min-h-[150px]"
            placeholder="Please provide as much detail as possible..."
            required
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2 bg-primary hover:bg-primary/80 rounded-lg transition-colors"
          >
            Submit Ticket
          </button>
        </div>
      </form>
    </div>
  )
}