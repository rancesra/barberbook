'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User, Session } from '@supabase/supabase-js'

interface UserState {
  user: User | null
  session: Session | null
  loading: boolean
  googleToken: string | null
}

export function useUser(): UserState {
  const [state, setState] = useState<UserState>({
    user: null,
    session: null,
    loading: true,
    googleToken: null,
  })

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getSession().then(({ data: { session } }) => {
      setState({
        user: session?.user ?? null,
        session,
        loading: false,
        googleToken: session?.provider_token ?? null,
      })
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setState({
        user: session?.user ?? null,
        session,
        loading: false,
        googleToken: session?.provider_token ?? null,
      })
    })

    return () => subscription.unsubscribe()
  }, [])

  return state
}
