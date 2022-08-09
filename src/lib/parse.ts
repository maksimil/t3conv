export const FIELDS = [
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

  FIELDS.forEach((s) => {
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
  meta: [string, string][];
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
  let meta = [];

  const metamatch = [...source.matchAll(metaregex)][0];

  if (metamatch == null || metamatch.length != 10) {
    return null;
  }

  enumeratedFields.map(([s, i]) => {
    meta.push([s, metamatch[i]]);
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
      case FileType.LS_DCD:
        return cleanData(dataRead);
      case FileType.LS_IRM:
        return cleanData(dataRead);
      case FileType.LS_HYST:
        return dataRead;
    }
  })();

  const unitmatch = [...source.matchAll(unitregex)][0];

  if (unitmatch == null) {
    return null;
  }

  const units = [unitmatch[1], unitmatch[2]] as [XUnits, YUnits];

  return {
    meta,
    data,
    ty,
    units,
    initUnits: units,
    normalization: [null, null],
  };
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
