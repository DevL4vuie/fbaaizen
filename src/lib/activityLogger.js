import { supabase } from './supabaseClient'

/**
 * Log a user activity event to the activity_logs table.
 * Silently fails — never blocks or crashes the UI.
 */
export async function logActivity(userId, action, metadata = {}) {
  if (!userId || !action) return
  try {
    await supabase.from('activity_logs').insert({
      user_id: userId,
      action,
      metadata,
    })
  } catch {
    // Silent — activity logging should never break the app
  }
}

/** Action constants */
export const ACTIONS = {
  LOGIN: 'login',
  LOGOUT: 'logout',
  PAGE_VIEW: 'page_view',
  NICHE_VIEW: 'niche_view',
  COURSE_VIEW: 'course_view',
  SUPPORT_MESSAGE: 'support_message',
  NICHE_CREATED: 'niche_created',
  NICHE_DELETED: 'niche_deleted',
  COURSE_CREATED: 'course_created',
  USER_CREATED: 'user_created',
}
