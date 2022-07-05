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

  const dataRead = datamatch.map((m) => {
    return [parseFloat(m[1].trim()), parseFloat(m[2].trim())] as [
      number,
      number
    ];
  });

  const data = (() => {
    switch (ty) {
      // DCD
      case 0:
        return cleanDCD(dataRead);
      case 1:
        return cleanIRM(dataRead);
      case 2:
        return dataRead;
    }
  })();

  return { meta, data, ty };
};

const isz = (x: number) => Math.abs(x) < 1;

const cleanData = (
  read: [number, number][],
  init: number,
  push: (v: [number, number]) => void
) => {
  let i = init;
  let prev = true;

  while (i < read.length) {
    if (prev) {
      if (isz(read[i][0])) {
        push(read[i]);
        prev = false;
      } else {
        push([null, null]);
        push(read[i]);
      }
    } else {
      if (!isz(read[i][0])) {
        push(read[i]);
        prev = true;
      }
    }

    i += 1;
  }
};

export const cleanDCD = (read: [number, number][]): [number, number][] => {
  let res = [];

  let i = 0;
  if (!isz(read[i][0])) {
    res.push(read[i]);
    i += 1;
  } else {
    res.push([null, null]);
  }

  cleanData(read, i, (v) => res.push(v));

  return res;
};

export const cleanIRM = (read: [number, number][]): [number, number][] => {
  let res = [];

  cleanData(read, 0, (v) => res.push(v));

  return res;
};

export const plotData = (source: ParseResult): [number[], number[]][] => {
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
