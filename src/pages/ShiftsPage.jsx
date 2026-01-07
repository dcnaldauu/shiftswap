import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import ShiftCard from '../components/ShiftCard'
import SignatureModal from '../components/SignatureModal'
import { generateShiftChangePDF } from '../lib/pdfGenerator'

function ShiftsPage({ profile, onUpdateProfile }) {
  const navigate = useNavigate()
  const [shifts, setShifts] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [showSignatureModal, setShowSignatureModal] = useState(false)
  const [claimingShiftId, setClaimingShiftId] = useState(null)

  // Show loading if profile not loaded yet
  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-accent text-xl font-bold">Loading...</div>
      </div>
    )
  }

  useEffect(() => {
    fetchShifts()

    const subscription = supabase
      .channel('shifts_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shifts' }, () => {
        fetchShifts()
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [filter])

  const fetchShifts = async () => {
    try {
      let query = supabase
        .from('shifts')
        .select(`
          *,
          poster:profiles!shifts_poster_id_fkey(full_name, staff_id)
        `)
        .eq('status', 'Open')
        .order('date', { ascending: true })
        .order('start_time', { ascending: true })

      if (filter !== 'all') {
        query = query.eq('area', filter)
      }

      const { data, error } = await query

      if (error) throw error
      setShifts(data || [])
    } catch (error) {
      console.error('Error fetching shifts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTake = async (shift) => {
    // Check if user has signature
    if (!profile?.signature_blob) {
      setShowSignatureModal(true)
      return
    }

    if (shift.type === 'Giveaway') {
      // For giveaway, immediately claim and generate PDF
      setClaimingShiftId(shift.id)
      try {
        const { error: updateError } = await supabase
          .from('shifts')
          .update({ status: 'Claimed' })
          .eq('id', shift.id)

        if (updateError) throw updateError

        // Refresh shifts list immediately to remove the claimed shift
        await fetchShifts()

        // Generate and download PDF
        await generateAndDownloadGiveawayPDF(shift, profile)
      } catch (error) {
        console.error('Error claiming shift:', error)
        alert('Failed to claim shift. Please try again or contact support.')
      } finally {
        setClaimingShiftId(null)
      }
    } else {
      // For swap, navigate to request form
      navigate(`/create?swapFor=${shift.id}`)
    }
  }

  const generateAndDownloadGiveawayPDF = async (shift, recipient) => {
    try {
      // Fetch poster profile with signature
      const { data: posterProfile, error: posterError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', shift.poster_id)
        .single()

      if (posterError) {
        throw new Error('Failed to load shift poster information. Please contact support.')
      }

      // Prepare shift data for PDF
      const shiftData = {
        type: 'Giveaway',
        date: shift.date,
        start_time: shift.start_time,
        end_time: shift.end_time,
        area: shift.area,
      }

      // Generate PDF
      const pdfBlob = await generateShiftChangePDF(shiftData, posterProfile, recipient)

      // Download PDF
      const url = URL.createObjectURL(pdfBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = `shift-giveaway-${shift.date}-${posterProfile.full_name}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      alert('Shift claimed successfully! PDF downloaded. Please email it to management.')
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert(error.message || 'Shift claimed but failed to generate PDF. Please contact support.')
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-accent text-xl font-bold">Loading shifts...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-primary mb-6">Available Shifts</h1>

        {/* Filter Buttons */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {['all', 'Gaming', 'GPU', 'Bar'].map((area) => (
            <button
              key={area}
              onClick={() => setFilter(area)}
              className={`px-4 py-2 rounded-lg font-bold whitespace-nowrap ${
                filter === area
                  ? 'bg-accent text-primary'
                  : 'bg-secondary text-primary border-2 border-gray-300'
              }`}
            >
              {area === 'all' ? 'All Areas' : area}
            </button>
          ))}
        </div>

        {/* Shifts List */}
        {shifts.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-400 text-lg">No shifts available</p>
            <p className="text-gray-400 text-sm mt-2">Check back later or post your own shift</p>
          </div>
        ) : (
          <div className="space-y-4">
            {shifts.map((shift) => (
              <ShiftCard
                key={shift.id}
                shift={shift}
                profile={profile}
                onAction={handleTake}
                formatTime={formatTime}
                formatDate={formatDate}
                isLoading={claimingShiftId === shift.id}
              />
            ))}
          </div>
        )}
      </div>

      {showSignatureModal && (
        <SignatureModal
          profile={profile}
          onClose={() => setShowSignatureModal(false)}
          onComplete={() => {
            onUpdateProfile()
            setShowSignatureModal(false)
          }}
        />
      )}
    </div>
  )
}

export default ShiftsPage
