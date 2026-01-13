export interface Trend {
  id: string;
  idea: string;
  summary: string;
  url: string;
  score: number;
  suggested_pricing: string;
  generated_copy?: GeneratedCopy;
  generated_image?: string;
}

export interface GeneratedCopy {
  headline: string;
  description: string;
  cta: string;
}
