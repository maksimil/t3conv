import {
  FileType,
  NORMALIZATION,
  Normalization,
  ParseResult,
  PlotColor,
  XUnits,
  YUnits,
} from "@lib/parse";
import { normUnits } from "@lib/plot";

export const parsePrinceton = (
  name: string,
  source: string,
  ty: FileType
): ParseResult => {
  return new PrincetonParseResult(name, source, ty);
};

const splitData = (data: string): [string[][], number[][][]] => {
  const lines = data.split("\n");
  const headings = [0, 0].map((_) =>
    (lines.shift() as string).split(/\s{2,}/).filter((e) => e != "")
  );

  let segments: number[][][] = [[]];
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

const META_NAMES = [
  "Datafile type",
  "",
  "",
  "Averaging time in seconds",
  "",
  "",
  "Applied field",
  "Step size",
  "",
  "Max field in units from field header",
  "",
  "Number of remanance measurement points",
  "N turnaround",
  "Number of datapoints",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "Comment",
  "",
  "",
  "",
  "Temperature",
  "Date time",
  "Temperature units 0=Kelvin, -1=Celcius",
  "Field and moment units: 0=cgs, 1=SI, 2=Hybrid SI",
  "",
  "experiment type: 0=single temp loop, 1=m(t), " +
    "2=loops v. orientation, 3=loops v. temp., 4=DCDemag (Hcr)",
  "",
  "",
  "",
];

const META_SEPARATOR = "  ";

const formatMetaLabel = (label: string): string =>
  `<code class="text-red-600">${label}</code>`;

const genMeta = (meta: string[]): string => {
  let output = "<pre>This metadata was generated automatically\n</pre>";

  const metaLength = Math.max(...meta.map((v) => v.length));
  const formattedMeta = meta.map((v) => v.padEnd(metaLength));

  for (let i = 0; i < meta.length; i++) {
    output +=
      "\n" + formattedMeta[i] + META_SEPARATOR + formatMetaLabel(META_NAMES[i]);
  }

  return output;
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
  normalization: Normalization = NORMALIZATION;

  data: (number | null)[][][];

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

      const metadata = splitMeta(meta);
      this.name = name;
      this.meta = genMeta(metadata);
      this.ty = ty;

      // units
      this.units = [UNITS["cgs"], UNITS["SI"], UNITS["Hybrid SI"]][
        parseInt(metadata[29])
      ];
      this.initUnits = this.units;

      switch (metadata[31]) {
        // Hyst
        case "0":
          this.headings = ["Field", "Moment"];
          this.data = [data];
          break;
        // IRM and DCD
        case "4":
          switch (metadata.slice(32, 35).join(" ")) {
            case "1 0 1":
              this.headings = ["Field", "Remanence"];
              this.data = [data];
              break;
            case "3 0 3":
              this.headings = ["Field", "Remanence", "TotalM"];
              this.data = [data.map((v) => [v[0], v[2], v[1]])];
              break;
            case "99 3 99":
              this.headings = ["Field", "Remanence", "TotalM"];
              let datasplit: number[][][] = [[]];
              const maxfield = data
                .map((v) => v[0])
                .reduce((p, c) => Math.max(p, c));
              for (let i = 0; i < data.length; i++) {
                datasplit[datasplit.length - 1].push([
                  data[i][0],
                  data[i][2],
                  data[i][1],
                ]);
                if (data[i][0] === maxfield) {
                  datasplit.push([]);
                }
              }
              this.data = datasplit;
              break;
            default:
              throw "Unknown metadata[32-34]";
          }
          break;
        default:
          throw "Unknown metadata[31]";
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
      const unitsmatch = this.meta.match(
        /Units of measure\s*(Hybrid SI|SI|cgs)/
      );
      if (unitsmatch === null) {
        throw "Units of measure not found in file metadata";
      }
      this.units = UNITS[unitsmatch[1]];
      this.initUnits = this.units;
    }
  }

  getDataLabels() {
    const yunits = normUnits(
      this.units[1],
      this.normalization.mass.enabled,
      this.normalization.volume.enabled
    );

    const isNormalized =
      this.normalization.mass.enabled || this.normalization.volume.enabled;

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
        const x = segment.map((v) => v[0]) as number[];

        const primaryLine = {
          x,
          y: segment.map((v) => v[1]) as number[],
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
              y: segment.map((v) => v[2]) as number[],
              name: i === 0 ? labels[2] : "",
              color: PlotColor.SECONDARY,
            },
          ];
        }
      })
      .flat();
  }
}
