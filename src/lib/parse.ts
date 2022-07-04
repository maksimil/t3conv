export const fields = [
  "Start Time",
  "Time Completed",
  "Elapsed Time",
  "Sample ID",
  "Experiment",
  "Data File",
  "Plot File",
  "VSM Exp File",
  "VSM Data File",
];

const enumeratedFields = (() => {
  let i = 0;
  let ret = [];

  fields.forEach((s) => {
    i += 1;
    ret.push([s, i]);
  });
  return ret;
})();

const metaregex = new RegExp(
  enumeratedFields.map(([s, _]) => `${s}:\\s*(.*?)\\s*`).join("") +
    "\\*\\*\\*DATA\\*\\*\\*",
  "gm"
);

const dataregex = new RegExp(
  "^\\s*([-\\.0123456789]+)\\s*([-\\.0123456789]+)\\s*$",
  "gm"
);

export type ParseResult = {
  meta: { [key: string]: string };
  data: [number, number][];
  ty: FileType;
};

export type FileType = 0 | 1 | 2;
export const TY_NAMES = ["DCD", "IRM", "Hyst"];

export const parseFile = (source: string, ty: FileType): ParseResult | null => {
  let meta = {};

  const metamatch = [...source.matchAll(metaregex)][0];

  if (metamatch == null || metamatch.length != 10) {
    return null;
  }

  enumeratedFields.map(([s, i]) => {
    meta[s] = metamatch[i];
  });

  const datamatch = [...source.matchAll(dataregex)];

  if (datamatch == null) {
    return null;
  }

  const data = datamatch.map((m) => {
    return [parseFloat(m[1].trim()), parseFloat(m[2].trim())] as [
      number,
      number
    ];
  });

  return { meta, data, ty };
};

export const plotData = (source: ParseResult): [number[], number[]][] => {
  console.log(source);
  switch (source.ty) {
    // DCD
    case 0:
      return dcdPlotData(source.data);
    // IRM
    case 1:
      return irmPlotData(source.data);
    // Hyst
    case 2:
      return hystPlotData(source.data);
  }
};

const dcdPlotData = (data: [number, number][]): [number[], number[]][] => {
  let n1: [number[], number[]] = [[], []];
  let n2: [number[], number[]] = [[], []];

  data.slice(1).forEach(([x, y]) => {
    if (Math.abs(x) < 1) {
      n1[0].push(x);
      n1[1].push(y);
    } else {
      n2[0].push(x);
      n2[1].push(y);
    }
  });

  return [n1, n2];
};

const irmPlotData = (data: [number, number][]): [number[], number[]][] => {
  let n1: [number[], number[]] = [[], []];
  let n2: [number[], number[]] = [[], []];

  data.forEach(([x, y]) => {
    if (Math.abs(x) < 1) {
      n1[0].push(x);
      n1[1].push(y);
    } else {
      n2[0].push(x);
      n2[1].push(y);
    }
  });

  return [n1, n2];
};

const hystPlotData = (data: [number, number][]): [number[], number[]][] => [
  [data.map((v) => v[0]), data.map((v) => v[1])],
];
