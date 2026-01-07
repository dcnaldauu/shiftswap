import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { generateShiftChangePDF } from '../lib/pdfGenerator'

function RequestsPage({ profile }) {
  const [incomingRequests, setIncomingRequests] = useState([])
  const [outgoingRequests, setOutgoingRequests] = useState([])
  const [activeTab, setActiveTab] = useState('incoming')
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
    fetchRequests()

    const subscription = supabase
      .channel('requests_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'swap_requests' }, () => {
        fetchRequests()
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [profile.id])

  const fetchRequests = async () => {
    try {
      // Fetch all requests with shift and profile data
      const { data: allRequests, error: requestsError } = await supabase
        .from('swap_requests')
        .select(`
          *,
          shift:shifts!swap_requests_shift_id_fkey(*, poster:profiles!shifts_poster_id_fkey(full_name, staff_id)),
          proposer:profiles!swap_requests_proposer_id_fkey(full_name, staff_id, signature_blob)
        `)
        .in('status', ['Pending', 'Accepted', 'Declined'])
        .order('created_at', { ascending: false })

      if (requestsError) throw requestsError

      // Filter incoming and outgoing on the client side
      const incoming = (allRequests || []).filter(req => req.shift?.poster_id === profile.id)
      const outgoing = (allRequests || []).filter(req => req.proposer_id === profile.id)

      setIncomingRequests(incoming)
      setOutgoingRequests(outgoing)
    } catch (error) {
      console.error('Error fetching requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAccept = async (request) => {
    try {
      // Update this request to Accepted
      const { error: acceptError } = await supabase
        .from('swap_requests')
        .update({ status: 'Accepted' })
        .eq('id', request.id)

      if (acceptError) throw new Error('Failed to accept swap request. Please try again.')

      // Decline all other requests for the same shift
      const { error: declineError } = await supabase
        .from('swap_requests')
        .update({ status: 'Declined' })
        .eq('shift_id', request.shift_id)
        .neq('id', request.id)
        .eq('status', 'Pending')

      if (declineError) throw new Error('Failed to decline other requests. Please contact support.')

      // Update shift status to Claimed
      const { error: shiftError } = await supabase
        .from('shifts')
        .update({ status: 'Claimed' })
        .eq('id', request.shift_id)

      if (shiftError) throw new Error('Failed to update shift status. Please contact support.')

      // Generate and download PDF
      await generateAndDownloadPDF(request)

      fetchRequests()
    } catch (error) {
      console.error('Error accepting request:', error)
      alert(error.message || 'Failed to accept request. Please try again or contact support.')
    }
  }

  const handleDecline = async (requestId) => {
    try {
      const { error } = await supabase
        .from('swap_requests')
        .update({ status: 'Declined' })
        .eq('id', requestId)

      if (error) throw new Error('Failed to decline request. Please try again.')
      fetchRequests()
    } catch (error) {
      console.error('Error declining request:', error)
      alert(error.message || 'Failed to decline request. Please try again or contact support.')
    }
  }

  const generateAndDownloadPDF = async (request) => {
    try {
      // Fetch poster profile with signature
      const { data: posterProfile, error: posterError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', request.shift.poster_id)
        .single()

      if (posterError) {
        throw new Error('Failed to load your profile information. Please contact support.')
      }

      // Fetch proposer profile with signature
      const { data: proposerProfile, error: proposerError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', request.proposer_id)
        .single()

      if (proposerError) {
        throw new Error('Failed to load proposer profile information. Please contact support.')
      }

      // Prepare shift data for PDF
      const shiftData = {
        type: 'Swap',
        date: request.shift.date,
        start_time: request.shift.start_time,
        end_time: request.shift.end_time,
        area: request.shift.area,
        proposerShift: {
          date: request.proposer_shift_date,
          start_time: request.proposer_start_time,
          end_time: request.proposer_end_time,
          area: request.proposer_area,
        }
      }

      // Generate PDF
      const pdfBlob = await generateShiftChangePDF(shiftData, posterProfile, proposerProfile)

      // Download PDF
      const url = URL.createObjectURL(pdfBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = `shift-swap-${request.shift.date}-${posterProfile.full_name}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      alert('Swap accepted! PDF downloaded. Please email it to management.')
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert(error.message || 'Swap accepted but failed to generate PDF. Please contact support.')
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
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-accent text-xl font-bold">Loading requests...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-primary mb-6">Requests</h1>

        {/* Tab Buttons */}
        <div className="flex mb-6 border-b-2 border-gray-200">
          <button
            onClick={() => setActiveTab('incoming')}
            className={`flex-1 py-3 font-bold ${
              activeTab === 'incoming'
                ? 'text-accent border-b-4 border-accent -mb-0.5'
                : 'text-gray-400'
            }`}
          >
            Incoming ({incomingRequests.filter(r => r.status === 'Pending').length})
          </button>
          <button
            onClick={() => setActiveTab('outgoing')}
            className={`flex-1 py-3 font-bold ${
              activeTab === 'outgoing'
                ? 'text-accent border-b-4 border-accent -mb-0.5'
                : 'text-gray-400'
            }`}
          >
            Outgoing ({outgoingRequests.filter(r => r.status === 'Pending').length})
          </button>
        </div>

        {/* Incoming Requests */}
        {activeTab === 'incoming' && (
          <div className="space-y-4">
            {incomingRequests.length === 0 ? (
              <div className="card text-center py-12">
                <p className="text-gray-400 text-lg">No incoming requests</p>
              </div>
            ) : (
              incomingRequests.map((request) => (
                <div key={request.id} className="card">
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-accent">
                        {request.proposer.full_name}
                      </span>
                      <span className={`text-xs font-bold px-2 py-1 rounded ${
                        request.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                        request.status === 'Accepted' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {request.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">ID: {request.proposer.staff_id}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-xs text-gray-500 mb-1">Your Shift</p>
                      <p className="font-bold">{formatDate(request.shift.date)}</p>
                      <p className="font-bold">
                        {formatTime(request.shift.start_time)} - {formatTime(request.shift.end_time)}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">{request.shift.area}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-xs text-gray-500 mb-1">Their Shift</p>
                      <p className="font-bold">{formatDate(request.proposer_shift_date)}</p>
                      <p className="font-bold">
                        {formatTime(request.proposer_start_time)} - {formatTime(request.proposer_end_time)}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">{request.proposer_area}</p>
                    </div>
                  </div>

                  {request.status === 'Pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDecline(request.id)}
                        className="btn-secondary flex-1"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => handleAccept(request)}
                        className="btn-primary flex-1"
                      >
                        Accept
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Outgoing Requests */}
        {activeTab === 'outgoing' && (
          <div className="space-y-4">
            {outgoingRequests.length === 0 ? (
              <div className="card text-center py-12">
                <p className="text-gray-400 text-lg">No outgoing requests</p>
              </div>
            ) : (
              outgoingRequests.map((request) => (
                <div key={request.id} className="card">
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-accent">
                        To: {request.shift.poster.full_name}
                      </span>
                      <span className={`text-xs font-bold px-2 py-1 rounded ${
                        request.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                        request.status === 'Accepted' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {request.status}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-xs text-gray-500 mb-1">Their Shift</p>
                      <p className="font-bold">{formatDate(request.shift.date)}</p>
                      <p className="font-bold">
                        {formatTime(request.shift.start_time)} - {formatTime(request.shift.end_time)}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">{request.shift.area}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-xs text-gray-500 mb-1">Your Shift</p>
                      <p className="font-bold">{formatDate(request.proposer_shift_date)}</p>
                      <p className="font-bold">
                        {formatTime(request.proposer_start_time)} - {formatTime(request.proposer_end_time)}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">{request.proposer_area}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default RequestsPage
