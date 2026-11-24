interface RecommendationProfileDimension {
  code: string;
  label: string;
}

interface RecommendationProfileSummary {
  topCode: string;
  dimensions: RecommendationProfileDimension[];
  profileVariants?: Array<{ codes: string[] }>;
}

function getLeadingDimensions(profile: RecommendationProfileSummary) {
  const codes = profile.profileVariants?.length
    ? Array.from(new Set(profile.profileVariants.flatMap((variant) => variant.codes)))
    : profile.topCode.split("-");

  return codes
    .map((code) =>
      profile.dimensions.find((dimension) => dimension.code === code),
    )
    .filter((dimension) => dimension !== undefined);
}

function getTopCareerPaths(
  courses: Array<{ careerDirections?: string[] }>,
  limit = 4,
) {
  return Array.from(
    new Set(courses.flatMap((course) => course.careerDirections ?? [])),
  ).slice(0, limit);
}

export { getLeadingDimensions, getTopCareerPaths };
