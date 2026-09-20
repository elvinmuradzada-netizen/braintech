import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import InboxClient from './InboxClient'

export default async function InboxPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: messages } = await supabase
    .from('messages')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const all = messages || []
  const unreadCount = all.filter(m => !m.is_read).length

  return <InboxClient messages={all} unreadCount={unreadCount} />
}
