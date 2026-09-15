// Standard Bangladesh SSC/HSC-style grading scale. Adjust the bands
// here if your institution uses a different marking scheme — every
// grade/GPA calculation in the app goes through this one function.
export interface GradeBand {
  minPercentage: number;
  letter: string;
  gpa: number;
}

export const GRADE_SCALE: GradeBand[] = [
  { minPercentage: 80, letter: 'A+', gpa: 5.0 },
  { minPercentage: 70, letter: 'A', gpa: 4.0 },
  { minPercentage: 60, letter: 'A-', gpa: 3.5 },
  { minPercentage: 50, letter: 'B', gpa: 3.0 },
  { minPercentage: 40, letter: 'C', gpa: 2.0 },
  { minPercentage: 33, letter: 'D', gpa: 1.0 },
  { minPercentage: 0, letter: 'F', gpa: 0.0 },
];

export function gradeFromPercentage(percentage: number): GradeBand {
  const clamped = Math.max(0, Math.min(100, percentage));
  return GRADE_SCALE.find((band) => clamped >= band.minPercentage) ?? GRADE_SCALE[GRADE_SCALE.length - 1];
}

export function gradeFromMarks(obtained: number, fullMarks: number): GradeBand {
  if (fullMarks <= 0) return GRADE_SCALE[GRADE_SCALE.length - 1];
  return gradeFromPercentage((obtained / fullMarks) * 100);
}

// Simple unweighted average of subject GPA points — the common
// approach for an overall GPA when every subject carries equal credit.
export function averageGpa(gpas: number[]): number {
  if (gpas.length === 0) return 0;
  const sum = gpas.reduce((acc, g) => acc + g, 0);
  return Math.round((sum / gpas.length) * 100) / 100;
}