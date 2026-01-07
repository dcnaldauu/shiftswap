import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

function MyShiftsPage({ profile }) {
  const [shifts, setShifts] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  // Show loading if profile not loaded yet
  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-accent text-xl font-bold">Loading...</div>
      </div>
    )
  }

  useEffect(() => {
    fetchMyShifts()

    const subscription = supabase
      .channel('my_shifts_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shifts' }, () => {
        fetchMyShifts()
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [profile.id])

  const fetchMyShifts = async () => {
    try {
      const { data, error } = await supabase
        .from('shifts')
        .select('*')
        .eq('poster_id', profile.id)
        .order('date', { ascending: false })
        .order('start_time', { ascending: false })

      if (error) throw error
      setShifts(data || [])
    } catch (error) {
      console.error('Error fetching my shifts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkCompleted = async (shiftId) => {
    if (!confirm('Has the manager approved this shift change?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('shifts')
        .update({ status: 'Completed' })
        .eq('id', shiftId)

      if (error) throw error
      alert('Shift marked as completed')
      fetchMyShifts()
    } catch (error) {
      console.error('Error updating shift:', error)
      alert('Failed to update shift')
    }
  }

  const handleMarkUncompleted = async (shiftId) => {
    if (!confirm('Manager declined? This will return the shift to the marketplace.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('shifts')
        .update({ status: 'Open' })
        .eq('id', shiftId)

      if (error) throw error
      alert('Shift returned to marketplace')
      fetchMyShifts()
    } catch (error) {
      console.error('Error updating shift:', error)
      alert('Failed to update shift')
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
      fetchMyShifts()
    } catch (error) {
      console.error('Error deleting shift:', error)
      alert('Failed to delete shift')
    }
  }

  const formatTime = (time) => {
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'pm' : 'am'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes}${ampm}`
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString + 'T00:00:00')
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Open':
        return 'bg-blue-100 text-blue-800'
      case 'Claimed':
        return 'bg-yellow-100 text-yellow-800'
      case 'Completed':
        return 'bg-green-100 text-green-800'
      case 'Uncompleted':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredShifts = filter === 'all'
    ? shifts
    : shifts.filter(shift => shift.status === filter)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-accent text-xl font-bold">Loading your shifts...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-primary mb-6">My Shifts</h1>

        {/* Filter Buttons */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {['all', 'Open', 'Claimed', 'Completed', 'Uncompleted'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-bold whitespace-nowrap ${
                filter === status
                  ? 'bg-accent text-primary'
                  : 'bg-secondary text-primary border-2 border-gray-300'
              }`}
            >
              {status === 'all' ? 'All' : status}
            </button>
          ))}
        </div>

        {/* Shifts List */}
        {filteredShifts.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-400 text-lg">No shifts found</p>
            <p className="text-gray-400 text-sm mt-2">Post a shift to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredShifts.map((shift) => (
              <div key={shift.id} className="card">
                {/* Status Badge */}
                <div className="flex items-center justify-between mb-4">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(shift.status)}`}>
                    {shift.status}
                  </span>
                  <span className={`text-xs font-bold px-2 py-1 rounded ${
                    shift.type === 'Giveaway'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {shift.type}
                  </span>
                </div>

                {/* Shift Details */}
                <div className="mb-4 pb-4 border-b border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-accent">{shift.area}</span>
                  </div>
                  <div className="text-lg font-bold text-primary mb-1">
                    {formatDate(shift.date)}
                  </div>
                  <div className="text-2xl font-bold text-primary">
                    {formatTime(shift.start_time)} - {formatTime(shift.end_time)}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  {shift.status === 'Open' && (
                    <button
                      onClick={() => handleDeleteShift(shift.id)}
                      className="text-red-600 font-bold py-2 px-4 rounded-lg border-2 border-red-600 hover:bg-red-50 flex-1"
                    >
                      Delete
                    </button>
                  )}

                  {shift.status === 'Claimed' && (
                    <>
                      <button
                        onClick={() => handleMarkUncompleted(shift.id)}
                        className="text-red-600 font-bold py-2 px-4 rounded-lg border-2 border-red-600 hover:bg-red-50 flex-1"
                      >
                        Declined
                      </button>
                      <button
                        onClick={() => handleMarkCompleted(shift.id)}
                        className="btn-primary flex-1"
                      >
                        Approved
                      </button>
                    </>
                  )}

                  {shift.status === 'Completed' && (
                    <div className="text-center w-full py-2 text-green-600 font-bold">
                      ✓ Manager Approved
                    </div>
                  )}

                  {shift.status === 'Uncompleted' && (
                    <div className="text-center w-full py-2 text-red-600 font-bold">
                      ✗ Returned to Marketplace
                    </div>
                  )}
                </div>

                {shift.status === 'Claimed' && (
                  <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
                    ⚠️ After manager reviews, mark as "Approved" or "Declined"
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default MyShiftsPage
