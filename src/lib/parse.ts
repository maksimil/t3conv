export enum XUnits {
  Oe = "Oe",
  Am = "A/m",
  T = "T",
  mT = "mT",
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

export type PlotData = {
  x: number[];
  y: number[];
  name: string;
  color: PlotColor;
};

export type Normalization = {
  mass: { value: number; enabled: boolean };
  volume: { value: number; enabled: boolean };
};

export const NORMALIZATION: Normalization = {
  mass: { value: 1, enabled: false },
  volume: { value: 1, enabled: false },
};

export interface ParseResult {
  // meta
  name: string;
  meta: string;
  ty: FileType;

  // data for conversion
  units: [XUnits, YUnits];
  initUnits: [XUnits, YUnits];
  normalization: Normalization;
  data: (number | null)[][][];

  // interfaces for plotting
  getDataLabels(): string[];
  getPlotData(): PlotData[];
}

export enum FileType {
  LS_DCD = "LS7400VSM DCD",
  LS_IRM = "LS7400VSM IRM",
  LS_HYST = "LS7400VSM Hyst",
  PRINCETON = "Princeton",
  CSV = "CSV",
}

export const FILE_TYPES = Object.values(FileType);
