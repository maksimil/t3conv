import { FileType, ParseResult, PlotColor, XUnits, YUnits } from "../parse";
import { normUnits } from "../plot";

export const parsePrinceton = (
  name: string,
  source: string,
  ty: FileType
): ParseResult => {
  return new PrincetonParseResult(name, source, ty);
};

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

const splitMeta = (meta: string): string[] => {
  let data = [""];
  let quotemode = false;

  for (let i = 0; i < meta.length; i++) {
    if (meta[i] == '"') {
      quotemode = !quotemode;
    } else if (quotemode) {
      data[data.length - 1] += meta[i];
    } else if (meta[i] === ",") {
      data.push("");
    } else {
      data[data.length - 1] += meta[i];
    }
  }

  return data;
};

const UNITS: { [name: string]: [XUnits, YUnits] } = {
  "Hybrid SI": [XUnits.T, YUnits.Am2],
  SI: [XUnits.Am, YUnits.Am2],
  cgs: [XUnits.Oe, YUnits.emu],
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
    if (source.split("\n")[1] === "") {
      // old format
      // meta
      const [meta, _, ...rest] = source.split("\n");
      const data = rest
        .slice(0, rest.length - 2)
        .map((line) => line.split(",").map(parseFloat));

      this.name = name;
      this.meta = meta;
      this.ty = ty;
      const metadata = splitMeta(meta);

      // units
      this.units = [UNITS["cgs"], UNITS["SI"], UNITS["Hybrid SI"]][
        parseInt(metadata[29])
      ];
      this.initUnits = this.units;
      this.normalization = [null, null];

      switch (metadata[31]) {
        // Hyst
        case "0":
          this.headings = ["Field", "Moment"];
          this.data = [data];
          break;
        // IRM and DCD
        case "4":
          throw Error(
            "Princeton not implemented for IRM and DCD in old Princeton files"
          );
          break;
      }
    } else {
      // modern format
      // meta
      const split = source.split(/\n\n\s+/);
      console.log(split);
      this.name = name;
      this.meta = split[0];
      this.ty = ty;

      // data
      const [headings, segments] = splitData(split[1]);

      const headers = headings[0][0] === "Raw" ? headings[1] : headings[0];

      const length = headers[2] === "Direct Moment" ? 3 : 2;
      this.data = segments.map((segment) =>
        segment.map((row) => row.slice(0, length))
      );
      this.headings = headers
        .slice(0, length)
        .map((v) => (v === "Direct Moment" ? "TotalM" : v));

      // units
      this.units =
        UNITS[this.meta.match(/Units of measure\s*(Hybrid SI|SI|cgs)/)[1]];
      this.initUnits = this.units;

      this.normalization = [null, null];
    }
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
