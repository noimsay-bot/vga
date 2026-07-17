export type CoverageBand = "full" | "partial" | "low";
export type VizMode =
  | "gap"
  | "radar"
  | "heatmap"
  | "waterline"
  | "triage"
  | "rings"
  | "dumbbell"
  | "waffle";

export interface InsurerCoverage {
  id: string;
  name: string;
  amount: number;
}

export interface CoverageItem {
  id: string;
  name: string;
  needed: number;
  heldManual: number;
  insurers: InsurerCoverage[];
}

export interface CoverageCategory {
  id: string;
  name: string;
  items: CoverageItem[];
}

export interface CoverageProject {
  id: string;
  clientName: string;
  asOf: string;
  categories: CoverageCategory[];
  vizModes: VizMode[];
  customerMode: boolean;
  updatedAt: number;
}

export type LegacyCoverageProject = Omit<CoverageProject, "vizModes"> & {
  vizMode?: VizMode;
  vizModes?: VizMode[];
};

export interface SeedInsurerCoverage {
  ins: string;
  amt: number;
}

export interface SeedCoverageItem {
  name: string;
  needed: number;
  held: number;
  ins: SeedInsurerCoverage[];
}

export interface SeedCoverageCategory {
  cat: string;
  items: SeedCoverageItem[];
}
