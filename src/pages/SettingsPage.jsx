import { useState, useRef, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import SignatureCanvas from 'signature_pad'

function SettingsPage({ profile, onUpdate }) {
  const [activeTab, setActiveTab] = useState('password')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const canvasRef = useRef(null)
  const signaturePadRef = useRef(null)

  // Show loading if profile not loaded yet
  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-accent text-xl font-bold">Loading...</div>
      </div>
    )
  }

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  useEffect(() => {
    if (activeTab === 'signature') {
      initializeSignaturePad()
    }
  }, [activeTab])

  const initializeSignaturePad = () => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ratio = Math.max(window.devicePixelRatio || 1, 1)

    canvas.width = canvas.offsetWidth * ratio
    canvas.height = canvas.offsetHeight * ratio
    canvas.getContext('2d').scale(ratio, ratio)

    signaturePadRef.current = new SignatureCanvas(canvas, {
      backgroundColor: 'rgb(255, 255, 255)',
      penColor: 'rgb(0, 0, 0)',
    })

    // Load existing signature if available
    if (profile.signature_blob) {
      const img = new Image()
      img.onload = () => {
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, canvas.width / ratio, canvas.height / ratio)
      }
      img.src = profile.signature_blob
    }
  }

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value })
    setError('')
    setSuccess('')
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match')
      return
    }

    if (passwordData.newPassword.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      })

      if (error) throw error

      setSuccess('Password updated successfully')
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleClearSignature = () => {
    if (signaturePadRef.current) {
      signaturePadRef.current.clear()
    }
    setError('')
    setSuccess('')
  }

  const handleSaveSignature = async () => {
    if (!signaturePadRef.current || signaturePadRef.current.isEmpty()) {
      setError('Please provide a signature')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const signatureData = signaturePadRef.current.toDataURL('image/png')

      const { error } = await supabase
        .from('profiles')
        .update({ signature_blob: signatureData })
        .eq('id', profile.id)

      if (error) throw error

      setSuccess('Signature updated successfully')
      onUpdate()
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    if (confirm('Are you sure you want to sign out?')) {
      await supabase.auth.signOut()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-primary mb-6">Settings</h1>

        {/* Profile Info */}
        <div className="card mb-6">
          <h2 className="text-xl font-bold mb-4">Profile Information</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Name:</span>
              <span className="font-bold">{profile.full_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Staff ID:</span>
              <span className="font-bold">{profile.staff_id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Email:</span>
              <span className="font-bold">{profile.email}</span>
            </div>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex mb-6 border-b-2 border-gray-200">
          <button
            onClick={() => setActiveTab('password')}
            className={`flex-1 py-3 font-bold ${
              activeTab === 'password'
                ? 'text-accent border-b-4 border-accent -mb-0.5'
                : 'text-gray-400'
            }`}
          >
            Password
          </button>
          <button
            onClick={() => setActiveTab('signature')}
            className={`flex-1 py-3 font-bold ${
              activeTab === 'signature'
                ? 'text-accent border-b-4 border-accent -mb-0.5'
                : 'text-gray-400'
            }`}
          >
            Signature
          </button>
        </div>

        {/* Password Tab */}
        {activeTab === 'password' && (
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Update Password</h2>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="label">New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  className="input"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  minLength={6}
                  required
                />
              </div>

              <div>
                <label className="label">Confirm New Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  className="input"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  minLength={6}
                  required
                />
              </div>

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                  {success}
                </div>
              )}

              <button type="submit" className="btn-primary w-full" disabled={loading}>
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        )}

        {/* Signature Tab */}
        {activeTab === 'signature' && (
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Update Signature</h2>

            <div className="bg-secondary rounded-lg overflow-hidden border-4 border-accent mb-4">
              <canvas
                ref={canvasRef}
                className="w-full h-full touch-none"
                style={{ minHeight: '300px' }}
              />
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                {success}
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={handleClearSignature}
                className="btn-secondary flex-1"
                disabled={loading}
              >
                Clear
              </button>
              <button
                onClick={handleSaveSignature}
                className="btn-primary flex-1"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Signature'}
              </button>
            </div>
          </div>
        )}

        {/* Sign Out Button */}
        <div className="mt-6">
          <button
            onClick={handleSignOut}
            className="w-full py-3 px-6 text-red-600 font-bold border-2 border-red-600 rounded-lg hover:bg-red-50"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage
