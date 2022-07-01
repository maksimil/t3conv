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
  "([-\\.0123456789]*) \\t ([-\\.0123456789]*)",
  "gm"
);

type ParseResult = {
  meta: { [key: string]: string };
  data: [number, number][];
};

export const parseFile = (source: string): ParseResult | null => {
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

  const data = datamatch.map(
    (m) => [parseFloat(m[1]), parseFloat(m[2])] as [number, number]
  );

  return { meta, data };
};
