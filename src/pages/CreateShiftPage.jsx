import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import SignatureModal from '../components/SignatureModal'

function CreateShiftPage({ profile, onUpdateProfile }) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const swapForShiftId = searchParams.get('swapFor')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showSignatureModal, setShowSignatureModal] = useState(false)

  const [formData, setFormData] = useState({
    type: swapForShiftId ? 'Swap' : 'Giveaway',
    date: '',
    startTime: '',
    endTime: '',
    area: 'Gaming',
  })

  // Show loading if profile not loaded yet
  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-accent text-xl font-bold">Loading...</div>
      </div>
    )
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError('')
  }

  const validateShift = () => {
    const now = new Date()
    const shiftDateTime = new Date(`${formData.date}T${formData.startTime}`)

    // Check if shift is in the past
    if (shiftDateTime < now) {
      setError('Cannot post shifts that have already started')
      return false
    }

    // Check if shift is within 12 hours
    const hoursUntilShift = (shiftDateTime - now) / (1000 * 60 * 60)
    if (hoursUntilShift < 12) {
      setError('Cannot post shifts within 12 hours of start time')
      return false
    }

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Check if user has signature
    if (!profile?.signature_blob) {
      setShowSignatureModal(true)
      return
    }

    if (!validateShift()) {
      return
    }

    setLoading(true)

    try {
      if (swapForShiftId) {
        // Create swap request
        const { error: requestError } = await supabase
          .from('swap_requests')
          .insert({
            shift_id: swapForShiftId,
            proposer_id: profile.id,
            proposer_shift_date: formData.date,
            proposer_start_time: formData.startTime,
            proposer_end_time: formData.endTime,
            proposer_area: formData.area,
          })

        if (requestError) throw requestError
        alert('Swap request sent successfully!')
        navigate('/requests')
      } else {
        // Create new shift
        const { error: shiftError } = await supabase
          .from('shifts')
          .insert({
            poster_id: profile.id,
            type: formData.type,
            date: formData.date,
            start_time: formData.startTime,
            end_time: formData.endTime,
            area: formData.area,
          })

        if (shiftError) throw shiftError
        alert('Shift posted successfully!')
        navigate('/my-shifts')
      }
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-primary mb-6">
          {swapForShiftId ? 'Propose Swap' : 'Post New Shift'}
        </h1>

        <form onSubmit={handleSubmit} className="card space-y-6">
          {!swapForShiftId && (
            <div>
              <label className="label">Type</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'Giveaway' })}
                  className={`py-4 rounded-lg font-bold border-2 ${
                    formData.type === 'Giveaway'
                      ? 'bg-accent text-primary border-accent'
                      : 'bg-secondary text-primary border-gray-300'
                  }`}
                >
                  Giveaway
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'Swap' })}
                  className={`py-4 rounded-lg font-bold border-2 ${
                    formData.type === 'Swap'
                      ? 'bg-accent text-primary border-accent'
                      : 'bg-secondary text-primary border-gray-300'
                  }`}
                >
                  Swap
                </button>
              </div>
            </div>
          )}

          <div>
            <label className="label">Date</label>
            <input
              type="date"
              name="date"
              className="input"
              value={formData.date}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Start Time</label>
              <input
                type="time"
                name="startTime"
                className="input"
                value={formData.startTime}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="label">End Time</label>
              <input
                type="time"
                name="endTime"
                className="input"
                value={formData.endTime}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div>
            <label className="label">Area of Work</label>
            <select
              name="area"
              className="input"
              value={formData.area}
              onChange={handleChange}
              required
            >
              <option value="Gaming">Gaming</option>
              <option value="GPU">GPU</option>
              <option value="Bar">Bar</option>
            </select>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn-secondary flex-1"
              disabled={loading}
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary flex-1" disabled={loading}>
              {loading ? 'Posting...' : swapForShiftId ? 'Propose Swap' : 'Post Shift'}
            </button>
          </div>

          <div className="text-xs text-gray-500 border-t pt-4">
            <p className="mb-2">⚠️ Posting Requirements:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Shifts cannot be posted within 12 hours of start time</li>
              <li>All other hour restrictions are enforced by manager approval</li>
            </ul>
          </div>
        </form>
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

export default CreateShiftPage
