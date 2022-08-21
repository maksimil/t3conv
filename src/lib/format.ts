import { ParseResult, XUnits, YUnits } from "./parse";

const FPI = 4 * Math.PI;

const CONVERT_PROPS = {
  [XUnits.Oe]: FPI * 10_000,
  [XUnits.Am]: 10_000_000,
  [XUnits.T]: FPI,
  [XUnits.mT]: FPI * 1_000,
  [YUnits.emu]: 1_000,
  [YUnits.Am2]: 1,
};

export const convertUnits = (
  data: ParseResult,
  units: [XUnits, YUnits]
): ParseResult => {
  const convertX = CONVERT_PROPS[units[0]] / CONVERT_PROPS[data.units[0]];
  const convertY = CONVERT_PROPS[units[1]] / CONVERT_PROPS[data.units[1]];
  const convertMask = [convertX, convertY, convertY];

  data.units = units;

  for (let k = 0; k < data.data.length; k++) {
    for (let i = 0; i < data.data[k].length; i++) {
      for (let j = 0; j < data.data[k][i].length; j++) {
        const d = data.data[k][i][j];
        data.data[k][i][j] = d !== null ? d * convertMask[j] : null;
      }
    }
  }

  return data;
};

export const normalize = (
  data: ParseResult,
  mass: number | null,
  volume: number | null
): ParseResult => {
  const [nmass, imass] = (() => {
    if (mass === null) {
      return [1, false];
    } else {
      switch (data.units[1]) {
        // from mg to g
        case YUnits.emu:
          return [mass / 1_000, true];
        // from mg to kg
        case YUnits.Am2:
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
        case YUnits.emu:
          return [volume, true];
        // from cm3 to m3
        case YUnits.Am2:
          return [volume / 1_000_000, true];
      }
    }
  })();

  const null1 = (v: number) => (v === null ? 1 : v);

  const ddiv =
    (null1(data.normalization[0]) * null1(data.normalization[1])) /
    (nvolume * nmass);

  for (let k = 0; k < data.data.length; k++) {
    for (let i = 0; i < data.data[k].length; i++) {
      for (let j = 1; j < data.data[k][i].length; j++) {
        data.data[k][i][j] *= ddiv;
      }
    }
  }

  data.normalization = [imass ? nmass : null, ivolume ? nvolume : null];

  return data;
};

export const normValues = (data: ParseResult): [number, number] => {
  const mass = (() => {
    if (data.normalization[0] === null) {
      return null;
    }

    switch (data.units[1]) {
      case YUnits.emu:
        return data.normalization[0] * 1_000;
      case YUnits.Am2:
        return data.normalization[0] * 1_000_000;
    }
  })();

  const volume = (() => {
    if (data.normalization[1] === null) {
      return null;
    }

    switch (data.units[1]) {
      case YUnits.emu:
        return data.normalization[1];
      case YUnits.Am2:
        return data.normalization[1] * 1_000_000;
    }
  })();

  return [mass, volume];
};

export const resetFormatting = (data: ParseResult): ParseResult => {
  data = normalize(data, null, null);
  data = convertUnits(data, data.initUnits);
  return data;
};
