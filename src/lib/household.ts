import type { User } from 'firebase/auth'
import {
  arrayUnion,
  collection,
  deleteDoc,
  deleteField,
  doc,
  getDoc,
  onSnapshot,
  setDoc,
  updateDoc,
} from 'firebase/firestore'
import { db } from '../firebase'
import type { Household, HouseholdData, Redemption } from '../types'
import { DEFAULT_COLOR_A, DEFAULT_COLOR_B, defaultRewards, defaultTasks } from './defaults'

const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789' // no I, L, O, 0, 1

export function genInviteCode(): string {
  let out = ''
  const arr = new Uint32Array(6)
  crypto.getRandomValues(arr)
  for (let i = 0; i < 6; i++) out += CODE_ALPHABET[arr[i] % CODE_ALPHABET.length]
  return out
}

export interface UserDoc {
  householdId: string | null
  displayName: string | null
  photoURL: string | null
  pushEnabled?: boolean
  notifPrefs?: import('../types').NotifPrefs
  timezone?: string
}

export function subscribeUserDoc(uid: string, cb: (d: UserDoc | null) => void): () => void {
  return onSnapshot(
    doc(db, 'users', uid),
    (snap) => cb(snap.exists() ? (snap.data() as UserDoc) : null),
    () => cb(null),
  )
}

export function subscribeHousehold(
  hid: string,
  cb: (h: Household | null) => void,
  onError?: (e: Error) => void,
): () => void {
  return onSnapshot(
    doc(db, 'households', hid),
    (snap) => cb(snap.exists() ? (snap.data() as Household) : null),
    (err) => onError?.(err as Error),
  )
}

/** Create a household with the signed-in user as person A, plus an invite code for the partner. */
export async function createHousehold(user: User): Promise<string> {
  const hid = doc(collection(db, 'households')).id
  const code = genInviteCode()
  const now = Date.now()
  const data: HouseholdData = {
    people: {
      a: { name: user.displayName?.split(' ')[0] || 'Yo', color: DEFAULT_COLOR_A },
      b: { name: 'Pareja', color: DEFAULT_COLOR_B },
    },
    tasks: defaultTasks(),
    rewards: defaultRewards(),
    completions: {},
    redemptions: [],
  }
  const household: Household = {
    ...data,
    members: [user.uid],
    memberSlots: { [user.uid]: 'a' },
    inviteCode: code,
    createdBy: user.uid,
    createdAt: now,
    updatedAt: now,
  }
  await setDoc(doc(db, 'households', hid), household)
  await setDoc(doc(db, 'invites', code), {
    householdId: hid,
    slot: 'b',
    createdBy: user.uid,
    createdAt: now,
  })
  await setDoc(
    doc(db, 'users', user.uid),
    { householdId: hid, displayName: user.displayName ?? null, photoURL: user.photoURL ?? null },
    { merge: true },
  )
  return hid
}

export class JoinError extends Error {}

/** Join an existing household using an invite code. */
export async function joinHousehold(user: User, rawCode: string): Promise<string> {
  const code = rawCode.trim().toUpperCase()
  if (code.length !== 6) throw new JoinError('El código debe tener 6 caracteres.')

  const inviteSnap = await getDoc(doc(db, 'invites', code))
  if (!inviteSnap.exists()) throw new JoinError('Código no válido o ya usado.')
  const hid = inviteSnap.data().householdId as string

  try {
    await updateDoc(doc(db, 'households', hid), {
      members: arrayUnion(user.uid),
      [`memberSlots.${user.uid}`]: 'b',
      'people.b.name': user.displayName?.split(' ')[0] || 'Pareja',
      inviteCode: null,
      joinCode: code,
      updatedAt: Date.now(),
    })
  } catch {
    throw new JoinError('No se pudo unir: el hogar ya está completo o el código ha caducado.')
  }

  await setDoc(
    doc(db, 'users', user.uid),
    { householdId: hid, displayName: user.displayName ?? null, photoURL: user.photoURL ?? null },
    { merge: true },
  )
  // Consume the invite and clean up the transient joinCode (now allowed as a member).
  await deleteDoc(doc(db, 'invites', code)).catch(() => {})
  await updateDoc(doc(db, 'households', hid), { joinCode: deleteField() }).catch(() => {})
  return hid
}

/** Generate a fresh invite code for an existing household (e.g. the old one expired). */
export async function refreshInvite(user: User, hid: string): Promise<string> {
  const code = genInviteCode()
  await setDoc(doc(db, 'invites', code), {
    householdId: hid,
    slot: 'b',
    createdBy: user.uid,
    createdAt: Date.now(),
  })
  await updateDoc(doc(db, 'households', hid), { inviteCode: code, updatedAt: Date.now() })
  return code
}

/** Persist a partial update to the shared household data. */
export async function updateHousehold(
  hid: string,
  patch: Partial<HouseholdData> & { lastEditedBy?: string },
): Promise<void> {
  await updateDoc(doc(db, 'households', hid), { ...patch, updatedAt: Date.now() })
}

/** Append a redemption atomically (arrayUnion avoids losing concurrent redeems). */
export async function redeemReward(hid: string, redemption: Redemption, by: string): Promise<void> {
  await updateDoc(doc(db, 'households', hid), {
    redemptions: arrayUnion(redemption),
    lastEditedBy: by,
    updatedAt: Date.now(),
  })
}

/** Leave the household by id: drop yourself from members and clear your user link. */
export async function leaveHouseholdById(user: User, hid: string, hh: Household): Promise<void> {
  const members = hh.members.filter((m) => m !== user.uid)
  const memberSlots = { ...hh.memberSlots }
  delete memberSlots[user.uid]
  await updateDoc(doc(db, 'households', hid), { members, memberSlots, updatedAt: Date.now() })
  await setDoc(doc(db, 'users', user.uid), { householdId: null }, { merge: true })
}
