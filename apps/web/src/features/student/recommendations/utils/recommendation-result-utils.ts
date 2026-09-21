interface RecommendationProfileDimension {
  code: string;
  label: string;
}

interface RecommendationProfileSummary {
  topCode: string;
  dimensions: RecommendationProfileDimension[];
}

function getLeadingDimensions(profile: RecommendationProfileSummary) {
  return profile.topCode
    .split("-")
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
