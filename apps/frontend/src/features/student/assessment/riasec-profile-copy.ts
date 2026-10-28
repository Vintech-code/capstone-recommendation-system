const riasecDimensionCodes = ["R", "I", "A", "S", "E", "C"] as const;

type RiasecDimensionCode = (typeof riasecDimensionCodes)[number];
type RiasecProfileCode = `${RiasecDimensionCode}${RiasecDimensionCode}${RiasecDimensionCode}`;

interface RiasecProfileCopy {
  code: RiasecProfileCode;
  name: string;
  description: readonly [string, string];
  version: "PSG-PROFILE-NAMES-2026-09-21-V2";
}

interface RiasecDimensionCopy {
  focus: string;
  action: string;
  role: string;
}

const profileVersion = "PSG-PROFILE-NAMES-2026-09-21-V2" as const;

const dimensionCopy: Record<RiasecDimensionCode, RiasecDimensionCopy> = {
  R: { focus: "practical, hands-on activity", action: "build or improve tangible things", role: "Builder" },
  I: { focus: "careful inquiry and problem-solving", action: "analyze questions and develop evidence-based solutions", role: "Investigator" },
  A: { focus: "imagination and self-expression", action: "create and communicate original ideas", role: "Creator" },
  S: { focus: "helping, teaching, and connecting with people", action: "support people and contribute to their growth", role: "Guide" },
  E: { focus: "initiative, influence, and goal-directed activity", action: "lead decisions and mobilize others toward goals", role: "Leader" },
  C: { focus: "order, accuracy, and dependable structure", action: "organize information and maintain reliable processes", role: "Organizer" },
};

const supportingStyle: Record<string, string> = {
  RI: "Technical", RA: "Inventive", RS: "Practical", RE: "Resourceful", RC: "Methodical",
  IR: "Analytical", IA: "Imaginative", IS: "Insightful", IE: "Evaluative", IC: "Systematic",
  AR: "Artistic", AI: "Curious", AS: "Expressive", AE: "Visionary", AC: "Artful",
  SR: "Supportive", SI: "Empathetic", SA: "Inspiring", SE: "Collaborative", SC: "Dependable",
  ER: "Energetic", EI: "Decisive", EA: "Persuasive", ES: "Motivating", EC: "Coordinated",
  CR: "Structured", CI: "Precise", CA: "Orderly", CS: "Helpful", CE: "Organized",
};

function profile(
  code: RiasecProfileCode,
  name: string,
  description: readonly [string, string],
): RiasecProfileCopy {
  return { code, name, description, version: profileVersion };
}

const psgProfileOverrides: Partial<Record<RiasecProfileCode, RiasecProfileCopy>> = {
  ECI: profile("ECI", "Strategic Organizer", [
    "You enjoy taking initiative, organizing details, and turning ideas into clear plans.",
    "You often thrive when leading decisions, working with information, and solving practical business problems.",
  ]),
  ESC: profile("ESC", "People Coordinator", [
    "You enjoy bringing people together and keeping shared activities organized.",
    "You often thrive in service-focused settings that involve leadership, communication, and dependable routines.",
  ]),
  IRS: profile("IRS", "Practical Investigator", [
    "You enjoy examining problems, gathering evidence, and finding solutions that work in the real world.",
    "You often thrive in hands-on situations where careful inquiry can protect, guide, or support others.",
  ]),
  IRC: profile("IRC", "Systems Solver", [
    "You enjoy understanding how systems work and fixing problems through logical, hands-on action.",
    "You often thrive with technology, structured processes, and tasks that reward accuracy and persistence.",
  ]),
  CIS: profile("CIS", "Information Steward", [
    "You enjoy organizing information, investigating details, and making knowledge easier for others to use.",
    "You often thrive in structured environments that value accuracy, research, and helpful service.",
  ]),
  SAC: profile("SAC", "Creative Guide", [
    "You enjoy helping others learn through imagination, expression, and thoughtfully organized activities.",
    "You often thrive when creativity and careful planning come together to support people's growth.",
  ]),
  SRE: profile("SRE", "Active Motivator", [
    "You enjoy encouraging people through movement, teamwork, and practical participation.",
    "You often thrive when coaching, leading activities, and inspiring others to take action.",
  ]),
  SAI: profile("SAI", "Insightful Mentor", [
    "You enjoy helping others learn through creative communication, reflection, and thoughtful inquiry.",
    "You often thrive when language, ideas, and personal guidance come together.",
  ]),
  SIE: profile("SIE", "Civic Strategist", [
    "You enjoy helping people understand social issues and work toward shared goals.",
    "You often thrive when research, discussion, and leadership can strengthen a community.",
  ]),
  ISA: profile("ISA", "Social Researcher", [
    "You enjoy investigating how people, groups, and communities interact and change.",
    "You often thrive when careful research and creative interpretation reveal meaningful human stories.",
  ]),
  SIR: profile("SIR", "Care Practitioner", [
    "You enjoy supporting others through attentive care, careful assessment, and practical action.",
    "You often thrive in hands-on situations that require compassion, sound judgment, and responsibility.",
  ]),
};

function createDerivedProfile(code: RiasecProfileCode): RiasecProfileCopy {
  const primary = code[0] as RiasecDimensionCode;
  const secondary = code[1] as RiasecDimensionCode;
  const tertiary = code[2] as RiasecDimensionCode;
  const supportingName = supportingStyle[`${secondary}${tertiary}`];

  return profile(code, `${supportingName} ${dimensionCopy[primary].role}`, [
    `You value ${dimensionCopy[primary].focus}, supported by interests in ${dimensionCopy[secondary].focus} and ${dimensionCopy[tertiary].focus}.`,
    `You often thrive in settings where you can ${dimensionCopy[primary].action}, ${dimensionCopy[secondary].action}, and ${dimensionCopy[tertiary].action}.`,
  ]);
}

function buildProfileCopy(): Record<RiasecProfileCode, RiasecProfileCopy> {
  const profiles: Partial<Record<RiasecProfileCode, RiasecProfileCopy>> = {};

  for (const primary of riasecDimensionCodes) {
    for (const secondary of riasecDimensionCodes) {
      for (const tertiary of riasecDimensionCodes) {
        if (new Set([primary, secondary, tertiary]).size !== 3) continue;

        const code = `${primary}${secondary}${tertiary}` as RiasecProfileCode;
        profiles[code] = psgProfileOverrides[code] ?? createDerivedProfile(code);
      }
    }
  }

  return profiles as Record<RiasecProfileCode, RiasecProfileCopy>;
}

const riasecProfileCopy = buildProfileCopy();

function getRiasecProfileCopy(code: string): RiasecProfileCopy | null {
  const normalized = code.toUpperCase().replace(/[^RIASEC]/g, "");
  if (normalized.length !== 3 || new Set(normalized).size !== 3) return null;

  return riasecProfileCopy[normalized as RiasecProfileCode] ?? null;
}

function formatRiasecProfileDescription(profileCopy: RiasecProfileCopy) {
  return profileCopy.description.join(" ");
}

export {
  formatRiasecProfileDescription,
  getRiasecProfileCopy,
  profileVersion,
  riasecDimensionCodes,
  riasecProfileCopy,
};
export type { RiasecDimensionCode, RiasecProfileCode, RiasecProfileCopy };
