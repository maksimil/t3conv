export const fields = [
  "Start Time",
  "Time Completed",
  "Elapsed Time",
  "Sample ID",
  "Experiment",
  "Data File",
  "Plot File",
  "VSM Exp File",
  "VSM Data File",
];

const enumeratedFields = (() => {
  let i = 0;
  let ret = [];

  fields.forEach((s) => {
    i += 1;
    ret.push([s, i]);
  });
  return ret;
})();

const metaregex = new RegExp(
  enumeratedFields.map(([s, _]) => `${s}:\\s*(.*?)\\s*`).join("") +
    "\\*\\*\\*DATA\\*\\*\\*",
  "gm"
);

const unitregex = new RegExp(
  "^Field\\((.*?)\\)\\s*Moment\\((.*?)\\)\\s*$",
  "gm"
);

const dataregex = new RegExp(
  "^\\s*([-\\.0123456789]+)\\s*([-\\.0123456789]+)\\s*$",
  "gm"
);

export type XUnits = "Oe" | "A/m" | "T";
export type YUnits = "emu" | "Am2";

export type ParseResult = {
  meta: { [key: string]: string };
  units: [XUnits, YUnits];
  data: number[][];
  ty: FileType;
};

export type FileType = 0 | 1 | 2;
export const TY_NAMES = ["DCD", "IRM", "Hyst"];

export const parseFile = (source: string, ty: FileType): ParseResult | null => {
  let meta = {};

  const metamatch = [...source.matchAll(metaregex)][0];

  if (metamatch == null || metamatch.length != 10) {
    return null;
  }

  enumeratedFields.map(([s, i]) => {
    meta[s] = metamatch[i];
  });

  const datamatch = [...source.matchAll(dataregex)];

  if (datamatch == null) {
    return null;
  }

  const dataRead = datamatch.map((m) => {
    return [parseFloat(m[1].trim()), parseFloat(m[2].trim())] as [
      number,
      number
    ];
  });

  const data = (() => {
    switch (ty) {
      // DCD
      case 0:
        return cleanData(dataRead);
      case 1:
        return cleanData(dataRead);
      case 2:
        return dataRead;
    }
  })();

  const unitmatch = [...source.matchAll(unitregex)][0];

  if (unitmatch == null) {
    return null;
  }

  const units = [unitmatch[1], unitmatch[2]] as [XUnits, YUnits];

  return { meta, data, ty, units };
};

const isz = (x: number) => Math.abs(x) < 1;

const cleanData = (read: [number, number][]): number[][] => {
  let i = 0;

  if (!isz(read[0][0])) {
    i += 1;
  }

  let res = [];

  if (isz(read[i][0])) {
    res.push([read[i][0], read[i][1], read[i][1]]);
    i += 1;
  } else {
    res.push([0, 0, 0]);
  }

  while (i < read.length) {
    if (!isz(read[i][0])) {
      if (isz(read[i + 1][0])) {
        res.push([read[i][0], read[i][1], read[i + 1][1]]);
        i += 2;
      } else {
        res.push([read[i][0], read[i][1], null]);
        i += 1;
      }
    } else {
      i += 2;
    }
  }

  return res;
};

export const plotData = (source: ParseResult): [number[], number[]][] => {
  switch (source.ty) {
    // DCD
    case 0:
      return dcdPlotData(source.data);
    // IRM
    case 1:
      return irmPlotData(source.data);
    // Hyst
    case 2:
      return hystPlotData(source.data);
  }
};

const tPlotData = (data: number[][]): [number[], number[]][] => {
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

  return [n2, n1];
};

const dcdPlotData = tPlotData;

const irmPlotData = tPlotData;

const hystPlotData = (data: number[][]): [number[], number[]][] => [
  [data.map((v) => v[0]), data.map((v) => v[1])],
];
