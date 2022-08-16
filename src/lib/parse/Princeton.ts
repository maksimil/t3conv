import { FileType, ParseResult, XUnits, YUnits } from "../parse";

export const parsePrinceton = (
  name: string,
  source: string,
  ty: FileType
): ParseResult | null => {
  // meta
  const split = source.replaceAll("\r\n", "\n").split(/\n\n\s*\n/);
  const meta = split[0];
  const datapart = split[1].split("\n");
  const [headings, segments] = (() => {
    const headings = [
      datapart
        .shift()
        .split(/\s{2,}/)
        .filter((e) => e != ""),
      datapart
        .shift()
        .split(/\s+/)
        .filter((e) => e != "")
        .map((v) => v.substring(1, v.length - 1))
        .map((v) => (v === "Am?" ? "Am2" : v)),
    ];

    let segments = [[]];
    let i = 0;

    while (datapart[i][0] !== "M") {
      if (datapart[i] !== "") {
        segments[segments.length - 1].push(
          datapart[i].split(",").map((v) => parseFloat(v))
        );
      } else {
        segments.push([]);
      }

      i += 1;
    }

    return [headings, segments.filter((c) => c.length > 0)];
  })();

  // data
  const data = (() => {
    switch (ty) {
      case FileType.PR_HYST:
        return extractHyst(ty, headings, segments);

      case FileType.PR_IRMDCD_DCD:
      case FileType.PR_IRMDCD_IRM:
        return extractIrmdcd(ty, headings, segments);
    }
  })();

  // units
  const units = [headings[1][0], headings[1][1]] as [XUnits, YUnits];

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

const extractHyst = (
  _ty: FileType,
  _headings: string[][],
  segments: number[][]
): number[][] => {
  const dataRead = segments.flat();
  return dataRead.map((v) => [v[0], v[1]]);
};

const extractIrmdcd = (
  ty: FileType,
  headings: string[][],
  segments: number[][]
): number[][] => {
  const dataRead =
    segments[{ [FileType.PR_IRMDCD_IRM]: 0, [FileType.PR_IRMDCD_DCD]: 1 }[ty]];

  console.log(dataRead);

  if (headings[0].length > 2 && headings[0][2] === "Direct Moment") {
    return dataRead.map((v) => [v[0], v[1], v[2]]);
  } else {
    return dataRead.map((v) => [v[0], v[1]]);
  }
};
