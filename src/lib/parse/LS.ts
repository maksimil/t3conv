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

export const parseLS = (
  name: string,
  source: string,
  ty: FileType
): ParseResult => new LSParseResult(name, source, ty);

const unitregex = new RegExp(
  "^Field\\((.*?)\\)\\s*Moment\\((.*?)\\)\\s*$",
  "gm"
);

const dataregex = new RegExp(
  "^\\s*([-\\.0123456789]+)\\s*([-\\.0123456789]+)\\s*$",
  "gm"
);

class LSParseResult implements ParseResult {
  // meta
  name: string;
  meta: string;
  ty: FileType;

  // data
  units: [XUnits, YUnits];
  initUnits: [XUnits, YUnits];
  normalization: Normalization = NORMALIZATION;
  data: (number | null)[][][];

  constructor(name: string, source: string, ty: FileType) {
    this.name = name;
    this.meta = source.split("\n\n***DATA***")[0];
    this.ty = ty;

    const datamatch = [...source.matchAll(dataregex)];

    if (datamatch == null) {
      throw "Data not found in the file";
    }

    const dataRead: number[][] = datamatch.map((m) => {
      return [parseFloat(m[1].trim()), parseFloat(m[2].trim())] as [
        number,
        number
      ];
    });

    this.data = [
      (() => {
        switch (ty) {
          case FileType.LS_DCD:
          case FileType.LS_IRM:
            return cleanData(dataRead);
          case FileType.LS_HYST:
            return dataRead;
        }
        throw "Unknown type";
      })(),
    ];

    const unitmatch = [...source.matchAll(unitregex)][0];

    if (unitmatch == null) {
      throw "Units not found in the file";
    }

    this.units = [unitmatch[1], unitmatch[2]] as [XUnits, YUnits];
    this.initUnits = this.units;
  }

  getPlotData() {
    const x = this.data[0].map((v) => v[0]) as number[];
    const labels = this.getDataLabels();

    switch (this.ty) {
      case FileType.LS_HYST:
        return [
          {
            x,
            y: this.data[0].map((v) => v[1]) as number[],
            name: labels[1],
            color: PlotColor.PRIMARY,
          },
        ];

      case FileType.LS_DCD:
      case FileType.LS_IRM:
        const filteredData = this.data[0].filter(
          (v) => v[2] !== null
        ) as number[][];
        return [
          {
            x,
            y: this.data[0].map((v) => v[1]) as number[],
            name: labels[1],
            color: PlotColor.PRIMARY,
          },
          {
            x: filteredData.map((v) => v[0]),
            y: filteredData.map((v) => v[2]),
            name: labels[2],
            color: PlotColor.SECONDARY,
          },
        ];
    }
    return [];
  }

  getDataLabels() {
    const yunits = normUnits(
      this.units[1],
      this.normalization.mass.enabled,
      this.normalization.volume.enabled
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
        if (
          this.normalization.mass.enabled ||
          this.normalization.volume.enabled
        ) {
          return [`Field(${this.units[0]})`, `Magnetization(${yunits})`];
        } else {
          return [`Field(${this.units[0]})`, `Moment(${yunits})`];
        }
    }
    return ["Err in getDataLabels()"];
  }
}

const isz = (x: number) => Math.abs(x) < 1;

const cleanData = (read: [number, number][]): (number | null)[][] => {
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
