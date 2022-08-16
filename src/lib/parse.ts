import { parseLS } from "./parse/LS";
import { parsePrinceton } from "./parse/Princeton";

export type XUnits = "Oe" | "A/m" | "T";
export type YUnits = "emu" | "Am2";

export type ParseResult = {
  name: string;
  meta: string;
  units: [XUnits, YUnits];
  initUnits: [XUnits, YUnits];
  normalization: [number | null, number | null];
  data: number[][];
  ty: FileType;
};

export enum FileType {
  LS_DCD = "LS7400VSM DCD",
  LS_IRM = "LS7400VSM IRM",
  LS_HYST = "LS7400VSM Hyst",
  PR_HYST = "Princeton Hyst",
  PR_IRMDCD_IRM = "Princeton IRM+DCD as IRM",
  PR_IRMDCD_DCD = "Princeton IRM+DCD as DCD",
}

export const FILE_TYPES = Object.values(FileType);

export const parseFile = (
  name: string,
  source: string,
  ty: FileType
): ParseResult | null => {
  switch (ty) {
    case FileType.LS_DCD:
    case FileType.LS_IRM:
    case FileType.LS_HYST:
      return parseLS(name, source, ty);
    case FileType.PR_HYST:
    case FileType.PR_IRMDCD_IRM:
    case FileType.PR_IRMDCD_DCD:
      return parsePrinceton(name, source, ty);
  }
};
