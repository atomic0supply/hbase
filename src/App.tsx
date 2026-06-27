import { useEffect, useMemo, useRef, useState } from 'react'
import { useAuth, signOutUser } from './hooks/useAuth'
import { useHousehold } from './hooks/useHousehold'
import { computeModel, dayComplete, localKey, toggleCompletion } from './lib/logic'
import { defaultRewards, defaultTasks } from './lib/defaults'
import { leaveHouseholdById, refreshInvite, updateHousehold } from './lib/household'
import { celebrate } from './lib/celebrate'
import type { Reward, RewardDraft, Task } from './types'
import { Login } from './components/Login'
import { Pairing } from './components/Pairing'
import { Splash } from './components/Splash'
import { TabBar, type View } from './components/TabBar'
import { HoyView } from './components/HoyView'
import { HogarView } from './components/HogarView'
import { OrganizarView } from './components/OrganizarView'
import { RewardEditSheet } from './components/RewardEditSheet'

const joinFromUrl = new URLSearchParams(window.location.search).get('join') ?? undefined

export default function App() {
  const { user, loading: authLoading } = useAuth()
  const { userDoc, userLoading, hid, household, householdLoading } = useHousehold(user?.uid ?? null)

  // ---- local UI state ----
  const [view, setView] = useState<View>('hoy')
  const [rewardEditing, setRewardEditing] = useState<RewardDraft | null>(null)
  const [, setTick] = useState(0)
  const rootRef = useRef<HTMLDivElement>(null)
  const celebratedKey = useRef<string | null>(null)

  // keep the date fresh across midnight while the app stays open
  useEffect(() => {
    const t = window.setInterval(() => setTick((n) => n + 1), 60_000)
    return () => window.clearInterval(t)
  }, [])

  const now = new Date()

  // when a household first loads, don't re-celebrate an already-complete day
  useEffect(() => {
    if (household) {
      const today = new Date()
      celebratedKey.current = dayComplete(household, today) === true ? localKey(today) : null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hid])

  const model = useMemo(() => (household ? computeModel(household, now) : null), [household, now])

  // ---------- routing ----------
  if (authLoading) return <Splash />
  if (!user) return <Login />
  if (userLoading) return <Splash />
  if (!hid) return <Pairing user={user} prefillCode={joinFromUrl} />
  if (householdLoading && !household) return <Splash />
  // orphaned link (household deleted) → let the user re-pair
  if (!household) return <Pairing user={user} prefillCode={joinFromUrl} />
  if (!model) return <Splash />

  const data = household

  // ---------- actions ----------
  const toggleTask = async (t: Task) => {
    const { completions, wasComplete, isComplete } = toggleCompletion(data, t, new Date())
    const k = localKey(new Date())
    if (isComplete && !wasComplete && celebratedKey.current !== k) {
      celebratedKey.current = k
      celebrate(rootRef.current)
    } else if (!isComplete && celebratedKey.current === k) {
      celebratedKey.current = null
    }
    await updateHousehold(hid, { completions, lastEditedBy: user.uid })
  }

  // activate a preprogrammed task from the catalog
  const addCatalogTask = async (t: Task) => {
    if (data.tasks.some((x) => x.id === t.id)) return
    await updateHousehold(hid, { tasks: [...data.tasks, { ...t }], lastEditedBy: user.uid })
  }
  const removeTask = async (id: string) => {
    await updateHousehold(hid, { tasks: data.tasks.filter((t) => t.id !== id) })
  }

  const saveReward = async (r: Reward) => {
    const rewards = data.rewards.slice()
    const i = rewards.findIndex((x) => x.id === r.id)
    if (i >= 0) rewards[i] = r
    else rewards.push(r)
    setRewardEditing(null)
    await updateHousehold(hid, { rewards })
  }
  const deleteReward = async (id: string) => {
    setRewardEditing(null)
    await updateHousehold(hid, { rewards: data.rewards.filter((r) => r.id !== id) })
  }

  const setName = async (which: 'a' | 'b', value: string) => {
    const people = { ...data.people, [which]: { ...data.people[which], name: value } }
    await updateHousehold(hid, { people })
  }

  const restore = () => updateHousehold(hid, { tasks: defaultTasks(), rewards: defaultRewards() })

  const addReward = () => setRewardEditing({ id: 'r' + Date.now().toString(36), emoji: '🎁', text: '', cost: 30, _new: true })

  const inviteUrl = `${window.location.origin}/?join=${household.inviteCode ?? ''}`

  return (
    <div
      ref={rootRef}
      style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#F4F0E8', position: 'relative', overflow: 'hidden' }}
    >
      <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', paddingBottom: 24 }}>
        <div style={{ height: 'env(safe-area-inset-top)' }} />
        {view === 'hoy' && <HoyView model={model} onToggle={toggleTask} />}
        {view === 'hogar' && <HogarView model={model} />}
        {view === 'organizar' && (
          <OrganizarView
            model={model}
            user={user}
            household={household}
            inviteUrl={inviteUrl}
            onNameA={(v) => setName('a', v)}
            onNameB={(v) => setName('b', v)}
            onAddTask={addCatalogTask}
            onRemoveTask={removeTask}
            onAddReward={addReward}
            onEditReward={(r) => setRewardEditing({ ...r })}
            onRestore={restore}
            onSignOut={() => signOutUser()}
            onLeave={() => leaveHouseholdById(user, hid, household)}
            onRefreshInvite={() => refreshInvite(user, hid)}
            pushEnabled={userDoc?.pushEnabled ?? false}
            notifPrefs={userDoc?.notifPrefs}
          />
        )}
      </div>

      <TabBar view={view} onChange={setView} />

      {rewardEditing && (
        <RewardEditSheet
          initial={rewardEditing}
          onClose={() => setRewardEditing(null)}
          onSave={saveReward}
          onDelete={deleteReward}
        />
      )}
    </div>
  )
}
