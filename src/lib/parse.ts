import { parseLS } from "./parse/LS";
import { parsePrinceton } from "./parse/Princeton";

export enum XUnits {
  Oe = "Oe",
  Am = "A/m",
  T = "T",
}

export const XUNITS = Object.values(XUnits);

export enum YUnits {
  emu = "emu",
  Am2 = "Am2",
}

export const YUNITS = Object.values(YUnits);

export enum PlotColor {
  PRIMARY = 0,
  SECONDARY = 1,
}

type PlotData = {
  x: number[];
  y: number[];
  name: string;
  color: PlotColor;
};

export interface ParseResult {
  // meta
  name: string;
  meta: string;
  ty: FileType;

  // data for conversion
  units: [XUnits, YUnits];
  initUnits: [XUnits, YUnits];
  normalization: [number | null, number | null];
  data: number[][][];

  // interfaces for plotting
  getDataLabels(): string[];
  getPlotData(): PlotData[];
}

export enum FileType {
  LS_DCD = "LS7400VSM DCD",
  LS_IRM = "LS7400VSM IRM",
  LS_HYST = "LS7400VSM Hyst",
  PRINCETON = "Princeton",
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
    case FileType.PRINCETON:
      return parsePrinceton(name, source, ty);
  }
};
