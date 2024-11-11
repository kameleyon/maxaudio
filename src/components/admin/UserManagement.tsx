import { useState, useEffect } from 'react'
import { Search, Filter, UserPlus, Edit2, Trash2, Shield, Mail, Clock } from 'lucide-react'
import { format } from 'date-fns'

interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'user' | 'admin' | 'moderator';
  status: 'active' | 'suspended' | 'pending';
  lastLogin: string;
  createdAt: string;
  subscription: {
    plan: string;
    status: string;
  };
  metadata: {
    usageLimit: number;
    currentUsage: number;
  };
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/admin/users')
        if (response.ok) {
          const data = await response.json()
          setUsers(data)
        }
      } catch (error) {
        console.error('Error fetching users:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUsers()
  }, [])

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.fullName.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter

    return matchesSearch && matchesRole && matchesStatus
  })

  const handleEditUser = (user: User) => {
    setSelectedUser(user)
    setIsEditing(true)
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setUsers(users.filter(user => user.id !== userId))
      }
    } catch (error) {
      console.error('Error deleting user:', error)
    }
  }

  const handleUpdateUser = async (updatedUser: User) => {
    try {
      const response = await fetch(`/api/admin/users/${updatedUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedUser)
      })

      if (response.ok) {
        setUsers(users.map(user => 
          user.id === updatedUser.id ? updatedUser : user
        ))
        setIsEditing(false)
        setSelectedUser(null)
      }
    } catch (error) {
      console.error('Error updating user:', error)
    }
  }

  const handleSendEmail = async (userId: string) => {
    try {
      await fetch(`/api/admin/users/${userId}/send-email`, {
        method: 'POST'
      })
      // Show success message
    } catch (error) {
      console.error('Error sending email:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">User Management</h2>
        <button
          onClick={() => {
            setSelectedUser(null)
            setIsEditing(true)
          }}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/80 rounded-lg transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add User</span>
        </button>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users..."
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg 
                     focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg"
        >
          <option value="all">All Roles</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
          <option value="moderator">Moderator</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="bg-white/5 rounded-lg border border-white/10">
          {filteredUsers.length > 0 ? (
            <div className="divide-y divide-white/10">
              {filteredUsers.map((user) => (
                <div key={user.id} className="p-4 hover:bg-white/5 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h3 className="font-medium">{user.fullName}</h3>
                      <div className="flex items-center gap-4 text-sm text-white/60">
                        <span>{user.email}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          user.status === 'active' ? 'bg-green-500/20 text-green-400' :
                          user.status === 'suspended' ? 'bg-red-500/20 text-red-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {user.status}
                        </span>
                        <span className="px-2 py-0.5 bg-primary/20 text-primary rounded-full text-xs">
                          {user.role}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-white/40">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>Last login: {format(new Date(user.lastLogin), 'PPp')}</span>
                        </div>
                        <div>
                          Usage: {user.metadata.currentUsage}/{user.metadata.usageLimit}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSendEmail(user.id)}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        title="Send Email"
                      >
                        <Mail className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditUser(user)}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors text-red-400"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-white/60">
              {searchQuery || roleFilter !== 'all' || statusFilter !== 'all'
                ? 'No users found matching your filters'
                : 'No users found'}
            </div>
          )}
        </div>
      )}

      {isEditing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-[#1a1a2e] rounded-lg p-6 w-full max-w-2xl">
            <h3 className="text-xl font-semibold mb-4">
              {selectedUser ? 'Edit User' : 'Add User'}
            </h3>
            <form onSubmit={(e) => {
              e.preventDefault()
              if (selectedUser) {
                handleUpdateUser(selectedUser)
              }
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1">Full Name</label>
                <input
                  type="text"
                  value={selectedUser?.fullName || ''}
                  onChange={(e) => setSelectedUser(prev => 
                    prev ? { ...prev, fullName: e.target.value } : null
                  )}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1">Email</label>
                <input
                  type="email"
                  value={selectedUser?.email || ''}
                  onChange={(e) => setSelectedUser(prev => 
                    prev ? { ...prev, email: e.target.value } : null
                  )}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1">Role</label>
                <select
                  value={selectedUser?.role || 'user'}
                  onChange={(e) => setSelectedUser(prev => 
                    prev ? { ...prev, role: e.target.value as User['role'] } : null
                  )}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg"
                >
                  <option value="user">User</option>
                  <option value="moderator">Moderator</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1">Status</label>
                <select
                  value={selectedUser?.status || 'pending'}
                  onChange={(e) => setSelectedUser(prev => 
                    prev ? { ...prev, status: e.target.value as User['status'] } : null
                  )}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg"
                >
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1">Usage Limit</label>
                <input
                  type="number"
                  value={selectedUser?.metadata.usageLimit || 0}
                  onChange={(e) => setSelectedUser(prev => 
                    prev ? {
                      ...prev,
                      metadata: {
                        ...prev.metadata,
                        usageLimit: parseInt(e.target.value)
                      }
                    } : null
                  )}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg"
                />
              </div>
              <div className="flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false)
                    setSelectedUser(null)
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
