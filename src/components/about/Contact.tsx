import { useState } from 'react'
import { Mail, MapPin, Phone } from 'lucide-react'

export function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log('Form submitted:', formData)
  }

  return (
    <div className="space-y-8">
      {/* Contact Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white/5 rounded-lg border border-white/10">
          <Mail className="w-5 h-5 text-primary mb-2" />
          <h3 className="font-medium mb-1">Email</h3>
          <p className="text-white/60 text-sm">contact@audiomax.ai</p>
        </div>
        <div className="p-4 bg-white/5 rounded-lg border border-white/10">
          <MapPin className="w-5 h-5 text-primary mb-2" />
          <h3 className="font-medium mb-1">Address</h3>
          <p className="text-white/60 text-sm">123 AI Street, Tech City, 12345</p>
        </div>
        <div className="p-4 bg-white/5 rounded-lg border border-white/10">
          <Phone className="w-5 h-5 text-primary mb-2" />
          <h3 className="font-medium mb-1">Phone</h3>
          <p className="text-white/60 text-sm">+1 (555) 123-4567</p>
        </div>
      </div>

      {/* Contact Form */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Send us a Message</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Name
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg 
                         focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                required
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg 
                         focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                required
              />
            </div>
          </div>

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
                       focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              required
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium mb-2">
              Message
            </label>
            <textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg 
                       focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary
                       min-h-[150px]"
              required
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2 bg-primary hover:bg-primary/80 rounded-lg transition-colors"
            >
              Send Message
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}