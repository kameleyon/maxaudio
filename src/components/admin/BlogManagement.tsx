import { useState, useEffect } from 'react'
import { Plus, Search, Edit, Trash2, Eye, Calendar, User } from 'lucide-react'
import { format } from 'date-fns'

interface BlogPost {
  id: string;
  title: string;
  content: string;
  author: string;
  status: 'draft' | 'published';
  publishDate: string;
  lastModified: string;
}

export function BlogManagement() {
  const [searchQuery, setSearchQuery] = useState('')
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch posts
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch('/api/admin/posts')
        if (response.ok) {
          const data = await response.json()
          setPosts(data)
        }
      } catch (error) {
        console.error('Error fetching posts:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPosts()
  }, [])

  // Filter posts based on search
  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.content.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleCreatePost = () => {
    setSelectedPost({
      id: '',
      title: '',
      content: '',
      author: '',
      status: 'draft',
      publishDate: new Date().toISOString(),
      lastModified: new Date().toISOString()
    })
    setIsEditing(true)
  }

  const handleEditPost = (post: BlogPost) => {
    setSelectedPost(post)
    setIsEditing(true)
  }

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return

    try {
      const response = await fetch(`/api/admin/posts/${postId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setPosts(posts.filter(post => post.id !== postId))
      }
    } catch (error) {
      console.error('Error deleting post:', error)
    }
  }

  const handleSavePost = async (post: BlogPost) => {
    try {
      const method = post.id ? 'PUT' : 'POST'
      const url = post.id ? `/api/admin/posts/${post.id}` : '/api/admin/posts'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(post)
      })

      if (response.ok) {
        const savedPost = await response.json()
        setPosts(prevPosts => {
          if (post.id) {
            return prevPosts.map(p => p.id === post.id ? savedPost : p)
          }
          return [...prevPosts, savedPost]
        })
        setIsEditing(false)
        setSelectedPost(null)
      }
    } catch (error) {
      console.error('Error saving post:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Blog Management</h2>
        <button 
          onClick={handleCreatePost}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/80 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Post</span>
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search posts..."
          className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg 
                   focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="bg-white/5 rounded-lg border border-white/10">
          {filteredPosts.length > 0 ? (
            <div className="divide-y divide-white/10">
              {filteredPosts.map((post) => (
                <div key={post.id} className="p-4 hover:bg-white/5 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h3 className="font-medium">{post.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-white/60">
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          <span>{post.author}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{format(new Date(post.publishDate), 'MMM d, yyyy')}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          post.status === 'published' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {post.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditPost(post)}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors text-red-400"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <a
                        href={`/blog/${post.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-white/60">
              {searchQuery ? 'No posts found matching your search' : 'No posts yet'}
            </div>
          )}
        </div>
      )}

      {isEditing && selectedPost && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-[#1a1a2e] rounded-lg p-6 w-full max-w-2xl">
            <h3 className="text-xl font-semibold mb-4">
              {selectedPost.id ? 'Edit Post' : 'New Post'}
            </h3>
            <form onSubmit={(e) => {
              e.preventDefault()
              handleSavePost(selectedPost)
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1">Title</label>
                <input
                  type="text"
                  value={selectedPost.title}
                  onChange={(e) => setSelectedPost({ ...selectedPost, title: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1">Content</label>
                <textarea
                  value={selectedPost.content}
                  onChange={(e) => setSelectedPost({ ...selectedPost, content: e.target.value })}
                  className="w-full h-48 px-4 py-2 bg-white/5 border border-white/10 rounded-lg resize-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1">Status</label>
                <select
                  value={selectedPost.status}
                  onChange={(e) => setSelectedPost({ 
                    ...selectedPost, 
                    status: e.target.value as 'draft' | 'published'
                  })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
              <div className="flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false)
                    setSelectedPost(null)
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
    </div>
  )
}
