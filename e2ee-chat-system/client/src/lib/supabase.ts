import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ubbuoexadoiejgrrztdw.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InViYnVvZXhhZG9pZWpncnJ6dGR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1ODMxMTQsImV4cCI6MjA3MjE1OTExNH0.16AvQRphFLkDdgIZF87imC_9xg0Qg8JLhB_LoYwJTaE'

export const supabase = createClient(supabaseUrl, supabaseKey)

// Database interface types
export interface SupabaseUser {
  id: string
  username: string
  public_key: string
  is_online: boolean
  last_seen: string
  created_at: string
}

export interface SupabaseMessage {
  id: string
  sender_id: string
  receiver_id: string
  encrypted_content: string
  message_type: string
  timestamp: string
}
