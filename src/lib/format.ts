import { ParseResult, XUnits, YUnits } from "./parse";
import { SetStoreFunction } from "solid-js/store";
import { batch } from "solid-js";

const FPI = 4 * Math.PI;

const CONVERT_PROPS = {
  [XUnits.Oe]: FPI * 10_000,
  [XUnits.Am]: 10_000_000,
  [XUnits.T]: FPI,
  [YUnits.emu]: 1_000,
  [YUnits.Am2]: 1,
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

  for (let k = 0; k < data.data.length; k++) {
    for (let i = 0; i < data.data[k].length; i++) {
      for (let j = 0; j < data.data[k][i].length; j++) {
        setter("data", k, i, j, (d) =>
          d !== null ? d * convertMask[j] : null
        );
      }
    }
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
        setter("data", k, i, j, (d) => d * ddiv);
      }
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

export const resetFormatting = (
  data: ParseResult,
  setter: SetStoreFunction<ParseResult>
) => {
  batch(() => {
    normalize(data, setter, null, null);
    convertUnits(data, setter, data.initUnits);
  });
};
