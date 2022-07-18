import { batch } from "solid-js";
import { SetStoreFunction } from "solid-js/store";

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
  initUnits: [XUnits, YUnits];
  normalization: [number | null, number | null];
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

const FPI = 4 * Math.PI;

const CONVERT_PROPS = {
  Oe: FPI * 10_000,
  "A/m": 10_000_000,
  T: FPI,
  emu: 1_000,
  Am2: 1,
};

export const convertUnits = (
  data: ParseResult,
  setter: SetStoreFunction<ParseResult>,
  units: [XUnits, YUnits]
) => {
  const convertX = CONVERT_PROPS[units[0]] / CONVERT_PROPS[data.units[0]];
  const convertY = CONVERT_PROPS[units[1]] / CONVERT_PROPS[data.units[1]];
  const convertMask = [convertX, convertY, convertY];

  setter("units", units);

  for (let i = 0; i < data.data.length; i++) {
    for (let j = 0; j < data.data[i].length; j++) {
      setter("data", i, j, (d) => (d !== null ? d * convertMask[j] : null));
    }
  }
};

export const dataLabels = (data: ParseResult): string[] => {
  const yunits = normUnits(
    data.units[1],
    data.normalization[0] !== null,
    data.normalization[1] !== null
  );
  switch (data.ty) {
    // DCD, IRM
    case 0:
    case 1:
      return [
        `Field(${data.units[0]})`,
        `TotalM(${yunits})`,
        `Remanence(${yunits})`,
      ];
    // Hyst
    case 2:
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

const normUnits = (unit: YUnits, mass: boolean, volume: boolean): string => {
  const mask = (mass ? 1 : 0) * 2 + (volume ? 1 : 0) * 1;
  switch (unit) {
    case "emu":
      return ["emu", "emu/cm3", "emu/g", "emu/(g*cm3)"][mask];
    case "Am2":
      return ["Am2", "A/m", "Am2/kg", "A/(kg*m)"][mask];
  }
};

export const normalize = (
  data: ParseResult,
  setter: SetStoreFunction<ParseResult>,
  mass: number | null,
  volume: number | null
) => {
  const [nmass, imass] = (() => {
    if (mass === null) {
      return [1, false];
    } else {
      switch (data.units[1]) {
        // from mg to g
        case "emu":
          return [mass / 1_000, true];
        // from mg to kg
        case "Am2":
          return [mass / 1_000_000, true];
      }
    }
  })();

  const [nvolume, ivolume] = (() => {
    if (volume === null) {
      return [1, false];
    } else {
      switch (data.units[1]) {
        // from cm3 to cm3
        case "emu":
          return [volume, true];
        // from cm3 to m3
        case "Am2":
          return [volume / 1_000_000, true];
      }
    }
  })();

  const null1 = (v: number) => (v === null ? 1 : v);

  const ddiv =
    (null1(data.normalization[0]) * null1(data.normalization[1])) /
    (nvolume * nmass);

  for (let i = 0; i < data.data.length; i++) {
    for (let j = 1; j < data.data[i].length; j++) {
      setter("data", i, j, (d) => d * ddiv);
    }
  }

  setter("normalization", [imass ? nmass : null, ivolume ? nvolume : null]);
};

export const normValues = (data: ParseResult): [number, number] => {
  const mass = (() => {
    if (data.normalization[0] === null) {
      return null;
    }

    switch (data.units[1]) {
      case "emu":
        return data.normalization[0] * 1_000;
      case "Am2":
        return data.normalization[0] * 1_000_000;
    }
  })();

  const volume = (() => {
    if (data.normalization[1] === null) {
      return null;
    }

    switch (data.units[1]) {
      case "emu":
        return data.normalization[1];
      case "Am2":
        return data.normalization[1] * 1_000_000;
    }
  })();

  return [mass, volume];
};

export const resetFormatting = (
  data: ParseResult,
  setter: SetStoreFunction<ParseResult>
) => {
  batch(() => {
    normalize(data, setter, null, null);
    convertUnits(data, setter, data.initUnits);
  });
};
