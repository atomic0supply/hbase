import { useEffect, useState } from 'react'
import type { Household } from '../types'
import { subscribeHousehold, subscribeUserDoc, type UserDoc } from '../lib/household'

export interface HouseholdState {
  userDoc: UserDoc | null
  userLoading: boolean
  hid: string | null
  household: Household | null
  householdLoading: boolean
  error: string | null
}

/** Subscribes to the user's doc, then to the household it points at. Realtime. */
export function useHousehold(uid: string | null): HouseholdState {
  const [userDoc, setUserDoc] = useState<UserDoc | null>(null)
  const [userLoading, setUserLoading] = useState(true)
  const [household, setHousehold] = useState<Household | null>(null)
  const [householdLoading, setHouseholdLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!uid) {
      setUserDoc(null)
      setUserLoading(false)
      return
    }
    setUserLoading(true)
    return subscribeUserDoc(uid, (d) => {
      setUserDoc(d)
      setUserLoading(false)
    })
  }, [uid])

  const hid = userDoc?.householdId ?? null

  useEffect(() => {
    if (!hid) {
      setHousehold(null)
      setHouseholdLoading(false)
      return
    }
    setHouseholdLoading(true)
    setError(null)
    return subscribeHousehold(
      hid,
      (h) => {
        setHousehold(h)
        setHouseholdLoading(false)
      },
      (e) => {
        setError(e.message)
        setHouseholdLoading(false)
      },
    )
  }, [hid])

  return { userDoc, userLoading, hid, household, householdLoading, error }
}
