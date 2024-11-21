import { useState, useEffect } from 'react'
import { Save, Plus, Trash2, MoveUp, MoveDown, Edit2, Eye } from 'lucide-react'

interface Section {
  id: string;
  type: 'hero' | 'features' | 'testimonials' | 'pricing' | 'cta';
  title: string;
  content: string;
  order: number;
  isVisible: boolean;
  style?: {
    backgroundColor?: string;
    textColor?: string;
    alignment?: 'left' | 'center' | 'right';
  };
}

export function HomepageEditor() {
  const [sections, setSections] = useState<Section[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [selectedSection, setSelectedSection] = useState<Section | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [previewMode, setPreviewMode] = useState(false)

  // Fetch homepage sections
  useEffect(() => {
    const fetchSections = async () => {
      try {
        const response = await fetch('/api/admin/homepage')
        if (response.ok) {
          const data = await response.json()
          setSections(data.sort((a: Section, b: Section) => a.order - b.order))
        }
      } catch (error) {
        console.error('Error fetching homepage sections:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSections()
  }, [])

  const handleAddSection = () => {
    const newSection: Section = {
      id: '',
      type: 'hero',
      title: '',
      content: '',
      order: sections.length,
      isVisible: true,
      style: {
        backgroundColor: '#1a1a2e',
        textColor: '#ffffff',
        alignment: 'center'
      }
    }
    setSelectedSection(newSection)
    setIsEditing(true)
  }

  const handleEditSection = (section: Section) => {
    setSelectedSection(section)
    setIsEditing(true)
  }

  const handleDeleteSection = async (sectionId: string) => {
    if (!confirm('Are you sure you want to delete this section?')) return

    try {
      const response = await fetch(`/api/admin/homepage/${sectionId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setSections(prevSections => {
          const filtered = prevSections.filter(s => s.id !== sectionId)
          return filtered.map((s, idx) => ({ ...s, order: idx }))
        })
      }
    } catch (error) {
      console.error('Error deleting section:', error)
    }
  }

  const handleMoveSection = async (sectionId: string, direction: 'up' | 'down') => {
    const currentIndex = sections.findIndex(s => s.id === sectionId)
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === sections.length - 1)
    ) return

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    const newSections = [...sections]
    const [movedSection] = newSections.splice(currentIndex, 1)
    newSections.splice(newIndex, 0, movedSection)

    // Update order numbers
    const reorderedSections = newSections.map((s, idx) => ({ ...s, order: idx }))
    setSections(reorderedSections)

    try {
      await fetch('/api/admin/homepage/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reorderedSections)
      })
    } catch (error) {
      console.error('Error reordering sections:', error)
    }
  }

  const handleSaveSection = async (section: Section) => {
    try {
      const method = section.id ? 'PUT' : 'POST'
      const url = section.id ? `/api/admin/homepage/${section.id}` : '/api/admin/homepage'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(section)
      })

      if (response.ok) {
        const savedSection = await response.json()
        setSections(prevSections => {
          if (section.id) {
            return prevSections.map(s => s.id === section.id ? savedSection : s)
          }
          return [...prevSections, savedSection].sort((a, b) => a.order - b.order)
        })
        setIsEditing(false)
        setSelectedSection(null)
      }
    } catch (error) {
      console.error('Error saving section:', error)
    }
  }

  const handleToggleVisibility = async (section: Section) => {
    try {
      const updatedSection = { ...section, isVisible: !section.isVisible }
      const response = await fetch(`/api/admin/homepage/${section.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSection)
      })

      if (response.ok) {
        setSections(prevSections =>
          prevSections.map(s => s.id === section.id ? updatedSection : s)
        )
      }
    } catch (error) {
      console.error('Error toggling section visibility:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Homepage Editor</h2>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
          >
            <Eye className="w-4 h-4" />
            <span>{previewMode ? 'Exit Preview' : 'Preview'}</span>
          </button>
          <button
            onClick={handleAddSection}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/80 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Section</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {sections.map((section) => (
            <div
              key={section.id}
              className={`p-4 bg-white/5 rounded-lg border ${
                section.isVisible ? 'border-white/10' : 'border-red-500/30'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-lg font-medium">{section.title || `Untitled ${section.type}`}</span>
                  <span className="px-2 py-0.5 bg-white/10 rounded-full text-xs">
                    {section.type}
                  </span>
                  {!section.isVisible && (
                    <span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded-full text-xs">
                      Hidden
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleMoveSection(section.id, 'up')}
                    disabled={section.order === 0}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <MoveUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleMoveSection(section.id, 'down')}
                    disabled={section.order === sections.length - 1}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <MoveDown className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleToggleVisibility(section)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <Eye className={`w-4 h-4 ${section.isVisible ? 'text-white' : 'text-red-400'}`} />
                  </button>
                  <button
                    onClick={() => handleEditSection(section)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteSection(section.id)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isEditing && selectedSection && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-[#1a1a2e] rounded-lg p-6 w-full max-w-2xl">
            <h3 className="text-xl font-semibold mb-4">
              {selectedSection.id ? 'Edit Section' : 'New Section'}
            </h3>
            <form onSubmit={(e) => {
              e.preventDefault()
              handleSaveSection(selectedSection)
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1">Section Type</label>
                <select
                  value={selectedSection.type}
                  onChange={(e) => setSelectedSection({
                    ...selectedSection,
                    type: e.target.value as Section['type']
                  })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg"
                >
                  <option value="hero">Hero Section</option>
                  <option value="features">Features Section</option>
                  <option value="testimonials">Testimonials Section</option>
                  <option value="pricing">Pricing Section</option>
                  <option value="cta">Call to Action</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1">Title</label>
                <input
                  type="text"
                  value={selectedSection.title}
                  onChange={(e) => setSelectedSection({
                    ...selectedSection,
                    title: e.target.value
                  })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1">Content</label>
                <textarea
                  value={selectedSection.content}
                  onChange={(e) => setSelectedSection({
                    ...selectedSection,
                    content: e.target.value
                  })}
                  className="w-full h-48 px-4 py-2 bg-white/5 border border-white/10 rounded-lg resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-1">Background Color</label>
                  <input
                    type="color"
                    value={selectedSection.style?.backgroundColor || '#1a1a2e'}
                    onChange={(e) => setSelectedSection({
                      ...selectedSection,
                      style: { ...selectedSection.style, backgroundColor: e.target.value }
                    })}
                    className="w-full h-10 rounded-lg cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-1">Text Color</label>
                  <input
                    type="color"
                    value={selectedSection.style?.textColor || '#ffffff'}
                    onChange={(e) => setSelectedSection({
                      ...selectedSection,
                      style: { ...selectedSection.style, textColor: e.target.value }
                    })}
                    className="w-full h-10 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1">Alignment</label>
                <select
                  value={selectedSection.style?.alignment || 'center'}
                  onChange={(e) => setSelectedSection({
                    ...selectedSection,
                    style: {
                      ...selectedSection.style,
                      alignment: e.target.value as 'left' | 'center' | 'right'
                    }
                  })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg"
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </div>
              <div className="flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false)
                    setSelectedSection(null)
                  }}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary hover:bg-primary/80 rounded-lg transition-colors"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {previewMode && (
        <div className="fixed inset-0 bg-black/50 overflow-y-auto">
          <div className="min-h-screen p-4">
            <div className="max-w-5xl mx-auto bg-[#1a1a2e] rounded-lg overflow-hidden">
              <div className="p-4 bg-white/5 border-b border-white/10 flex justify-between items-center">
                <h3 className="text-lg font-medium">Preview Mode</h3>
                <button
                  onClick={() => setPreviewMode(false)}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                >
                  Close Preview
                </button>
              </div>
              <div className="p-4">
                {sections.filter(s => s.isVisible).map((section) => (
                  <div
                    key={section.id}
                    style={{
                      backgroundColor: section.style?.backgroundColor,
                      color: section.style?.textColor,
                      textAlign: section.style?.alignment || 'center'
                    }}
                    className="p-8 mb-4 rounded-lg"
                  >
                    <h2 className="text-2xl font-bold mb-4">{section.title}</h2>
                    <div className="whitespace-pre-wrap">{section.content}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
