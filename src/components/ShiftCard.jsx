function ShiftCard({ shift, profile, onAction, formatTime, formatDate, isLoading }) {
  const getTimeAgo = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffDays > 0) return `${diffDays}d ago`
    if (diffHours > 0) return `${diffHours}h ago`
    if (diffMins > 0) return `${diffMins}m ago`
    return 'Just now'
  }

  const isOwnShift = shift.poster_id === profile.id

  return (
    <div className="card hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="mb-4 pb-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-bold text-accent">{shift.area}</span>
          <span className="text-xs text-gray-500">{getTimeAgo(shift.created_at)}</span>
        </div>
        <div className="text-lg font-bold text-primary mb-1">
          {formatDate(shift.date)}
        </div>
        <div className="text-2xl font-bold text-primary">
          {formatTime(shift.start_time)} - {formatTime(shift.end_time)}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          <div className="font-bold">{shift.poster?.full_name}</div>
          <div className="text-xs text-gray-500">ID: {shift.poster?.staff_id}</div>
        </div>

        {!isOwnShift && (
          <button
            onClick={() => onAction(shift)}
            disabled={isLoading}
            className={`font-bold py-2 px-6 rounded-lg ${
              shift.type === 'Giveaway'
                ? 'bg-accent text-primary hover:opacity-90'
                : 'bg-primary text-secondary hover:bg-gray-800'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isLoading ? (
              shift.type === 'Giveaway' ? 'Claiming...' : 'Loading...'
            ) : (
              shift.type === 'Giveaway' ? 'Take' : 'Propose Swap'
            )}
          </button>
        )}

        {isOwnShift && (
          <div className="text-xs text-gray-500 italic">Your shift</div>
        )}
      </div>

      {/* Type Badge */}
      <div className="mt-3 pt-3 border-t border-gray-200">
        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
          shift.type === 'Giveaway'
            ? 'bg-green-100 text-green-800'
            : 'bg-blue-100 text-blue-800'
        }`}>
          {shift.type}
        </span>
      </div>
    </div>
  )
}

export default ShiftCard
