import {
  BadgeCheck,
  Camera,
  Check,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Loader2,
  Sparkles,
  UserRound,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'

import { ErrorState, LoadingState } from '@/components/shared'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LocationFields } from '@/features/locations/components/location-fields'
import { StudentPageHeader } from '@/features/student/components/student-page-header'
import {
  getStudentProfile,
  saveStudentProfile,
  StudentProfileApiError,
  uploadStudentProfilePhoto,
} from '@/features/student/profile/student-profile-api'
import type { StudentProfileData, StudentProfilePayload } from '@/features/student/profile/student-profile-types'
import { cn } from '@/lib/utils'

const emptyForm: StudentProfilePayload = {
  location: null,
  lrn: '',
  birthDate: '',
  phone: '',
  addressLine: '',
  barangay: '',
  municipality: '',
  province: '',
  shsSchoolName: '',
  shsStrand: '',
  shsGraduationYear: null,
  strengths: [],
  growthAreas: [],
  learningPreferences: [],
}

function toForm(profile: StudentProfileData): StudentProfilePayload {
  const details = profile.personalAcademic
  return {
    location: details.location ?? null,
    lrn: details.lrn ?? '',
    birthDate: details.birthDate ?? '',
    phone: details.phone ?? '',
    addressLine: details.addressLine ?? '',
    barangay: details.barangay ?? '',
    municipality: details.municipality ?? '',
    province: details.province ?? '',
    shsSchoolName: details.shsSchoolName ?? '',
    shsStrand: details.shsStrand ?? '',
    shsGraduationYear: details.shsGraduationYear,
    strengths: profile.questionnaire.strengths,
    growthAreas: profile.questionnaire.growthAreas,
    learningPreferences: profile.questionnaire.learningPreferences,
  }
}

function StudentProfilePage({ onBack }: { onBack: () => void }) {
  const [profile, setProfile] = useState<StudentProfileData | null>(null)
  const [form, setForm] = useState<StudentProfilePayload>(emptyForm)
  const [activeTab, setActiveTab] = useState<'personal-academic' | 'learning'>('personal-academic')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const photoInput = useRef<HTMLInputElement>(null)

  const load = () => {
    setLoading(true)
    setError(null)
    void getStudentProfile()
      .then((data) => {
        setProfile(data)
        setForm(toForm(data))
      })
      .catch((reason) =>
        setError(reason instanceof Error ? reason.message : 'Your profile could not be loaded.'),
      )
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    void getStudentProfile()
      .then((data) => {
        setProfile(data)
        setForm(toForm(data))
      })
      .catch((reason) =>
        setError(reason instanceof Error ? reason.message : 'Your profile could not be loaded.'),
      )
      .finally(() => setLoading(false))
  }, [])

  const personalAcademicComplete = useMemo(() => {
    return Boolean(
      form.birthDate &&
        form.phone &&
        form.location?.barangayId &&
        form.shsSchoolName &&
        form.shsStrand &&
        form.shsGraduationYear,
    )
  }, [form])

  const learningComplete = useMemo(() => {
    return (
      form.strengths.length > 0 &&
      form.growthAreas.length > 0 &&
      form.learningPreferences.length > 0
    )
  }, [form])

  const setField = <Key extends keyof StudentProfilePayload>(
    key: Key,
    value: StudentProfilePayload[Key],
  ) => {
    setForm((current) => ({ ...current, [key]: value }))
    setError(null)
    setSuccess(null)
  }

  const toggle = (
    key: 'strengths' | 'growthAreas' | 'learningPreferences',
    value: string,
  ) => {
    setField(
      key,
      form[key].includes(value)
        ? form[key].filter((item) => item !== value)
        : [...form[key], value],
    )
  }

  const save = async () => {
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      const data = await saveStudentProfile({
        ...form,
        location: form.location
          ? {
              ...form.location,
              provinceId:
                form.location.provinceId === -1 ? null : form.location.provinceId,
            }
          : undefined,
        lrn: form.lrn || null,
        birthDate: form.birthDate || null,
        phone: form.phone || null,
        addressLine: form.addressLine || null,
        shsSchoolName: form.shsSchoolName || null,
        shsStrand: form.shsStrand || null,
      })
      setProfile(data)
      setForm(toForm(data))
      setSuccess('Your profile has been saved.')
    } catch (reason) {
      const firstValidationError =
        reason instanceof StudentProfileApiError
          ? Object.values(reason.errors).flat()[0]
          : null
      setError(
        firstValidationError ??
          (reason instanceof Error ? reason.message : 'Your profile could not be saved.'),
      )
    } finally {
      setSaving(false)
    }
  }

  const uploadPhoto = async (file: File | undefined) => {
    if (!file) return
    setUploading(true)
    setError(null)
    try {
      const data = await uploadStudentProfilePhoto(file)
      setProfile(data)
      setSuccess('Your profile photo has been updated.')
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : 'Your profile photo could not be uploaded.',
      )
    } finally {
      setUploading(false)
      if (photoInput.current) photoInput.current.value = ''
    }
  }

  if (loading) {
    return (
      <div className="student-page py-8">
        <LoadingState
          title="Loading your profile"
          description="Restoring your personal, academic, and learning records."
        />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="student-page py-8">
        <ErrorState
          title="Your profile could not be loaded"
          description={error ?? 'Try loading your profile again.'}
          onRetry={load}
        />
      </div>
    )
  }

  const initials = profile.student.name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()

  return (
    <div className="student-grid-page min-h-[calc(100vh-5rem)] py-4 sm:py-6">
      <div className="student-page max-w-5xl space-y-6">
        <StudentPageHeader
          title="My Profile"
          description="Manage your personal identification, senior high academic history, and learning preferences."
          onBack={onBack}
        />

        {/* 1. Profile Hero & Identity Card */}
        <section
          aria-labelledby="profile-editor-title"
          className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-[var(--shadow-card)]"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="relative group shrink-0">
                <span className="flex size-20 sm:size-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-primary/25 bg-primary/5 font-display text-2xl sm:text-3xl font-black text-primary shadow-2xs">
                  {profile.student.photoUrl ? (
                    <img
                      src={profile.student.photoUrl}
                      alt={`${profile.student.name} profile`}
                      className="size-full object-cover"
                    />
                  ) : (
                    initials
                  )}
                </span>
                <button
                  type="button"
                  onClick={() => photoInput.current?.click()}
                  disabled={uploading}
                  className="absolute -bottom-1.5 -right-1.5 flex size-8 sm:size-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md hover:bg-primary/90 transition-transform active:scale-95 cursor-pointer disabled:opacity-50"
                  title="Change profile photo"
                  aria-label="Choose profile photo"
                >
                  {uploading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Camera className="size-4" />
                  )}
                </button>
                <input
                  ref={photoInput}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  aria-label="Choose profile photo"
                  onChange={(event) => void uploadPhoto(event.target.files?.[0])}
                />
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1
                    id="profile-editor-title"
                    className="font-display text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight"
                  >
                    {profile.student.name}
                  </h1>
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-bold text-primary">
                    <BadgeCheck className="size-3.5" /> Student Applicant
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground break-all">
                  {profile.student.email}
                </p>
                <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs">
                  {form.lrn ? (
                    <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 font-mono text-[11px] font-semibold text-foreground border border-border/60">
                      LRN: {form.lrn}
                    </span>
                  ) : null}
                  {profile.riasec?.code ? (
                    <span className="inline-flex items-center rounded-md bg-accent px-2 py-0.5 text-xs font-bold text-accent-foreground">
                      Holland Profile: {profile.riasec.code}
                    </span>
                  ) : null}
                  <span className="inline-flex items-center rounded-md bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
                    Tagoloan Community College
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Button
                type="button"
                className="w-full sm:w-auto font-bold gap-2 shadow-xs cursor-pointer"
                disabled={saving || !personalAcademicComplete || !learningComplete}
                onClick={save}
              >
                {saving ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Check className="size-4" /> Save changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </section>

        {/* Global Feedback Banners */}
        {error ? (
          <Alert variant="destructive" className="rounded-2xl">
            <AlertTitle>Profile could not be saved</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}
        {success ? (
          <Alert className="rounded-2xl border-success/30 bg-success/10 text-success-ink">
            <Check aria-hidden="true" className="size-4 text-success" />
            <AlertTitle className="text-foreground font-bold">Profile updated</AlertTitle>
            <AlertDescription className="text-muted-foreground">{success}</AlertDescription>
          </Alert>
        ) : null}

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-border">
          <button
            type="button"
            onClick={() => setActiveTab('personal-academic')}
            className={cn(
              'flex items-center gap-2 py-3 px-4 font-display text-sm font-bold border-b-2 transition-colors cursor-pointer',
              activeTab === 'personal-academic'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            <UserRound className="size-4" />
            Personal & Academic Information
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('learning')}
            className={cn(
              'flex items-center gap-2 py-3 px-4 font-display text-sm font-bold border-b-2 transition-colors cursor-pointer',
              activeTab === 'learning'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            <Sparkles className="size-4" />
            Learning Profile & Strengths
          </button>
        </div>

        {/* Form Container */}
        <form
          onSubmit={(event) => {
            event.preventDefault()
            if (activeTab === 'personal-academic') {
              setActiveTab('learning')
            } else {
              void save()
            }
          }}
          className="space-y-6"
        >
          {activeTab === 'personal-academic' ? (
            <div className="space-y-6">
              {/* Card 1: Personal & Contact Information */}
              <section className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-[var(--shadow-card)]">
                <div className="flex items-start gap-3.5 border-b border-border pb-5">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <UserRound className="size-5" />
                  </span>
                  <div>
                    <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground">
                      Personal information
                    </h2>
                    <p className="mt-0.5 text-xs sm:text-sm text-muted-foreground">
                      Official identification numbers, date of birth, and home address.
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  <Field label="Learner reference number" id="lrn">
                    <Input
                      id="lrn"
                      autoComplete="off"
                      maxLength={30}
                      value={form.lrn ?? ''}
                      onChange={(event) => setField('lrn', event.target.value)}
                    />
                  </Field>
                  <Field label="Date of birth" id="birth-date" required>
                    <Input
                      id="birth-date"
                      type="date"
                      required
                      value={form.birthDate ?? ''}
                      onChange={(event) => setField('birthDate', event.target.value)}
                    />
                  </Field>
                  <Field label="Mobile number" id="phone" required>
                    <Input
                      id="phone"
                      type="tel"
                      autoComplete="tel"
                      required
                      maxLength={32}
                      value={form.phone ?? ''}
                      onChange={(event) => setField('phone', event.target.value)}
                    />
                  </Field>
                  <Field label="House, street, or zone" id="address-line">
                    <Input
                      id="address-line"
                      autoComplete="street-address"
                      maxLength={255}
                      value={form.addressLine ?? ''}
                      onChange={(event) => setField('addressLine', event.target.value)}
                    />
                  </Field>
                  {!form.location &&
                  (form.barangay || form.municipality || form.province) ? (
                    <p className="text-sm text-muted-foreground sm:col-span-2">
                      Previously recorded:{' '}
                      {[form.barangay, form.municipality, form.province]
                        .filter(Boolean)
                        .join(', ')}
                      . Select your location below to update it.
                    </p>
                  ) : null}
                  <LocationFields
                    value={form.location}
                    onChange={(location) => setField('location', location)}
                  />
                </div>
              </section>

              {/* Card 2: Academic Background (COMBINED into same view!) */}
              <section className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-[var(--shadow-card)]">
                <div className="flex items-start gap-3.5 border-b border-border pb-5">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <GraduationCap className="size-5" />
                  </span>
                  <div>
                    <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground">
                      Academic background
                    </h2>
                    <p className="mt-0.5 text-xs sm:text-sm text-muted-foreground">
                      Senior high school completed, track or academic strand, and graduation year.
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Field label="Senior high school" id="shs-school" required>
                      <Input
                        id="shs-school"
                        required
                        maxLength={255}
                        value={form.shsSchoolName ?? ''}
                        onChange={(event) => setField('shsSchoolName', event.target.value)}
                      />
                    </Field>
                  </div>
                  <Field label="SHS strand or track" id="shs-strand" required>
                    <Input
                      id="shs-strand"
                      required
                      maxLength={120}
                      placeholder="Example: STEM, TVL-ICT, or HUMSS"
                      value={form.shsStrand ?? ''}
                      onChange={(event) => setField('shsStrand', event.target.value)}
                    />
                  </Field>
                  <Field label="Graduation year" id="graduation-year" required>
                    <Input
                      id="graduation-year"
                      type="number"
                      min={2000}
                      max={new Date().getFullYear() + 1}
                      required
                      value={form.shsGraduationYear ?? ''}
                      onChange={(event) =>
                        setField(
                          'shsGraduationYear',
                          event.target.value ? Number(event.target.value) : null,
                        )
                      }
                    />
                  </Field>
                  <p className="sm:col-span-2 text-xs leading-5 text-muted-foreground rounded-xl bg-muted/40 p-3 border border-border/60">
                    Your academic background is recorded as Student-provided context and is not used to
                    alter your RIASEC questionnaire results or curriculum rankings.
                  </p>
                </div>
              </section>

              {/* Bottom Action for Combined Tab */}
              <div className="flex items-center justify-between pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="gap-2 cursor-pointer"
                  onClick={onBack}
                >
                  <ChevronLeft className="size-4" /> Back to dashboard
                </Button>
                <div className="flex items-center gap-3">
                  <Button
                    type="submit"
                    className="gap-2 cursor-pointer"
                  >
                    Next <ChevronRight className="size-4" />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            /* Tab 2: Learning Profile & Strengths */
            <div className="space-y-6">
              <section className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-[var(--shadow-card)]">
                <div className="flex items-start gap-3.5 border-b border-border pb-5">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Sparkles className="size-5" />
                  </span>
                  <div>
                    <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground">
                      Learning profile & preferences
                    </h2>
                    <p className="mt-0.5 text-xs sm:text-sm text-muted-foreground">
                      Select your self-reported strengths, focus areas, and preferred study modalities.
                    </p>
                  </div>
                </div>

                <div className="mt-6 space-y-8">
                  <ChoiceGroup
                    title="Self-reported strengths"
                    values={profile.options.strengths}
                    selected={form.strengths}
                    onToggle={(value) => toggle('strengths', value)}
                  />
                  <ChoiceGroup
                    title="Growth areas"
                    values={profile.options.growthAreas}
                    selected={form.growthAreas}
                    onToggle={(value) => toggle('growthAreas', value)}
                  />
                  <ChoiceGroup
                    title="Learning preferences"
                    values={profile.options.learningPreferences}
                    selected={form.learningPreferences}
                    onToggle={(value) => toggle('learningPreferences', value)}
                  />
                </div>
              </section>

              {/* Bottom Action for Learning Tab */}
              <div className="flex items-center justify-between pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="gap-2 cursor-pointer"
                  onClick={() => setActiveTab('personal-academic')}
                >
                  <ChevronLeft className="size-4" /> Back to personal & academic
                </Button>
                <Button
                  type="submit"
                  disabled={saving || !learningComplete}
                  className="gap-2 font-bold cursor-pointer"
                >
                  {saving ? (
                    <>
                      <Loader2 className="size-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Check className="size-4" /> Save profile
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}

function Field({
  label,
  id,
  required,
  children,
}: {
  label: string
  id: string
  required?: boolean
  children: ReactNode
}) {
  return (
    <div>
      <Label htmlFor={id} className="font-semibold text-xs sm:text-sm">
        {label}
        {required ? (
          <span className="text-destructive ml-0.5">*</span>
        ) : (
          <span className="font-normal text-muted-foreground ml-1">Optional</span>
        )}
      </Label>
      <div className="mt-2">{children}</div>
    </div>
  )
}

function ChoiceGroup({
  title,
  values,
  selected,
  onToggle,
}: {
  title: string
  values: string[]
  selected: string[]
  onToggle: (value: string) => void
}) {
  return (
    <fieldset className="space-y-2">
      <div className="flex items-center justify-between">
        <legend className="font-display text-base font-bold text-foreground">
          {title}
        </legend>
        <span className="text-xs text-muted-foreground">Select at least one</span>
      </div>
      <div className="flex flex-wrap gap-2 pt-1">
        {values.map((value) => {
          const active = selected.includes(value)
          return (
            <button
              key={value}
              type="button"
              aria-pressed={active}
              onClick={() => onToggle(value)}
              className={cn(
                'inline-flex min-h-10 items-center rounded-full border px-4 text-xs sm:text-sm font-semibold transition-all active:scale-95 cursor-pointer',
                active
                  ? 'border-primary bg-primary text-primary-foreground shadow-xs'
                  : 'border-border bg-card text-foreground hover:border-primary/50 hover:bg-muted/30',
              )}
            >
              {active ? <Check aria-hidden="true" className="mr-1.5 size-3.5" /> : null}
              {value}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}

export { StudentProfilePage }
