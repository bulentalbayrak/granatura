'use server'

import { createClient } from '@/lib/supabase/server'

export const loginUser = async (data: { email: string; password: string }) => {
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}