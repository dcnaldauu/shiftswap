import { supabase } from './supabase'

/**
 * Cleanup utility for old swap requests
 * Deletes requests older than 7 days with status 'Accepted' or 'Declined'
 */
export async function cleanupOldRequests() {
  try {
    // Call the database function
    const { error } = await supabase.rpc('delete_old_swap_requests')

    if (error) throw error

    console.log('✓ Cleanup completed: Old requests removed')
    return { success: true }
  } catch (error) {
    console.error('✗ Cleanup failed:', error)
    return { success: false, error }
  }
}

/**
 * Manual cleanup - deletes old requests directly
 * Use this if the database function is not available
 */
export async function manualCleanup() {
  try {
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const { data, error } = await supabase
      .from('swap_requests')
      .delete()
      .in('status', ['Accepted', 'Declined'])
      .lt('created_at', sevenDaysAgo.toISOString())

    if (error) throw error

    console.log(`✓ Manual cleanup completed: Removed ${data?.length || 0} old requests`)
    return { success: true, deleted: data?.length || 0 }
  } catch (error) {
    console.error('✗ Manual cleanup failed:', error)
    return { success: false, error }
  }
}

/**
 * Get cleanup statistics
 * Shows how many requests are eligible for deletion
 */
export async function getCleanupStats() {
  try {
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const { count, error } = await supabase
      .from('swap_requests')
      .select('*', { count: 'exact', head: true })
      .in('status', ['Accepted', 'Declined'])
      .lt('created_at', sevenDaysAgo.toISOString())

    if (error) throw error

    return {
      success: true,
      eligibleForDeletion: count || 0,
      cutoffDate: sevenDaysAgo
    }
  } catch (error) {
    console.error('✗ Failed to get cleanup stats:', error)
    return { success: false, error }
  }
}
