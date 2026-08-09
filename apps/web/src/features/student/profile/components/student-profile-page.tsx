import { ArrowLeft, ArrowRight, BadgeCheck, BriefcaseBusiness, Camera, Check, CircleUserRound, Compass, GraduationCap, Pencil, TrendingUp } from 'lucide-react'
import { useEffect, useRef, useState, type ComponentType } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { StudentPageHeader } from '@/features/student/components/student-page-header'
import { getStudentProfile, StudentProfileApiError, updateStudentProfile, uploadStudentProfilePhoto } from '@/features/student/profile/student-profile-api'
import type { StudentProfileData, StudentProfileFields } from '@/features/student/profile/student-profile-types'
import { cn } from '@/lib/utils'

interface StudentProfilePageProps { onBack: () => void }

function StudentProfilePage({ onBack }: StudentProfilePageProps) {
  const [profile, setProfile] = useState<StudentProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)
  const [uploading, setUploading] = useState(false)
  const photoInput = useRef<HTMLInputElement>(null)

  const load = () => {
    setLoading(true); setError(null)
    getStudentProfile().then(setProfile).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'Your profile could not be loaded.')).finally(() => setLoading(false))
  }
  useEffect(() => { let active = true; getStudentProfile().then((data) => { if (active) setProfile(data) }).catch((reason: unknown) => { if (active) setError(reason instanceof Error ? reason.message : 'Your profile could not be loaded.') }).finally(() => { if (active) setLoading(false) }); return () => { active = false } }, [])

  if (loading) return <ProfileLoading />
  if (error || !profile) return <ProfileError message={error ?? 'Your profile could not be loaded.'} onRetry={load} />

  const initials = profile.student.name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'ST'
  const uploadPhoto = async (file?: File) => {
    if (!file) return
    setUploading(true)
    try { setProfile(await uploadStudentProfilePhoto(file)); toast.success('Profile photo updated.') }
    catch (reason) { toast.error(reason instanceof Error ? reason.message : 'The profile photo could not be uploaded.') }
    finally { setUploading(false); if (photoInput.current) photoInput.current.value = '' }
  }

  return <div className="student-grid-page min-h-[calc(100svh-5rem)] px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
    <div className="mx-auto max-w-6xl space-y-6 profile-enter">
      <StudentPageHeader title={editing ? 'Build your profile' : 'Student profile'} description="Your recorded interests and self-reported learning profile." onBack={editing ? () => setEditing(false) : onBack} actions={!editing ? <Button type="button" onClick={() => setEditing(true)} className="rounded-lg"><Pencil aria-hidden="true" />Edit profile</Button> : undefined} />

      <header className="profile-identity-hero relative overflow-hidden rounded-2xl bg-primary text-primary-foreground shadow-sm">
        <div className="absolute -right-16 -top-24 size-72 rounded-full bg-primary-fixed/15" aria-hidden="true" />
        <div className="absolute bottom-0 right-0 h-24 w-2/5 -skew-x-12 bg-secondary-container/15" aria-hidden="true" />
        <div className="relative grid gap-7 px-5 py-7 sm:px-8 sm:py-9 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-center">
          <div className="relative w-fit">
            <div className="profile-photo-ring flex size-28 items-center justify-center overflow-hidden rounded-[2rem] bg-primary-fixed text-3xl font-bold text-on-primary-fixed shadow-sm sm:size-32">
              {profile.student.photoUrl ? <img src={profile.student.photoUrl} alt={`${profile.student.name} profile`} className="size-full object-cover" /> : <span aria-label={`${profile.student.name} initials`}>{initials}</span>}
            </div>
            <input ref={photoInput} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" aria-label="Choose profile photo" onChange={(event) => void uploadPhoto(event.target.files?.[0])} />
            <button type="button" disabled={uploading} onClick={() => photoInput.current?.click()} className="absolute -bottom-2 -right-2 flex size-11 items-center justify-center rounded-full bg-secondary-container text-on-secondary-container shadow-lg transition motion-safe:hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-white/50" aria-label="Upload profile photo"><Camera className="size-5" aria-hidden="true" /></button>
          </div>
          <div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/65">My learning identity</p><h1 className="mt-2 font-display text-3xl font-bold sm:text-5xl">{profile.student.name}</h1><p className="mt-2 text-sm text-white/70">{profile.student.email}</p><p className="mt-5 max-w-2xl text-sm leading-6 text-white/80">{profile.about}</p></div>
          <div className="flex gap-3 lg:flex-col lg:items-end"><IdentityStamp label="Interest code" value={profile.riasec?.code ?? 'Pending'} /><IdentityStamp label="Profile" value={profile.questionnaire.complete ? 'Complete' : 'In progress'} /></div>
        </div>
      </header>

      {editing ? <ProfileBuilder profile={profile} onCancel={() => setEditing(false)} onSaved={(updated) => { setProfile(updated); setEditing(false); toast.success('Student profile saved.') }} /> : <ProfilePortrait profile={profile} onEdit={() => setEditing(true)} />}
      <p className="px-1 text-xs leading-5 text-muted-foreground">Strengths, growth areas, and learning preferences are student-selected self-report information. They are not a diagnosis or a validated measure of ability or personality.</p>
    </div>
  </div>
}

function ProfilePortrait({ profile, onEdit }: { profile: StudentProfileData; onEdit: () => void }) {
  return <div className="grid gap-6 lg:grid-cols-[minmax(0,1.12fr)_minmax(19rem,.88fr)]">
    <section className="overflow-hidden rounded-2xl bg-card shadow-sm" aria-labelledby="profile-story-heading">
      <div className="p-6 sm:p-8"><p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">The student behind the scores</p><h2 id="profile-story-heading" className="mt-2 font-display text-3xl font-bold">How I learn and grow</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">A student-selected snapshot designed to support course conversations—not define ability or personality.</p></div>
      <div className="divide-y divide-border">
        <ProfileLane number="01" icon={BadgeCheck} title="Strengths I recognize" values={profile.questionnaire.strengths} empty="No strengths selected yet." tone="blue" />
        <ProfileLane number="02" icon={TrendingUp} title="What I want to develop" values={profile.questionnaire.growthAreas} empty="No growth areas selected yet." tone="orange" />
        <ProfileLane number="03" icon={GraduationCap} title="How I prefer to learn" values={profile.questionnaire.learningPreferences} empty="No learning preferences selected yet." tone="green" />
      </div>
      {!profile.questionnaire.complete ? <div className="flex flex-col gap-3 bg-primary-fixed/55 p-5 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm font-medium text-on-primary-fixed">Complete all three parts to finish your student profile.</p><Button type="button" onClick={onEdit}>Continue profile</Button></div> : null}
    </section>

    <aside className="overflow-hidden rounded-2xl bg-primary-fixed/60 text-on-primary-fixed shadow-sm" aria-labelledby="interest-compass-heading">
      <div className="p-6 sm:p-8"><div className="flex items-center justify-between"><span className="flex size-11 items-center justify-center rounded-full bg-primary text-primary-foreground"><Compass className="size-5" aria-hidden="true" /></span><span className="font-display text-5xl font-bold tracking-tight">{profile.riasec?.code ?? '—'}</span></div><p className="mt-8 text-xs font-semibold uppercase tracking-[0.15em]">Recorded interest compass</p><h2 id="interest-compass-heading" className="mt-2 font-display text-2xl font-bold">{profile.riasec ? `${profile.riasec.primary?.label} × ${profile.riasec.secondary?.label}` : 'Assessment not completed'}</h2><p className="mt-3 text-sm leading-6 text-on-primary-fixed-variant">{profile.riasec ? 'Your two strongest recorded RIASEC areas from the latest completed assessment.' : 'Complete your RIASEC assessment to add your recorded interests here.'}</p></div>
      <div className="bg-card/75 p-6 text-foreground sm:p-8"><div className="flex items-center gap-3"><BriefcaseBusiness className="size-5 text-primary" aria-hidden="true" /><h3 className="font-display text-lg font-bold">Career directions to explore</h3></div>{profile.careerInterests.length ? <ul className="mt-5 space-y-3">{profile.careerInterests.map((career, index) => <li key={career} className="flex gap-3 text-sm leading-5"><span className="font-label text-xs font-bold text-secondary-container">{String(index + 1).padStart(2, '0')}</span><span>{career}</span></li>)}</ul> : <p className="mt-4 text-sm leading-6 text-muted-foreground">Career directions will appear only when they are available from recorded programme matches.</p>}</div>
    </aside>
  </div>
}

function ProfileBuilder({ profile, onCancel, onSaved }: { profile: StudentProfileData; onCancel: () => void; onSaved: (profile: StudentProfileData) => void }) {
  const [step, setStep] = useState(0)
  const [fields, setFields] = useState<StudentProfileFields>({ strengths: profile.questionnaire.strengths, growthAreas: profile.questionnaire.growthAreas, learningPreferences: profile.questionnaire.learningPreferences })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const sections = [
    { key: 'strengths' as const, eyebrow: 'What comes naturally', title: 'Which strengths describe you?', description: 'Choose every strength you currently recognize in yourself.', options: profile.options.strengths, icon: BadgeCheck },
    { key: 'growthAreas' as const, eyebrow: 'Where you want to improve', title: 'What would you like to develop?', description: 'Choose areas where more practice or support would be useful.', options: profile.options.growthAreas, icon: TrendingUp },
    { key: 'learningPreferences' as const, eyebrow: 'Your learning rhythm', title: 'How do you prefer to learn?', description: 'Choose the formats that help you engage with new material.', options: profile.options.learningPreferences, icon: GraduationCap },
  ]
  const current = sections[step]
  const toggle = (value: string) => setFields((previous) => ({ ...previous, [current.key]: previous[current.key].includes(value) ? previous[current.key].filter((item) => item !== value) : [...previous[current.key], value] }))
  const save = async () => { setSaving(true); setError(null); try { onSaved(await updateStudentProfile(fields)) } catch (reason) { const messages = reason instanceof StudentProfileApiError ? Object.values(reason.fieldErrors).flat() : []; setError(messages.length ? messages.join(' ') : reason instanceof Error ? reason.message : 'Your profile could not be saved.') } finally { setSaving(false) } }
  const Icon = current.icon

  return <section className="overflow-hidden rounded-2xl bg-card shadow-sm" aria-labelledby="profile-builder-title">
    <div className="grid bg-primary-fixed/55 lg:grid-cols-[18rem_minmax(0,1fr)]">
      <div className="p-6 sm:p-8"><p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">Profile builder</p><h2 id="profile-builder-title" className="mt-2 font-display text-2xl font-bold text-on-primary-fixed">Three short reflections</h2><p className="mt-3 text-sm leading-6 text-on-primary-fixed-variant">There are no right answers. These selections are your own and can be changed later.</p><ol className="mt-8 space-y-2">{sections.map((section, index) => <li key={section.key}><button type="button" onClick={() => setStep(index)} className={cn('flex min-h-12 w-full items-center gap-3 rounded-lg px-3 text-left text-sm transition-all', index === step ? 'bg-primary text-primary-foreground shadow-sm' : 'text-on-primary-fixed hover:bg-white/55')} aria-current={index === step ? 'step' : undefined}><span className="font-label text-xs font-bold">0{index + 1}</span><span>{section.eyebrow}</span>{fields[section.key].length ? <Check className="ml-auto size-4" aria-hidden="true" /> : null}</button></li>)}</ol></div>
      <div className="min-w-0 bg-card p-6 sm:p-8 lg:p-10"><div key={current.key} className="profile-step-enter"><span className="flex size-12 items-center justify-center rounded-2xl bg-primary-fixed text-on-primary-fixed"><Icon className="size-6" aria-hidden="true" /></span><p className="mt-6 text-xs font-semibold uppercase tracking-[0.15em] text-primary">Step {step + 1} of 3</p><h3 className="mt-2 max-w-2xl font-display text-3xl font-bold">{current.title}</h3><p className="mt-3 text-sm text-muted-foreground">{current.description}</p><div className="mt-8 grid gap-3 sm:grid-cols-2">{current.options.map((option) => { const selected = fields[current.key].includes(option); return <label key={option} className={cn('group flex min-h-16 cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium transition-all duration-200 focus-within:ring-3 focus-within:ring-ring/30 motion-safe:hover:-translate-y-0.5', selected ? 'border-primary bg-primary text-primary-foreground shadow-sm' : 'border-border bg-background hover:border-primary/45 hover:bg-primary-fixed/30')}><input type="checkbox" className="sr-only" checked={selected} onChange={() => toggle(option)} /><span className={cn('flex size-6 shrink-0 items-center justify-center rounded-full border transition', selected ? 'border-white/40 bg-white/15' : 'border-outline bg-card')}><Check className={cn('size-4', !selected && 'invisible')} aria-hidden="true" /></span>{option}</label> })}</div></div>
        {error ? <p role="alert" className="mt-6 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p> : null}
        <div className="mt-10 flex flex-wrap items-center justify-between gap-3"><Button type="button" variant="ghost" onClick={step === 0 ? onCancel : () => setStep((value) => value - 1)}><ArrowLeft aria-hidden="true" />{step === 0 ? 'Cancel' : 'Previous'}</Button>{step < sections.length - 1 ? <Button type="button" onClick={() => setStep((value) => value + 1)}>Next reflection<ArrowRight aria-hidden="true" /></Button> : <Button type="button" disabled={saving} onClick={() => void save()}>{saving ? 'Saving…' : 'Save my profile'}<Check aria-hidden="true" /></Button>}</div>
      </div>
    </div>
  </section>
}

function ProfileLane({ number, icon: Icon, title, values, empty, tone }: { number: string; icon: ComponentType<{ className?: string; 'aria-hidden'?: boolean }>; title: string; values: string[]; empty: string; tone: 'blue' | 'orange' | 'green' }) { const tones = { blue: 'bg-primary-fixed text-on-primary-fixed', orange: 'bg-orange-100 text-orange-900 dark:bg-orange-950 dark:text-orange-100', green: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-100' }; return <div className="grid gap-4 p-6 sm:grid-cols-[3rem_minmax(0,1fr)] sm:p-8"><span className="pt-1 font-label text-xs font-bold tracking-[0.14em] text-muted-foreground">{number}</span><div><div className="flex items-center gap-3"><span className={cn('flex size-10 items-center justify-center rounded-xl', tones[tone])}><Icon className="size-5" aria-hidden={true} /></span><h3 className="font-display text-xl font-bold">{title}</h3></div>{values.length ? <div className="mt-4 flex flex-wrap gap-2">{values.map((value) => <span key={value} className="rounded-full bg-secondary px-3 py-1.5 text-sm font-medium">{value}</span>)}</div> : <p className="mt-4 text-sm italic text-muted-foreground">{empty}</p>}</div></div> }
function IdentityStamp({ label, value }: { label: string; value: string }) { return <div className="min-w-28 rounded-xl bg-white/10 px-4 py-3 backdrop-blur-sm"><span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-white/55">{label}</span><strong className="mt-1 block text-sm text-white">{value}</strong></div> }
function ProfileLoading() { return <div className="mx-auto max-w-6xl space-y-6 px-4 py-8"><Skeleton className="h-12 w-64" /><Skeleton className="h-60 rounded-2xl" /><div className="grid gap-6 lg:grid-cols-2"><Skeleton className="h-[30rem] rounded-2xl" /><Skeleton className="h-[30rem] rounded-2xl" /></div></div> }
function ProfileError({ message, onRetry }: { message: string; onRetry: () => void }) { return <div className="mx-auto max-w-xl px-4 py-20 text-center"><CircleUserRound className="mx-auto size-10 text-muted-foreground" aria-hidden="true" /><h1 className="mt-4 font-display text-2xl font-bold">Student profile unavailable</h1><p className="mt-2 text-sm text-muted-foreground">{message}</p><Button type="button" className="mt-5" onClick={onRetry}>Try again</Button></div> }

export { StudentProfilePage }
