import { FileType, ParseResult, YUnits } from "./parse";

export const plotData = (source: ParseResult): [number[], number[]][] => {
  switch (source.ty) {
    case FileType.LS_DCD:
    case FileType.LS_IRM:
      return lsIrmdcdPlotData(source.data);

    case FileType.LS_HYST:
    case FileType.PR_HYST:
      return hystPlotData(source.data);

    case FileType.PR_IRMDCD_DCD:
    case FileType.PR_IRMDCD_IRM:
      return prIrmdcdPlotData(source.data);
  }
};

const lsIrmdcdPlotData = (data: number[][]): [number[], number[]][] => {
  let n1: [number[], number[]] = [[], []];
  let n2: [number[], number[]] = [[], []];

  data.forEach(([x, y1, y2]) => {
    n1[0].push(x);
    n1[1].push(y1);

    if (y2 != null) {
      n2[0].push(x);
      n2[1].push(y2);
    }
  });

  return [n1, n2];
};

const hystPlotData = (data: number[][]): [number[], number[]][] => [
  [data.map((v) => v[0]), data.map((v) => v[1])],
];

const prIrmdcdPlotData = (data: number[][]): [number[], number[]][] => {
  if (data[0].length === 2) {
    return [[data.map((v) => v[0]), data.map((v) => v[1])]];
  } else {
    return [
      [data.map((v) => v[0]), data.map((v) => v[1])],
      [data.map((v) => v[0]), data.map((v) => v[2])],
    ];
  }
};

const normUnits = (unit: YUnits, mass: boolean, volume: boolean): string => {
  const mask = (mass ? 1 : 0) * 2 + (volume ? 1 : 0) * 1;
  switch (unit) {
    case "emu":
      return ["emu", "emu/cm3", "emu/g", "emu/(g*cm3)"][mask];
    case "Am2":
      return ["Am2", "A/m", "Am2/kg", "A/(kg*m)"][mask];
  }
};

export const dataLabels = (data: ParseResult): string[] => {
  const yunits = normUnits(
    data.units[1],
    data.normalization[0] !== null,
    data.normalization[1] !== null
  );
  switch (data.ty) {
    case FileType.LS_DCD:
    case FileType.LS_IRM:
    case FileType.PR_IRMDCD_DCD:
    case FileType.PR_IRMDCD_IRM:
      if (data.data[0].length === 3) {
        return [
          `Field(${data.units[0]})`,
          `Remanence(${yunits})`,
          `TotalM(${yunits})`,
        ];
      } else {
        return [`Field(${data.units[0]})`, `Remanence(${yunits})`];
      }

    case FileType.LS_HYST:
    case FileType.PR_HYST:
      if (data.normalization[0] !== null || data.normalization[1] !== null) {
        return [`Field(${data.units[0]})`, `Magnetization(${yunits})`];
      } else {
        return [`Field(${data.units[0]})`, `Moment(${yunits})`];
      }
  }
};

export const plotLabels = (data: ParseResult): string[] => {
  const yunits = normUnits(
    data.units[1],
    data.normalization[0] !== null,
    data.normalization[1] !== null
  );

  if (data.normalization[0] !== null || data.normalization[1] !== null) {
    return [`Field(${data.units[0]})`, `Magnetization(${yunits})`];
  } else {
    return [`Field(${data.units[0]})`, `Moment(${yunits})`];
  }
};
