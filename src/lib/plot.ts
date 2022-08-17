import { FileType, ParseResult, YUnits } from "./parse";

type PlotData = {
  x: number[];
  y: number[];
  name: string;
  color: 0 | 1;
};

export const plotData = (source: ParseResult): PlotData[] => {
  switch (source.ty) {
    case FileType.LS_DCD:
    case FileType.LS_IRM:
      return lsIrmdcdPlotData(source);

    case FileType.LS_HYST:
    case FileType.PR_HYST:
      return hystPlotData(source);

    case FileType.PR_IRMDCD_DCD:
    case FileType.PR_IRMDCD_IRM:
      return prIrmdcdPlotData(source);
  }
};

const lsIrmdcdPlotData = (source: ParseResult): PlotData[] => {
  const labels = dataLabels(source);

  let n1: PlotData = {
    x: [],
    y: [],
    name: labels[1],
    color: 0,
  };

  let n2: PlotData = {
    x: [],
    y: [],
    name: labels[2],
    color: 1,
  };

  source.data.forEach(([x, y1, y2]) => {
    n1.x.push(x);
    n1.y.push(y1);

    if (y2 != null) {
      n2.x.push(x);
      n2.y.push(y2);
    }
  });

  return [n1, n2];
};

const hystPlotData = (source: ParseResult): PlotData[] => {
  const labels = dataLabels(source);
  return [
    {
      x: source.data.map((v) => v[0]),
      y: source.data.map((v) => v[1]),
      name: labels[1],
      color: 0,
    },
  ];
};

const prIrmdcdPlotData = (source: ParseResult): PlotData[] => {
  const labels = dataLabels(source);
  const x = source.data.map((v) => v[0]);

  if (source.data[0].length === 2) {
    return [
      {
        x,
        y: source.data.map((v) => v[1]),
        name: labels[1],
        color: 0,
      },
    ];
  } else {
    return [
      {
        x,
        y: source.data.map((v) => v[1]),
        name: labels[1],
        color: 0,
      },
      {
        x,
        y: source.data.map((v) => v[2]),
        name: labels[2],
        color: 1,
      },
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
