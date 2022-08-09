import { parseLS } from "./parse/LS";

export type XUnits = "Oe" | "A/m" | "T";
export type YUnits = "emu" | "Am2";

export type ParseResult = {
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
}

export const TY_SUFFIX: Record<FileType, string> = {
  [FileType.LS_DCD]: "DCD",
  [FileType.LS_IRM]: "IRM",
  [FileType.LS_HYST]: "Hyst",
};

export const FILE_TYPES = Object.keys(TY_SUFFIX) as FileType[];

export const parseFile = (source: string, ty: FileType): ParseResult | null => {
  switch (ty) {
    case FileType.LS_DCD:
    case FileType.LS_IRM:
    case FileType.LS_HYST:
      return parseLS(source, ty);
  }
};
