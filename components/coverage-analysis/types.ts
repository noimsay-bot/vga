export type CoverageBand = "full" | "partial" | "low";
export type VizMode =
  | "gap"
  | "radar"
  | "heatmap"
  | "waterline"
  | "triage"
  | "rings"
  | "dumbbell"
  | "waffle"
  | "treemap"
  | "speedometer"
  | "brickwall"
  | "moneyunits"
  | "reportcard";

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
  order?: number;
}

export interface CoverageCategory {
  id: string;
  name: string;
  items: CoverageItem[];
  order?: number;
}

export interface CoverageProject {
  id: string;
  clientName: string;
  asOf: string;
  categories: CoverageCategory[];
  vizModes: VizMode[];
  showItemDetail: boolean;
  customerMode: boolean;
  updatedAt: number;
}

export type LegacyCoverageProject = Omit<CoverageProject, "vizModes" | "showItemDetail"> & {
  vizMode?: VizMode;
  vizModes?: VizMode[];
  showItemDetail?: boolean;
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
