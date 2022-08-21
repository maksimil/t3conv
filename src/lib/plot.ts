import { ParseResult, YUnits } from "./parse";

export const normUnits = (
  unit: YUnits,
  mass: boolean,
  volume: boolean
): string => {
  const mask = (mass ? 1 : 0) * 2 + (volume ? 1 : 0) * 1;
  switch (unit) {
    case YUnits.emu:
      return ["emu", "emu/cm3", "emu/g", "emu/(g*cm3)"][mask];
    case YUnits.Am2:
      return ["Am2", "A/m", "Am2/kg", "A/(kg*m)"][mask];
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
