import { Play } from 'lucide-react'

interface TutorialSectionProps {
  searchQuery: string
}

export function TutorialSection({ searchQuery }: TutorialSectionProps) {
  const tutorials = [
    {
      title: 'Getting Started with AUDIOMAX',
      duration: '5 min',
      category: 'Basics',
      description: 'Learn the fundamentals of using AUDIOMAX and navigate the platform.'
    },
    {
      title: 'Voice Cloning Guide',
      duration: '8 min',
      category: 'Voice Cloning',
      description: 'Step-by-step guide to create and manage your voice clones.'
    },
    {
      title: 'Advanced Audio Settings',
      duration: '10 min',
      category: 'Advanced',
      description: 'Master the advanced settings for perfect audio generation.'
    },
    {
      title: 'Managing Your Files',
      duration: '6 min',
      category: 'File Management',
      description: 'Learn how to organize, share, and manage your audio files.'
    }
  ]

  const filteredTutorials = tutorials.filter(
    tutorial =>
      tutorial.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tutorial.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tutorial.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4">Tutorials & Guides</h2>

      {filteredTutorials.length === 0 ? (
        <p className="text-white/60 text-center py-8">
          No tutorials found matching your search.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTutorials.map((tutorial, index) => (
            <div
              key={index}
              className="p-4 bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-colors"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="px-2 py-1 text-xs bg-primary/20 text-primary rounded-full">
                  {tutorial.category}
                </span>
                <span className="text-sm text-white/60">{tutorial.duration}</span>
              </div>
              
              <h3 className="font-medium mb-2">{tutorial.title}</h3>
              <p className="text-sm text-white/60 mb-4">{tutorial.description}</p>
              
              <button className="flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors text-primary">
                <Play className="w-4 h-4" />
                <span>Watch Tutorial</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}