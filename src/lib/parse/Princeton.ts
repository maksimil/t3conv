import { FileType, ParseResult, XUnits, YUnits } from "../parse";

const unitsRegex = /\s*Field\s*Moment\s*Temperature\s*\((.*?)\)\s*\((.*?)\)/gm;

const dataRegex = /^([0-9E+\-\.]*?),([0-9E+\-\.]*?),[0-9E+\-\.]*?$/gm;

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
        .split(/\s+/)
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
  console.log(headings, segments);

  // data
  const data = (() => {
    switch (ty) {
      case FileType.PR_HYST:
        const dataRead = segments.flat();
        return dataRead.map((v) => [v[0], v[1]]);
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
