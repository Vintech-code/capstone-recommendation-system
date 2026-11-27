import {
  ArrowRight,
  BadgeCheck,
  Camera,
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
  UserRound,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'

import { ErrorState, LoadingState } from '@/components/shared'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { appToast } from '@/components/ui/app-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LocationFields } from '@/features/locations/components/location-fields'
import {
  getStudentProfile,
  saveStudentProfile,
  StudentProfileApiError,
  uploadStudentProfilePhoto,
} from '@/features/student/profile/student-profile-api'
import type { StudentProfileData, StudentProfilePayload } from '@/features/student/profile/student-profile-types'

const emptyForm: StudentProfilePayload = {
  firstName: '',
  lastName: '',
  location: null,
  idNumber: '',
  birthDate: '',
  phone: '',
  addressLine: '',
  barangay: '',
  municipality: '',
  province: '',
}

function toForm(profile: StudentProfileData): StudentProfilePayload {
  const details = profile.personalAcademic
  return {
    firstName: profile.student.firstName ?? '',
    lastName: profile.student.lastName ?? '',
    location: details.location ?? null,
    idNumber: details.idNumber ?? '',
    birthDate: details.birthDate ?? '',
    phone: details.phone ?? '',
    addressLine: details.addressLine ?? '',
    barangay: details.barangay ?? '',
    municipality: details.municipality ?? '',
    province: details.province ?? '',
  }
}

interface StudentProfilePageProps {
  onBack: () => void
  onIdentityUpdated?: () => void
}

function StudentProfilePage({ onBack, onIdentityUpdated }: StudentProfilePageProps) {
  const [profile, setProfile] = useState<StudentProfileData | null>(null)
  const [form, setForm] = useState<StudentProfilePayload>(emptyForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
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
      form.firstName.trim() &&
        form.lastName.trim() &&
        form.birthDate &&
        form.phone &&
        form.location?.barangayId,
    )
  }, [form])

  const setField = <Key extends keyof StudentProfilePayload>(
    key: Key,
    value: StudentProfilePayload[Key],
  ) => {
    setForm((current) => ({ ...current, [key]: value }))
    setError(null)
  }

  const save = async () => {
    setSaving(true)
    setError(null)
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
        idNumber: form.idNumber,
        birthDate: form.birthDate || null,
        phone: form.phone || null,
        addressLine: form.addressLine || null,
      })
      setProfile(data)
      setForm(toForm(data))
      onIdentityUpdated?.()
      appToast.success(
        'Profile updated',
        'Your name and profile details have been saved.',
      )
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
      appToast.success('Profile photo updated')
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
      <LoadingState
        variant="profile"
        title="Loading your profile"
        description="Restoring your personal and academic records."
      />
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

  const firstName = profile.student.firstName ?? ''
  const lastName = profile.student.lastName ?? ''
  const initials = [firstName, lastName]
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()

  return (
    <div className="student-grid-page student-dashboard-canvas min-h-[calc(100vh-5rem)] py-4 sm:py-3">
      <div className="student-page max-w-5xl space-y-5 sm:space-y-3">
        {/* Top Header Row with Breadcrumb & Save Button matching reference */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm sm:text-base">
            <button
              type="button"
              onClick={onBack}
              className="font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              My profile
            </button>
            <ChevronRight className="size-4 text-muted-foreground/60" />
            <span className="font-semibold text-foreground">Edit Profile</span>
          </div>

          <Button
            type="button"
            onClick={save}
            disabled={saving || !personalAcademicComplete}
            className="h-10 rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Saving...
              </>
            ) : (
              <>
                Save <ArrowRight className="size-4" />
              </>
            )}
          </Button>
        </div>

        {/* Feedback Banners */}
        {error ? (
          <Alert variant="destructive" className="rounded-xl">
            <AlertTitle>Profile could not be saved</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}
        {/* Main Form Container Card */}
        <section
          aria-labelledby="profile-editor-title"
          className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm sm:p-10"
        >
          {/* Card heading and cancel action */}
          <div className="flex items-center justify-between border-b border-border/80 pb-3 mb-8">
            <div className="flex items-center gap-2 py-2 px-3 text-xs font-semibold text-primary-ink sm:text-sm">
              <UserRound className="size-4" />
              Personal & Academic
            </div>

            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1 text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              Cancel <X className="size-3.5" />
            </button>
          </div>

          <form
            onSubmit={(event) => {
              event.preventDefault()
              void save()
            }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                {/* Left Column: Avatar & Personal Information */}
                <div
                  data-profile-column="identity"
                  className="lg:col-span-6 space-y-5"
                >
                  {/* Avatar & Name */}
                  <div className="flex flex-col items-center sm:items-start lg:items-center pb-2">
                    <div className="relative group shrink-0">
                      <div className="flex size-24 items-center justify-center overflow-hidden rounded-full border-2 border-border/80 bg-muted/40 font-display text-2xl font-bold text-foreground shadow-sm sm:size-28 sm:text-3xl">
                        {profile.student.photoUrl ? (
                          <img
                            src={profile.student.photoUrl}
                            alt={`${profile.student.name} profile`}
                            className="size-full object-cover"
                          />
                        ) : (
                          initials
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => photoInput.current?.click()}
                        disabled={uploading}
                        className="absolute bottom-0 right-0 flex size-8 items-center justify-center rounded-full border border-border/80 bg-card text-foreground shadow-sm transition-colors hover:bg-muted disabled:opacity-50"
                        title="Change profile photo"
                        aria-label="Choose profile photo"
                      >
                        {uploading ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                          <Camera className="size-3.5" />
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

                    <div className="mt-3 text-center sm:text-left lg:text-center">
                      <h1
                        id="profile-editor-title"
                        className="font-display text-lg sm:text-xl font-bold text-foreground tracking-tight"
                      >
                        {profile.student.name}
                      </h1>
                      <div className="mt-1 flex flex-wrap items-center justify-center sm:justify-start lg:justify-center gap-2 text-xs">
                        <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 font-semibold text-primary-ink">
                          <BadgeCheck className="size-3.5" /> Student Applicant
                        </span>
                        <span className="text-muted-foreground">Tagoloan Community College</span>
                      </div>
                    </div>
                  </div>

                  {/* First Name & Last Name */}
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <Label htmlFor="firstName" className="text-xs font-semibold text-foreground/80 mb-1.5 block">
                        First Name <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="firstName"
                        autoComplete="given-name"
                        required
                        maxLength={100}
                        value={form.firstName}
                        onChange={(event) => setField('firstName', event.target.value)}
                        className="h-10 sm:h-11 rounded-xs border-border/80 text-foreground font-medium text-xs sm:text-sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName" className="text-xs font-semibold text-foreground/80 mb-1.5 block">
                        Last Name <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="lastName"
                        autoComplete="family-name"
                        required
                        maxLength={100}
                        value={form.lastName}
                        onChange={(event) => setField('lastName', event.target.value)}
                        className="h-10 sm:h-11 rounded-xs border-border/80 text-foreground font-medium text-xs sm:text-sm"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <Label className="text-xs font-semibold text-foreground/80 mb-1.5 block">
                      Email
                    </Label>
                    <Input
                      value={profile.student.email}
                      readOnly
                      disabled
                      tabIndex={-1}
                      className="h-10 sm:h-11 rounded-xs bg-muted/30 border-border/80 text-foreground font-medium cursor-not-allowed text-xs sm:text-sm"
                    />
                  </div>

                  {/* Mobile number */}
                  <div>
                    <Label htmlFor="phone" className="text-xs font-semibold text-foreground/80 mb-1.5 block">
                      Mobile number <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      autoComplete="tel"
                      required
                      maxLength={32}
                      placeholder="e.g. 0912 345 6789"
                      value={form.phone ?? ''}
                      onChange={(event) => setField('phone', event.target.value)}
                      className="h-10 sm:h-11 rounded-xs border-border/80 text-xs sm:text-sm"
                    />
                  </div>

                  {/* Student ID number */}
                  <div>
                    <Label htmlFor="id-number" className="text-xs font-semibold text-foreground/80 mb-1.5 block">
                      ID number
                    </Label>
                    <Input
                      id="id-number"
                      type="text"
                      readOnly
                      autoComplete="off"
                      maxLength={10}
                      placeholder="Verified via COR submission"
                      value={form.idNumber}
                      className="h-10 sm:h-11 rounded-xs border-border/80 bg-muted/40 text-xs sm:text-sm font-mono text-muted-foreground"
                    />
                  </div>

                </div>

                {/* Right Column: Birth date, address, location, and RIASEC summary */}
                <div
                  data-profile-column="details"
                  className="lg:col-span-6 space-y-5"
                >
                  {/* Date of Birth */}
                  <div>
                    <Label htmlFor="birth-date" className="text-xs font-semibold text-foreground/80 mb-1.5 block">
                      Date of birth <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="birth-date"
                      type="date"
                      required
                      value={form.birthDate ?? ''}
                      onChange={(event) => setField('birthDate', event.target.value)}
                      className="h-10 sm:h-11 rounded-xs border-border/80 text-xs sm:text-sm"
                    />
                  </div>

                  {/* Address */}
                  <div>
                    <Label htmlFor="address-line" className="text-xs font-semibold text-foreground/80 mb-1.5 block">
                      House, street, or zone <span className="font-normal text-muted-foreground ml-1">Optional</span>
                    </Label>
                    <Input
                      id="address-line"
                      autoComplete="street-address"
                      maxLength={255}
                      placeholder="House / Street / Zone / Purok"
                      value={form.addressLine ?? ''}
                      onChange={(event) => setField('addressLine', event.target.value)}
                      className="h-10 sm:h-11 rounded-xs border-border/80 text-xs sm:text-sm"
                    />
                  </div>

                  {/* Location */}
                  <div className="pt-1">
                    {!form.location &&
                    (form.barangay || form.municipality || form.province) ? (
                      <p className="text-xs text-muted-foreground mb-2">
                        Previously recorded:{' '}
                        {[form.barangay, form.municipality, form.province]
                          .filter(Boolean)
                          .join(', ')}
                        . Select your location below to update.
                      </p>
                    ) : null}
                    <LocationFields
                      value={form.location}
                      onChange={(location) => setField('location', location)}
                    />
                  </div>

                  {/* Holland RIASEC Fit summary */}
                  <div className="rounded-xs border border-border/70 bg-muted/20 p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Holland RIASEC Profile
                      </span>
                      {profile.riasec?.code ? (
                        <span className="rounded-md bg-primary/10 px-2.5 py-0.5 font-mono text-xs font-bold text-primary-ink">
                          Code: {profile.riasec.code}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground font-medium">Not taken yet</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {profile.riasec?.code
                        ? 'Your personality dimension fit is active and computed based on your verified assessment responses.'
                        : 'Complete the RIASEC assessment to unlock personalized college degree path recommendations.'}
                    </p>
                  </div>

                  {/* Bottom profile actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-border/70">
                    <Button
                      type="button"
                      variant="outline"
                      className="h-10 rounded-xs gap-2 cursor-pointer text-xs sm:text-sm"
                      onClick={onBack}
                    >
                      <ChevronLeft className="size-4" /> Back to dashboard
                    </Button>

                    <Button
                      type="submit"
                      disabled={saving || !personalAcademicComplete}
                      className="h-10 rounded-xs bg-primary text-primary-foreground font-semibold px-5 gap-2 cursor-pointer text-xs sm:text-sm"
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
              </div>
          </form>
        </section>
      </div>
    </div>
  )
}

export { StudentProfilePage }
