import { FileType, ParseResult, XUnits, YUnits } from "../parse";

export const parsePrinceton = (
  name: string,
  source: string,
  ty: FileType
): ParseResult | null => {
  const meta = source
    .replaceAll("\r\n", "\n")
    .split(/\n\n\s*Field\s*Moment\s*Temperature/)[0];

  const data = [
    [0, 0],
    [1, 1],
  ];

  const units: [XUnits, YUnits] = ["Oe", "emu"];

  return {
    name,
    meta,
    data,
    ty,
    units,
    initUnits: units,
    normalization: [null, null],
  };
};
