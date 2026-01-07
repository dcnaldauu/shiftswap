import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

function AdminPage({ profile }) {
  const [activeTab, setActiveTab] = useState('users')
  const [users, setUsers] = useState([])
  const [allShifts, setAllShifts] = useState([])
  const [allRequests, setAllRequests] = useState([])
  const [loading, setLoading] = useState(true)

  // Show loading if profile not loaded yet
  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-accent text-xl font-bold">Loading...</div>
      </div>
    )
  }

  useEffect(() => {
    if (activeTab === 'users') fetchUsers()
    if (activeTab === 'shifts') fetchAllShifts()
    if (activeTab === 'requests') fetchAllRequests()
  }, [activeTab])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAllShifts = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('shifts')
        .select(`
          *,
          poster:profiles!shifts_poster_id_fkey(full_name, staff_id, email)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setAllShifts(data || [])
    } catch (error) {
      console.error('Error fetching shifts:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAllRequests = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('swap_requests')
        .select(`
          *,
          shift:shifts!swap_requests_shift_id_fkey(date, start_time, end_time, area),
          proposer:profiles!swap_requests_proposer_id_fkey(full_name, staff_id, email)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setAllRequests(data || [])
    } catch (error) {
      console.error('Error fetching requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async (userId, userEmail) => {
    if (!confirm(`Are you sure you want to delete user ${userEmail}? This will also delete all their shifts and requests.`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId)

      if (error) throw error
      alert('User deleted successfully')
      fetchUsers()
    } catch (error) {
      console.error('Error deleting user:', error)
      alert('Failed to delete user: ' + error.message)
    }
  }

  const handleDeleteShift = async (shiftId) => {
    if (!confirm('Are you sure you want to delete this shift?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('shifts')
        .delete()
        .eq('id', shiftId)

      if (error) throw error
      alert('Shift deleted successfully')
      fetchAllShifts()
    } catch (error) {
      console.error('Error deleting shift:', error)
      alert('Failed to delete shift: ' + error.message)
    }
  }

  const handleUpdateShiftStatus = async (shiftId, newStatus) => {
    try {
      const { error } = await supabase
        .from('shifts')
        .update({ status: newStatus })
        .eq('id', shiftId)

      if (error) throw error
      alert('Shift status updated')
      fetchAllShifts()
    } catch (error) {
      console.error('Error updating shift:', error)
      alert('Failed to update shift: ' + error.message)
    }
  }

  const handleDeleteRequest = async (requestId) => {
    if (!confirm('Are you sure you want to delete this request?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('swap_requests')
        .delete()
        .eq('id', requestId)

      if (error) throw error
      alert('Request deleted successfully')
      fetchAllRequests()
    } catch (error) {
      console.error('Error deleting request:', error)
      alert('Failed to delete request: ' + error.message)
    }
  }

  const toggleAdmin = async (userId, currentStatus, userEmail) => {
    if (!confirm(`${currentStatus ? 'Remove' : 'Grant'} admin privileges for ${userEmail}?`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_admin: !currentStatus })
        .eq('id', userId)

      if (error) throw error
      alert(`Admin status updated for ${userEmail}`)
      fetchUsers()
    } catch (error) {
      console.error('Error updating admin status:', error)
      alert('Failed to update admin status: ' + error.message)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatTime = (time) => {
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'pm' : 'am'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes}${ampm}`
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-primary mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage users, shifts, and requests</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b-2 border-gray-200">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-6 py-3 font-bold ${
              activeTab === 'users'
                ? 'text-accent border-b-4 border-accent -mb-0.5'
                : 'text-gray-400'
            }`}
          >
            Users ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('shifts')}
            className={`px-6 py-3 font-bold ${
              activeTab === 'shifts'
                ? 'text-accent border-b-4 border-accent -mb-0.5'
                : 'text-gray-400'
            }`}
          >
            All Shifts ({allShifts.length})
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-6 py-3 font-bold ${
              activeTab === 'requests'
                ? 'text-accent border-b-4 border-accent -mb-0.5'
                : 'text-gray-400'
            }`}
          >
            All Requests ({allRequests.length})
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-accent text-xl font-bold">Loading...</div>
          </div>
        ) : (
          <>
            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.id} className="card">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-bold">{user.full_name}</h3>
                          {user.is_admin && (
                            <span className="bg-accent text-primary text-xs font-bold px-2 py-1 rounded">
                              ADMIN
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">Email: {user.email}</p>
                        <p className="text-sm text-gray-600">Staff ID: {user.staff_id}</p>
                        <p className="text-sm text-gray-600">
                          Joined: {formatDate(user.created_at)}
                        </p>
                        <p className="text-sm text-gray-600">
                          Signature: {user.signature_blob ? '✓ Yes' : '✗ No'}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => toggleAdmin(user.id, user.is_admin, user.email)}
                          className="btn-secondary text-sm py-2 px-4"
                          disabled={user.id === profile.id}
                        >
                          {user.is_admin ? 'Remove Admin' : 'Make Admin'}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id, user.email)}
                          className="text-red-600 font-bold py-2 px-4 rounded-lg border-2 border-red-600 hover:bg-red-50 text-sm"
                          disabled={user.id === profile.id}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* All Shifts Tab */}
            {activeTab === 'shifts' && (
              <div className="space-y-4">
                {allShifts.map((shift) => (
                  <div key={shift.id} className="card">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                          shift.status === 'Open' ? 'bg-blue-100 text-blue-800' :
                          shift.status === 'Claimed' ? 'bg-yellow-100 text-yellow-800' :
                          shift.status === 'Completed' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {shift.status}
                        </span>
                        <span className="ml-2 text-xs font-bold px-2 py-1 rounded bg-gray-100">
                          {shift.type}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-accent">{shift.area}</span>
                    </div>

                    <div className="mb-3">
                      <p className="font-bold text-lg">{formatDate(shift.date)}</p>
                      <p className="font-bold">
                        {formatTime(shift.start_time)} - {formatTime(shift.end_time)}
                      </p>
                    </div>

                    <div className="text-sm text-gray-600 mb-4">
                      <p>Posted by: {shift.poster?.full_name} ({shift.poster?.staff_id})</p>
                      <p>Email: {shift.poster?.email}</p>
                      <p>Created: {formatDate(shift.created_at)}</p>
                    </div>

                    <div className="flex gap-2">
                      <select
                        value={shift.status}
                        onChange={(e) => handleUpdateShiftStatus(shift.id, e.target.value)}
                        className="input text-sm py-2"
                      >
                        <option value="Open">Open</option>
                        <option value="Claimed">Claimed</option>
                        <option value="Completed">Completed</option>
                        <option value="Uncompleted">Uncompleted</option>
                      </select>
                      <button
                        onClick={() => handleDeleteShift(shift.id)}
                        className="text-red-600 font-bold py-2 px-4 rounded-lg border-2 border-red-600 hover:bg-red-50 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* All Requests Tab */}
            {activeTab === 'requests' && (
              <div className="space-y-4">
                {allRequests.map((request) => (
                  <div key={request.id} className="card">
                    <div className="flex items-center justify-between mb-4">
                      <span className={`text-xs font-bold px-3 py-1 rounded ${
                        request.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                        request.status === 'Accepted' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {request.status}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDate(request.created_at)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Requesting Shift</p>
                        <p className="font-bold text-sm">{formatDate(request.shift?.date)}</p>
                        <p className="text-sm">
                          {formatTime(request.shift?.start_time)} - {formatTime(request.shift?.end_time)}
                        </p>
                        <p className="text-xs text-gray-600">{request.shift?.area}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Offering Shift</p>
                        <p className="font-bold text-sm">{formatDate(request.proposer_shift_date)}</p>
                        <p className="text-sm">
                          {formatTime(request.proposer_start_time)} - {formatTime(request.proposer_end_time)}
                        </p>
                        <p className="text-xs text-gray-600">{request.proposer_area}</p>
                      </div>
                    </div>

                    <div className="text-sm text-gray-600 mb-4">
                      <p>Proposer: {request.proposer?.full_name} ({request.proposer?.staff_id})</p>
                      <p>Email: {request.proposer?.email}</p>
                    </div>

                    <button
                      onClick={() => handleDeleteRequest(request.id)}
                      className="text-red-600 font-bold py-2 px-4 rounded-lg border-2 border-red-600 hover:bg-red-50 text-sm w-full"
                    >
                      Delete Request
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default AdminPage
