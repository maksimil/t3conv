import { FileType, ParseResult, XUnits, YUnits } from "../parse";

const unitregex = new RegExp(
  "^Field\\((.*?)\\)\\s*Moment\\((.*?)\\)\\s*$",
  "gm"
);

const dataregex = new RegExp(
  "^\\s*([-\\.0123456789]+)\\s*([-\\.0123456789]+)\\s*$",
  "gm"
);

export const parseLS = (source: string, ty: FileType): ParseResult | null => {
  // console.log({ d: source.replaceAll("\r\n", "\n") });
  const meta = source.replaceAll("\r\n", "\n").split("\n\n***DATA***")[0];

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
