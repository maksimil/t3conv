import { FileType, ParseResult, PlotColor, XUnits, YUnits } from "../parse";
import { normUnits } from "../plot";

const splitData = (data: string): [string[][], number[][][]] => {
  const lines = data.split("\n");
  const headings = [
    lines
      .shift()
      .split(/\s{2,}/)
      .filter((e) => e != ""),
    lines
      .shift()
      .split(/\s{2,}/)
      .filter((e) => e != ""),
  ];

  let segments = [[]];
  let i = 0;

  while (lines[i][0] !== "M") {
    if (lines[i] !== "") {
      segments[segments.length - 1].push(
        lines[i].split(",").map((v) => parseFloat(v))
      );
    } else {
      segments.push([]);
    }

    i += 1;
  }

  return [headings, segments.filter((c) => c.length > 0)];
};

class PrincetonParseResult implements ParseResult {
  // meta
  name: string;
  meta: string;
  ty: FileType;

  // data for conversion
  units: [XUnits, YUnits];
  initUnits: [XUnits, YUnits];
  normalization: [number | null, number | null];
  data: number[][][];

  // additional
  headings: string[];

  constructor(name: string, source: string, ty: FileType) {
    // meta
    const split = source.replaceAll("\r\n", "\n").split(/\n\n\s*\n/);
    this.name = name;
    this.meta = split[0];
    this.ty = ty;

    // data
    const [headings, segments] = splitData(split[1]);

    const length = headings[0][2] === "Direct Moment" ? 3 : 2;
    this.data = segments.map((segment) =>
      segment.map((row) => row.slice(0, length))
    );
    this.headings = headings[0]
      .slice(0, length)
      .map((v) => (v === "Direct Moment" ? "TotalM" : v));

    this.units = [
      headings[1][0].match(/\((.*)\)/)[1] as XUnits,
      [headings[1][1].match(/\((.*)\)/)[1]].map((v) =>
        v === "Am?" ? "Am2" : v
      )[0] as YUnits,
    ];
    this.initUnits = this.units;

    this.normalization = [null, null];
  }

  getDataLabels() {
    const yunits = normUnits(
      this.units[1],
      this.normalization[0] !== null,
      this.normalization[1] !== null
    );

    const isNormalized =
      this.normalization[0] !== null || this.normalization[1] !== null;

    if (!isNormalized) {
      return this.headings.map(
        (v, i) => `${v}(${i === 0 ? this.units[0] : yunits})`
      );
    } else {
      return this.headings.map(
        (v, i) =>
          `${v === "Moment" ? "Magnetization" : v}(${
            i === 0 ? this.units[0] : yunits
          })`
      );
    }
  }

  getPlotData() {
    const labels = this.getDataLabels();

    return this.data
      .map((segment, i) => {
        const x = segment.map((v) => v[0]);

        const primaryLine = {
          x,
          y: segment.map((v) => v[1]),
          name: i === 0 ? labels[1] : "",
          color: PlotColor.PRIMARY,
        };

        if (segment[0].length === 2) {
          return [primaryLine];
        } else {
          return [
            primaryLine,
            {
              x,
              y: segment.map((v) => v[2]),
              name: i === 0 ? labels[2] : "",
              color: PlotColor.SECONDARY,
            },
          ];
        }
      })
      .flat();
  }
}

export const parsePrinceton = (name: string, source: string, ty: FileType) => {
  return new PrincetonParseResult(name, source, ty);
};
