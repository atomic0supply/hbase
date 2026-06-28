import type { User } from 'firebase/auth'
import {
  arrayUnion,
  collection,
  deleteField,
  doc,
  getDoc,
  onSnapshot,
  runTransaction,
  setDoc,
  updateDoc,
} from 'firebase/firestore'
import { db } from '../firebase'
import type { Household, HouseholdData, Redemption } from '../types'
import { defaultRewards, defaultTasks, nextFreeSlot, slotColor } from './defaults'

const firstName = (u: User) => u.displayName?.split(' ')[0] || 'Compañero'

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

/** Create a household with the signed-in user as the first member, plus an invite code. */
export async function createHousehold(user: User): Promise<string> {
  const hid = doc(collection(db, 'households')).id
  const code = genInviteCode()
  const now = Date.now()
  const data: HouseholdData = {
    people: {
      a: { name: firstName(user), color: slotColor('a'), photo: user.photoURL ?? null },
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

/** Join an existing household using an invite code. Runs in a transaction so two
 *  flatmates can't claim the same slot letter at once. The invite stays usable
 *  until the household is full. */
export async function joinHousehold(user: User, rawCode: string): Promise<string> {
  const code = rawCode.trim().toUpperCase()
  if (code.length !== 6) throw new JoinError('El código debe tener 6 caracteres.')

  const inviteSnap = await getDoc(doc(db, 'invites', code))
  if (!inviteSnap.exists()) throw new JoinError('Código no válido.')
  const hid = inviteSnap.data().householdId as string
  const hhRef = doc(db, 'households', hid)

  try {
    await runTransaction(db, async (tx) => {
      const snap = await tx.get(hhRef)
      if (!snap.exists()) throw new JoinError('El hogar ya no existe.')
      const hh = snap.data() as Household
      if (hh.members.includes(user.uid)) return // already a member
      const slot = nextFreeSlot(Object.values(hh.memberSlots))
      if (!slot) throw new JoinError('El hogar ya está completo.')
      tx.update(hhRef, {
        members: arrayUnion(user.uid),
        [`memberSlots.${user.uid}`]: slot,
        [`people.${slot}`]: { name: firstName(user), color: slotColor(slot), photo: user.photoURL ?? null },
        joinCode: code, // transient handshake for the security rule
        updatedAt: Date.now(),
      })
    })
  } catch (e) {
    if (e instanceof JoinError) throw e
    throw new JoinError('No se pudo unir. Inténtalo de nuevo.')
  }

  await setDoc(
    doc(db, 'users', user.uid),
    { householdId: hid, displayName: user.displayName ?? null, photoURL: user.photoURL ?? null },
    { merge: true },
  )
  // Clear the transient joinCode now that we're a member (invite stays for more joiners).
  await updateDoc(hhRef, { joinCode: deleteField() }).catch(() => {})
  return hid
}

/** Generate a fresh invite code for an existing household (e.g. the old one expired). */
export async function refreshInvite(user: User, hid: string): Promise<string> {
  const code = genInviteCode()
  await setDoc(doc(db, 'invites', code), {
    householdId: hid,
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

/** Leave the household by id: drop yourself (member, slot and person) and clear your link.
 *  Past completions/redemptions keep your slot id (orphaned, guarded in computeModel). */
export async function leaveHouseholdById(user: User, hid: string, hh: Household): Promise<void> {
  const slot = hh.memberSlots[user.uid]
  const members = hh.members.filter((m) => m !== user.uid)
  const memberSlots = { ...hh.memberSlots }
  delete memberSlots[user.uid]
  const people = { ...hh.people }
  if (slot) delete people[slot]
  await updateDoc(doc(db, 'households', hid), { members, memberSlots, people, updatedAt: Date.now() })
  await setDoc(doc(db, 'users', user.uid), { householdId: null }, { merge: true })
}
