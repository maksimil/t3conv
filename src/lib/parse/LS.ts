import { FileType, ParseResult, PlotColor, XUnits, YUnits } from "../parse";
import { normUnits } from "../plot";

const unitregex = new RegExp(
  "^Field\\((.*?)\\)\\s*Moment\\((.*?)\\)\\s*$",
  "gm"
);

const dataregex = new RegExp(
  "^\\s*([-\\.0123456789]+)\\s*([-\\.0123456789]+)\\s*$",
  "gm"
);

export const parseLS = (name: string, source: string, ty: FileType) =>
  new LSParseResult(name, source, ty);

class LSParseResult implements ParseResult {
  // meta
  name: string;
  meta: string;
  ty: FileType;

  // data
  units: [XUnits, YUnits];
  initUnits: [XUnits, YUnits];
  normalization: [number | null, number | null];
  data: number[][];

  constructor(name: string, source: string, ty: FileType) {
    this.name = name;
    this.meta = source.replaceAll("\r\n", "\n").split("\n\n***DATA***")[0];
    this.ty = ty;

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

    this.data = (() => {
      switch (ty) {
        case FileType.LS_DCD:
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

    this.units = [unitmatch[1], unitmatch[2]] as [XUnits, YUnits];
    this.initUnits = this.units;

    this.normalization = [null, null];
  }

  getPlotData() {
    const x = this.data.map((v) => v[0]);
    const labels = this.getDataLabels();

    switch (this.ty) {
      case FileType.LS_HYST:
        return [
          {
            x,
            y: this.data.map((v) => v[1]),
            name: labels[1],
            color: PlotColor.PRIMARY,
          },
        ];

      case FileType.LS_DCD:
      case FileType.LS_IRM:
        const filteredData = this.data.filter((v) => v[2] !== null);
        return [
          {
            x,
            y: this.data.map((v) => v[1]),
            name: labels[1],
            color: PlotColor.PRIMARY,
          },
          {
            x,
            y: filteredData.map((v) => v[2]),
            name: labels[2],
            color: PlotColor.SECONDARY,
          },
        ];
    }
  }

  getDataLabels() {
    const yunits = normUnits(
      this.units[1],
      this.normalization[0] !== null,
      this.normalization[1] !== null
    );
    switch (this.ty) {
      case FileType.LS_DCD:
      case FileType.LS_IRM:
        return [
          `Field(${this.units[0]})`,
          `Remanence(${yunits})`,
          `TotalM(${yunits})`,
        ];

      case FileType.LS_HYST:
        if (this.normalization[0] !== null || this.normalization[1] !== null) {
          return [`Field(${this.units[0]})`, `Magnetization(${yunits})`];
        } else {
          return [`Field(${this.units[0]})`, `Moment(${yunits})`];
        }
    }
  }
}

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
        res.push([read[i][0], read[i + 1][1], read[i][1]]);
        i += 2;
      } else {
        res.push([read[i][0], null, read[i][1]]);
        i += 1;
      }
    } else {
      i += 2;
    }
  }

  return res;
};
