import { Activity, ArrowLeft, ArrowRight, BadgeCheck, BrainCircuit, BriefcaseBusiness, Camera, Check, ChevronRight, CircleUserRound, GraduationCap, Pencil, Target, TrendingUp } from 'lucide-react'
import { useContext, useEffect, useRef, useState, type ComponentType } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { StudentPageHeader } from '@/features/student/components/student-page-header'
import { AuthContext } from '@/features/auth/auth-context'
import { getStudentProfile, StudentProfileApiError, updateStudentProfile, uploadStudentProfilePhoto } from '@/features/student/profile/student-profile-api'
import type { StudentProfileData, StudentProfileFields } from '@/features/student/profile/student-profile-types'
import { cn } from '@/lib/utils'
import profileCareerJourney from '@/assets/profile-career-journey-v1.webp'
import profileLearningGrowth from '@/assets/profile-learning-growth-v1.webp'

interface StudentProfilePageProps { onBack: () => void }

function StudentProfilePage({ onBack }: StudentProfilePageProps) {
  const auth = useContext(AuthContext)
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
    try { setProfile(await uploadStudentProfilePhoto(file)); await auth?.refreshUser(); toast.success('Profile photo updated.') }
    catch (reason) { toast.error(reason instanceof Error ? reason.message : 'The profile photo could not be uploaded.') }
    finally { setUploading(false); if (photoInput.current) photoInput.current.value = '' }
  }

  return <div className="student-grid-page student-dashboard-canvas student-page-enter min-h-[calc(100svh-5rem)] py-6 sm:py-8">
    <div className="student-page space-y-5">
      <StudentPageHeader title={editing ? 'Build your profile' : 'Student profile'} description="Your recorded interests and self-reported learning profile." onBack={editing ? () => setEditing(false) : onBack} actions={!editing ? <Button type="button" variant="secondary" onClick={() => setEditing(true)} className="min-h-11 rounded-lg bg-card shadow-sm"><Pencil aria-hidden="true" />Edit profile</Button> : undefined} />

      <header className="profile-identity-hero relative overflow-hidden rounded-lg bg-[linear-gradient(125deg,var(--brand-dark),var(--primary)_65%,#43318d)] text-primary-foreground shadow-sm">
        <div className="absolute -right-10 -top-40 size-96 rounded-full border-[5rem] border-white/5" aria-hidden="true" />
        <div className="absolute bottom-0 right-[18%] h-32 w-80 -skew-x-[35deg] bg-secondary-container/10" aria-hidden="true" />
        <div className="relative grid gap-7 px-5 py-7 sm:px-8 sm:py-8 lg:grid-cols-[auto_minmax(0,1fr)_15rem] lg:items-center">
          <div className="relative w-fit">
            <div className="profile-photo-ring flex size-28 items-center justify-center overflow-hidden rounded-[2rem] bg-primary-fixed text-3xl font-bold text-on-primary-fixed shadow-sm sm:size-32">
              {profile.student.photoUrl ? <img src={profile.student.photoUrl} alt={`${profile.student.name} profile`} className="size-full object-cover" /> : <span aria-label={`${profile.student.name} initials`}>{initials}</span>}
            </div>
            <input ref={photoInput} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" aria-label="Choose profile photo" onChange={(event) => void uploadPhoto(event.target.files?.[0])} />
            <button type="button" disabled={uploading} onClick={() => photoInput.current?.click()} className="absolute -bottom-2 -right-2 flex size-11 items-center justify-center rounded-full bg-secondary-container text-on-secondary-container shadow-lg transition motion-safe:hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-white/50" aria-label="Upload profile photo"><Camera className="size-5" aria-hidden="true" /></button>
          </div>
          <div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/65">My learning identity</p><h1 className="mt-2 font-display text-3xl font-bold sm:text-5xl">{profile.student.name}</h1><p className="mt-2 text-sm text-white/70">{profile.student.email}</p><p className="mt-5 max-w-2xl text-sm leading-6 text-white/80">{profile.about}</p></div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1"><IdentityStamp icon={BrainCircuit} label="Interest code" value={profile.riasec?.code ?? 'Pending'} /><IdentityStamp icon={Activity} label="Profile status" value={profile.questionnaire.complete ? 'Complete' : 'In progress'} /></div>
        </div>
      </header>

      {editing ? <ProfileBuilder profile={profile} onCancel={() => setEditing(false)} onSaved={(updated) => { setProfile(updated); setEditing(false); toast.success('Student profile saved.') }} /> : <ProfilePortrait profile={profile} onEdit={() => setEditing(true)} />}
      <p className="px-1 text-xs leading-5 text-muted-foreground">Strengths, growth areas, and learning preferences are student-selected self-report information. They are not a diagnosis or a validated measure of ability or personality.</p>
    </div>
  </div>
}

function ProfilePortrait({ profile, onEdit }: { profile: StudentProfileData; onEdit: () => void }) {
  return <div className="grid gap-5 lg:grid-cols-[minmax(0,1.04fr)_minmax(24rem,.96fr)] lg:items-stretch">
    <section className="relative row-span-2 overflow-hidden rounded-lg bg-card shadow-sm" aria-labelledby="profile-story-heading">
      <div className="relative min-h-44 p-6 pr-28 sm:p-7 sm:pr-48">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">The student behind the scores</p>
        <h2 id="profile-story-heading" className="mt-2 font-display text-2xl font-bold sm:text-3xl">How I learn and grow</h2>
        <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">A student-selected snapshot designed to support course conversations—not define ability or personality.</p>
        <img src={profileLearningGrowth} alt="" aria-hidden="true" className="pointer-events-none absolute -right-1 top-2 h-40 w-32 object-contain sm:right-5 sm:h-44 sm:w-40" />
      </div>
      <div className="border-t border-border/70">
        <ProfileLane number="01" icon={BadgeCheck} title="Strengths I recognize" values={profile.questionnaire.strengths} empty="No strengths selected yet." tone="blue" />
        <ProfileLane number="02" icon={TrendingUp} title="What I want to develop" values={profile.questionnaire.growthAreas} empty="No growth areas selected yet." tone="orange" />
        <ProfileLane number="03" icon={Target} title="How I learn best" values={profile.questionnaire.learningPreferences} empty="No learning preferences selected yet." tone="green" />
      </div>
      <div className="border-t border-border/70 px-6 py-4 sm:px-7"><Button type="button" variant="ghost" onClick={onEdit} className="px-0 text-primary hover:bg-transparent">{profile.questionnaire.complete ? 'Update your learning snapshot' : 'Complete your learning snapshot'}<ArrowRight aria-hidden="true" /></Button></div>
    </section>

    <section className="relative min-h-[23rem] overflow-hidden rounded-lg bg-[linear-gradient(115deg,var(--primary-fixed),#f8f7ff_62%,#ebe8ff)] p-6 text-on-primary-fixed shadow-sm sm:min-h-52 sm:p-7" aria-labelledby="interest-compass-heading">
      <div aria-hidden="true" className="absolute -right-20 -top-28 size-72 rounded-full border-[2.5rem] border-white/45" />
      <div className="relative z-10 sm:max-w-[62%]"><p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">Recorded interest compass</p><h2 id="interest-compass-heading" className="mt-3 font-display text-2xl font-bold text-primary sm:text-3xl">{profile.riasec ? `${profile.riasec.primary?.label} × ${profile.riasec.secondary?.label}` : 'Assessment not completed'}</h2><p className="mt-3 text-sm leading-6 text-on-primary-fixed-variant">{profile.riasec ? 'Your two strongest recorded RIASEC areas from the latest completed assessment.' : 'Complete your RIASEC assessment to add your recorded interests here.'}</p></div>
      <InterestCompass primaryCode={profile.riasec?.primary?.code} secondaryCode={profile.riasec?.secondary?.code} label={profile.riasec?.code ?? 'Pending'} />
    </section>

    <section className="relative min-h-72 overflow-hidden rounded-lg bg-card p-6 shadow-sm sm:p-7" aria-labelledby="career-directions-heading">
      <img src={profileCareerJourney} alt="" aria-hidden="true" className="pointer-events-none absolute bottom-0 right-0 w-[58%] max-w-md opacity-80" />
      <div className="relative z-10 max-w-[82%]"><div className="flex items-center gap-3"><span className="flex size-9 items-center justify-center rounded bg-primary text-primary-foreground"><BriefcaseBusiness className="size-4" aria-hidden="true" /></span><h3 id="career-directions-heading" className="text-xs font-bold uppercase tracking-[0.13em] text-primary">Career directions to explore</h3></div>{profile.careerInterests.length ? <ol className="mt-5 divide-y divide-border/70">{profile.careerInterests.slice(0, 5).map((career, index) => <li key={career} className="grid min-h-10 grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-2 text-sm"><span className="font-label text-xs font-bold text-primary">{String(index + 1).padStart(2, '0')}</span><span>{career}</span><ChevronRight className="size-4 text-muted-foreground" aria-hidden="true" /></li>)}</ol> : <p className="mt-5 max-w-sm text-sm leading-6 text-muted-foreground">Career directions will appear only when they are available from recorded programme matches.</p>}</div>
    </section>
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

function ProfileLane({ number, icon: Icon, title, values, empty, tone }: { number: string; icon: ComponentType<{ className?: string; 'aria-hidden'?: boolean }>; title: string; values: string[]; empty: string; tone: 'blue' | 'orange' | 'green' }) { const tones = { blue: 'bg-primary-fixed text-primary', orange: 'bg-orange-50 text-orange-600 dark:bg-orange-950 dark:text-orange-200', green: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-200' }; return <div className="grid gap-3 border-b border-border/70 px-6 py-5 last:border-b-0 sm:grid-cols-[2.5rem_3.25rem_minmax(0,1fr)_auto] sm:items-center sm:px-7"><span className={cn('flex size-9 items-center justify-center rounded text-xs font-bold', tones[tone])}>{number}</span><span className={cn('flex size-11 items-center justify-center rounded-lg', tones[tone])}><Icon className="size-5" aria-hidden={true} /></span><div><h3 className="font-display text-base font-bold sm:text-lg">{title}</h3>{values.length ? <p className="mt-1 text-sm text-muted-foreground">{values.join(', ')}</p> : <p className="mt-1 text-sm italic text-muted-foreground">{empty}</p>}</div><ChevronRight className="hidden size-5 text-muted-foreground sm:block" aria-hidden="true" /></div> }
function IdentityStamp({ icon: Icon, label, value }: { icon: ComponentType<{ className?: string; 'aria-hidden'?: boolean }>; label: string; value: string }) { return <div className="grid min-w-32 grid-cols-[2.5rem_minmax(0,1fr)] items-center gap-3 rounded-lg bg-white/12 px-3 py-3 backdrop-blur-sm"><span className="flex size-10 items-center justify-center rounded bg-white/12"><Icon className="size-5" aria-hidden={true} /></span><span><span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-white/55">{label}</span><strong className="mt-1 block text-sm text-white">{value}</strong></span></div> }
function InterestCompass({ primaryCode, secondaryCode, label }: { primaryCode?: string; secondaryCode?: string; label: string }) {
  const rotations: Record<string, number> = { I: 0, A: 60, S: 120, E: 180, C: 240, R: 300 }
  const areas = [
    { code: 'I', position: 'left-1/2 top-2 -translate-x-1/2' },
    { code: 'A', position: 'right-[15%] top-[22%]' },
    { code: 'S', position: 'bottom-[22%] right-[15%]' },
    { code: 'E', position: 'bottom-2 left-1/2 -translate-x-1/2' },
    { code: 'C', position: 'bottom-[22%] left-[15%]' },
    { code: 'R', position: 'left-[15%] top-[22%]' },
  ]
  const rotation = primaryCode ? rotations[primaryCode] : undefined

  return <div role="img" aria-label={`Recorded RIASEC interest compass ${label}`} className="absolute bottom-4 right-1/2 size-40 translate-x-1/2 rounded-full bg-white/70 shadow-[0_12px_30px_rgba(91,76,220,0.2)] sm:bottom-5 sm:right-7 sm:size-44 sm:translate-x-0">
    <div aria-hidden="true" className="absolute inset-2 rounded-full border-[0.65rem] border-primary/12" />
    <div aria-hidden="true" className="absolute inset-7 rounded-full border border-primary/18" />
    <div aria-hidden="true" className="absolute inset-12 rounded-full border border-primary/12" />
    {areas.map((area) => <span key={area.code} data-code={area.code} data-primary={area.code === primaryCode ? 'true' : undefined} className={cn('absolute z-20 flex size-5 items-center justify-center rounded text-[10px] font-bold text-primary/65', area.position, area.code === primaryCode && 'bg-primary text-primary-foreground', area.code === secondaryCode && area.code !== primaryCode && 'bg-primary/10 text-primary')}>{area.code}</span>)}
    {rotation !== undefined ? <div aria-hidden="true" className="absolute left-1/2 top-1/2 z-10 h-[35%] w-1.5 origin-bottom rounded-t-full bg-primary shadow-sm" style={{ transform: `translate(-50%, -100%) rotate(${rotation}deg)` }}><span className="absolute -left-[5px] -top-1 size-3 rotate-45 bg-primary" /></div> : null}
    <span aria-hidden="true" className="absolute left-1/2 top-1/2 z-20 size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-[5px] border-primary bg-white" />
  </div>
}
function ProfileLoading() { return <div className="mx-auto max-w-6xl space-y-6 px-4 py-8"><Skeleton className="h-12 w-64" /><Skeleton className="h-60 rounded-2xl" /><div className="grid gap-6 lg:grid-cols-2"><Skeleton className="h-[30rem] rounded-2xl" /><Skeleton className="h-[30rem] rounded-2xl" /></div></div> }
function ProfileError({ message, onRetry }: { message: string; onRetry: () => void }) { return <div className="mx-auto max-w-xl px-4 py-20 text-center"><CircleUserRound className="mx-auto size-10 text-muted-foreground" aria-hidden="true" /><h1 className="mt-4 font-display text-2xl font-bold">Student profile unavailable</h1><p className="mt-2 text-sm text-muted-foreground">{message}</p><Button type="button" className="mt-5" onClick={onRetry}>Try again</Button></div> }

export { StudentProfilePage }
