'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const loginUser = async (data: { email: string; password: string }) => {
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  })

  if (error) {
    return { error: error.message }
  }

  redirect('/dashboard/analytics')
}