import {
  NORMALIZATION,
  Normalization,
  ParseResult,
  XUnits,
  YUnits,
} from "./parse";

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

const MASS_MULTS = { [YUnits.emu]: 1_000, [YUnits.Am2]: 1_000_000 };
const VOLUME_MULTS = { [YUnits.emu]: 1, [YUnits.Am2]: 1_000_000 };

const normMul = (norm: Normalization, units: YUnits) => {
  let massMul = 1;
  let volumeMul = 1;

  if (norm.mass.enabled) {
    massMul = norm.mass.value / MASS_MULTS[units];
  }

  if (norm.volume.enabled) {
    volumeMul = norm.volume.value / VOLUME_MULTS[units];
  }

  return massMul * volumeMul;
};

export const normalize = (
  data: ParseResult,
  normalization: Normalization
): ParseResult => {
  const ddiv =
    normMul(data.normalization, data.units[1]) /
    normMul(normalization, data.units[1]);

  for (let k = 0; k < data.data.length; k++) {
    for (let i = 0; i < data.data[k].length; i++) {
      for (let j = 1; j < data.data[k][i].length; j++) {
        if (data.data[k][i][j] !== null) {
          data.data[k][i][j] = (data.data[k][i][j] as number) * ddiv;
        }
      }
    }
  }

  data.normalization = normalization;

  return data;
};

export const resetFormatting = (data: ParseResult): ParseResult => {
  data = normalize(data, NORMALIZATION);
  data = convertUnits(data, data.initUnits);
  return data;
};
