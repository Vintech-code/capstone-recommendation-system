import { apiDataRequest } from "@/services/api-client";

export interface EnrollmentProgrammeOption {
  id: string;
  code: string;
  name: string;
  isEnrollmentOpen?: boolean;
  availabilityNote?: string | null;
}

export interface StudentEnrollmentRecord {
  enrolledProgrammeId: string;
  enrolledProgrammeCode: string;
  enrolledProgrammeName: string;
  studentIdNumber?: string | null;
  hasCorFile: boolean;
  corOriginalName: string | null;
  corFileUrl: string | null;
  declaredAt: string;
  verificationStatus?: "pending" | "verified" | "rejected";
  verificationNote?: string | null;
  verifiedAt?: string | null;
}

export interface StudentEnrollmentState {
  hasRecommendation?: boolean;
  enrollment: StudentEnrollmentRecord | null;
  programmes: EnrollmentProgrammeOption[];
}

export function getStudentEnrollment(): Promise<StudentEnrollmentState> {
  return apiDataRequest<StudentEnrollmentState>(
    "/api/v1/student/enrollment",
    {},
    { fallbackMessage: "Could not load your enrollment declaration." },
  );
}

export function saveStudentEnrollment(input: {
  enrolledProgrammeId: string;
  studentIdNumber: string;
  corFile: File | null;
}): Promise<{ enrollment: StudentEnrollmentRecord }> {
  const formData = new FormData();
  formData.append("enrolledProgrammeId", input.enrolledProgrammeId);
  formData.append("studentIdNumber", input.studentIdNumber);
  if (input.corFile) {
    formData.append("corFile", input.corFile);
  }

  return apiDataRequest<{ enrollment: StudentEnrollmentRecord }>(
    "/api/v1/student/enrollment",
    {
      method: "POST",
      body: formData,
    },
    { fallbackMessage: "Your enrollment declaration could not be saved." },
  );
}
