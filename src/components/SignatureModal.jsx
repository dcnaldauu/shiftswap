import { useEffect, useRef, useState } from 'react'
import SignatureCanvas from 'signature_pad'
import { supabase } from '../lib/supabase'

function SignatureModal({ profile, onClose, onComplete }) {
  const canvasRef = useRef(null)
  const signaturePadRef = useRef(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ratio = Math.max(window.devicePixelRatio || 1, 1)

    canvas.width = canvas.offsetWidth * ratio
    canvas.height = canvas.offsetHeight * ratio
    canvas.getContext('2d').scale(ratio, ratio)

    signaturePadRef.current = new SignatureCanvas(canvas, {
      backgroundColor: 'rgb(255, 255, 255)',
      penColor: 'rgb(0, 0, 0)',
    })

    const handleResize = () => {
      const data = signaturePadRef.current.toData()
      canvas.width = canvas.offsetWidth * ratio
      canvas.height = canvas.offsetHeight * ratio
      canvas.getContext('2d').scale(ratio, ratio)
      signaturePadRef.current.clear()
      signaturePadRef.current.fromData(data)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleClear = () => {
    signaturePadRef.current.clear()
    setError('')
  }

  const handleSave = async () => {
    if (signaturePadRef.current.isEmpty()) {
      setError('Please provide a signature')
      return
    }

    setLoading(true)
    setError('')

    try {
      const signatureData = signaturePadRef.current.toDataURL('image/png')

      const { error } = await supabase
        .from('profiles')
        .update({ signature_blob: signatureData })
        .eq('id', profile.id)

      if (error) throw error

      onComplete()
      onClose()
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-secondary rounded-lg max-w-2xl w-full p-6">
        <h2 className="text-2xl font-bold text-primary mb-2">Signature Required</h2>
        <p className="text-gray-600 mb-6">
          Please provide your signature before posting or taking shifts
        </p>

        <div className="bg-secondary rounded-lg overflow-hidden border-4 border-accent mb-4">
          <canvas
            ref={canvasRef}
            className="w-full h-full touch-none"
            style={{ minHeight: '250px' }}
          />
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="btn-secondary flex-1"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleClear}
            className="btn-secondary flex-1"
            disabled={loading}
          >
            Clear
          </button>
          <button
            onClick={handleSave}
            className="btn-primary flex-1"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Signature'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default SignatureModal
