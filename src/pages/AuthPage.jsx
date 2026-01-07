import { useState } from 'react'
import { supabase } from '../lib/supabase'

function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    staffId: '',
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError('')
    setSuccess('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        })
        if (error) throw error
      } else {
        // Validate staff ID format
        if (!/^\d{4}$/.test(formData.staffId)) {
          throw new Error('Staff ID must be exactly 4 digits')
        }

        const { error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.fullName,
              staff_id: formData.staffId,
            },
          },
        })
        if (error) throw error
      }
    } catch (error) {
      setError(error.message || 'An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
        redirectTo: `${window.location.origin}/#/reset-password`,
      })

      if (error) throw error

      setSuccess('Password reset email sent! Check your inbox.')
      setTimeout(() => {
        setShowForgotPassword(false)
        setSuccess('')
      }, 3000)
    } catch (error) {
      setError(error.message || 'Failed to send password reset email. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-accent mb-2">ShiftSwap</h1>
          <p className="text-gray-400">Internal Shift Management</p>
        </div>

        <div className="card">
          {!showForgotPassword ? (
            <>
              <div className="flex mb-6 border-b border-gray-200">
                <button
                  className={`flex-1 py-3 font-bold ${
                    isLogin ? 'text-accent border-b-2 border-accent' : 'text-gray-400'
                  }`}
                  onClick={() => {
                    setIsLogin(true)
                    setError('')
                    setSuccess('')
                  }}
                >
                  Login
                </button>
                <button
                  className={`flex-1 py-3 font-bold ${
                    !isLogin ? 'text-accent border-b-2 border-accent' : 'text-gray-400'
                  }`}
                  onClick={() => {
                    setIsLogin(false)
                    setError('')
                    setSuccess('')
                  }}
                >
                  Sign Up
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <label className="label">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    className="input"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label className="label">4-Digit Staff ID</label>
                  <input
                    type="text"
                    name="staffId"
                    className="input"
                    value={formData.staffId}
                    onChange={handleChange}
                    maxLength={4}
                    pattern="\d{4}"
                    placeholder="0000"
                    required
                  />
                </div>
              </>
            )}

            <div>
              <label className="label">Email</label>
              <input
                type="email"
                name="email"
                className="input"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="label">Password</label>
              <input
                type="password"
                name="password"
                className="input"
                value={formData.password}
                onChange={handleChange}
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
              {loading ? 'Loading...' : isLogin ? 'Login' : 'Sign Up'}
            </button>

            {isLogin && (
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(true)
                    setError('')
                    setSuccess('')
                  }}
                  className="text-sm text-accent hover:underline"
                >
                  Forgot password?
                </button>
              </div>
            )}
          </form>
            </>
          ) : (
            <>
              <div className="mb-6">
                <button
                  onClick={() => {
                    setShowForgotPassword(false)
                    setError('')
                    setSuccess('')
                  }}
                  className="text-accent hover:underline text-sm"
                >
                  ← Back to login
                </button>
              </div>

              <h2 className="text-2xl font-bold text-primary mb-4">Reset Password</h2>
              <p className="text-gray-600 text-sm mb-6">
                Enter your email address and we'll send you a link to reset your password.
              </p>

              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <label className="label">Email</label>
                  <input
                    type="email"
                    name="email"
                    className="input"
                    value={formData.email}
                    onChange={handleChange}
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
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default AuthPage
