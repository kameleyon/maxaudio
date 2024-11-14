import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Tabs } from '../components/settings/Tabs'
import { CompanyInfo } from '../components/about/CompanyInfo'
import { Careers } from '../components/about/Careers'
import { Legal } from '../components/about/Legal'
import { Contact } from '../components/about/Contact'
import { AdminSection } from '../components/about/AdminSection'

export function About() {
  const [activeTab, setActiveTab] = useState('company')
  const { user } = useAuth()

  const isAdmin = user?.role === 'admin'

  const tabs = [
    { id: 'company', label: 'Company' },
    { id: 'careers', label: 'Careers' },
    { id: 'legal', label: 'Legal' },
    { id: 'contact', label: 'Contact' },
    ...(isAdmin ? [{ id: 'admin', label: 'Admin' }] : [])
  ]

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">About AUDIOMAX</h1>
      <p className="text-white/60 mb-8">Learn more about our company and mission</p>

      <div className="bg-white/5 rounded-lg border border-white/10">
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
        
        <div className="p-6">
          {activeTab === 'company' && <CompanyInfo />}
          {activeTab === 'careers' && <Careers />}
          {activeTab === 'legal' && <Legal />}
          {activeTab === 'contact' && <Contact />}
          {activeTab === 'admin' && isAdmin && <AdminSection />}
        </div>
      </div>
    </div>
  )
}
