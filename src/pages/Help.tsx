import { useState } from 'react';
import { Search, MessageSquare, FileText, Send } from 'lucide-react';
import { FAQSection } from '../components/help/FAQSection';
import { TutorialSection } from '../components/help/TutorialSection';
import { SupportTicket } from '../components/help/SupportTicket';

export function Help() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState('faq');

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Help & Support</h1>
        <p className="text-white/60">Find answers, learn more, and get assistance</p>
      </div>

      {/* Search Bar */}
      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for help..."
          className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg 
                   focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary
                   placeholder-white/50 text-white"
        />
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-4 mb-8 overflow-x-auto">
        {[
          { id: 'faq', label: 'FAQs', icon: FileText },
          { id: 'tutorials', label: 'Tutorials', icon: FileText },
          { id: 'chat', label: 'Live Chat', icon: MessageSquare },
          { id: 'ticket', label: 'Support Ticket', icon: Send }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
              activeSection === tab.id
                ? 'bg-primary text-white'
                : 'bg-white/5 text-white/80 hover:bg-white/10'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
            {tab.id === 'chat' && (
              <span className="text-xs px-2 py-0.5 bg-white/10 rounded-full">Soon</span>
            )}
          </button>
        ))}
      </div>

      {/* Content Sections */}
      <div className="bg-white/5 rounded-lg border border-white/10 p-6">
        {activeSection === 'faq' && <FAQSection searchQuery={searchQuery} />}
        {activeSection === 'tutorials' && <TutorialSection searchQuery={searchQuery} />}
        {activeSection === 'chat' && (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-white/40 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Live Chat Coming Soon</h3>
            <p className="text-white/60">
              We're working on bringing you real-time support. Stay tuned!
            </p>
          </div>
        )}
        {activeSection === 'ticket' && <SupportTicket />}
      </div>
    </div>
  );
}