import {
  FileType,
  NORMALIZATION,
  Normalization,
  ParseResult,
  PlotColor,
  PlotData,
  XUnits,
  YUnits,
} from "@lib/parse";
import { normUnits } from "@lib/plot";
import { parse as papaparse } from "papaparse";

export const parseCSV = (
  name: string,
  source: string,
  ty: FileType
): ParseResult => new CSVParseResult(name, source, ty);

const parseXUnits = (s: string): XUnits => {
  switch (s) {
    case "T":
      return XUnits.T;
  }
  throw "Not implemented XUnits";
};

const parseYUnits = (s: string): YUnits => {
  switch (s) {
    case "A*м2":
      return YUnits.Am2;
  }
  throw "Not implemented YUnits";
};

class CSVParseResult implements ParseResult {
  // meta
  name: string;
  meta: string;
  ty: FileType;

  // data
  units: [XUnits, YUnits];
  initUnits: [XUnits, YUnits];
  normalization: Normalization = NORMALIZATION;
  data: (number | null)[][][];

  // additional
  labels: string[];

  constructor(name: string, source: string, ty: FileType) {
    this.name = name;
    this.meta = source;
    this.ty = ty;

    const csv_data = papaparse<string[]>(source, { skipEmptyLines: true });
    const [header_row, ...rest_data] = csv_data.data;
    console.log(header_row);

    // parsing units and labels
    this.units = [
      parseXUnits(header_row[0].split(",")[1].trim()),
      parseYUnits(header_row[1].split(",")[1].trim()),
    ];
    this.initUnits = this.units;

    this.labels = header_row.map((head) => head.split(",")[0].trim());

    // parsing data
    this.data = [
      rest_data.map((string_row) => {
        const number_row = string_row.map((s) =>
          s == "" ? null : parseFloat(s.trim())
        );
        return number_row;
      }),
    ];

    console.log(rest_data);
  }

  getPlotData(): PlotData[] {
    const x = this.data[0].map((v) => v[0]) as number[];
    const ydatas = Array.from(
      { length: this.labels.length - 1 },
      (_, i) => i + 1
    ).map((k) => ({
      x,
      y: this.data[0].map((v) => v[k]) as number[],
      name: this.labels[k],
      color: k == 1 ? PlotColor.PRIMARY : PlotColor.SECONDARY,
    }));

    return ydatas;
  }

  getDataLabels(): string[] {
    const [xlabel, ...ylabels] = this.labels;
    const yunits = normUnits(
      this.units[1],
      this.normalization.mass.enabled,
      this.normalization.volume.enabled
    );
    return [
      `${xlabel} (${this.units[0]})`,
      ...ylabels.map((ylabel) => `${ylabel} (${yunits})`),
    ];
  }
}
