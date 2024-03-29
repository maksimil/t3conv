import { FileType, FILE_TYPES } from "./parse";

export type HistoryItem = {
  name: string;
  rawdata: string;
  ty: FileType;
};

const HS_KEY = "history";
const HS_LENGTH = 50;

export const getHistory = (): HistoryItem[] => {
  const hsdata = localStorage.getItem(HS_KEY);
  if (hsdata != null) {
    const hs = JSON.parse(hsdata).filter((e: HistoryItem) =>
      FILE_TYPES.includes(e.ty)
    );
    localStorage.setItem(HS_KEY, JSON.stringify(hs));
    return hs;
  } else {
    localStorage.setItem(HS_KEY, "[]");
    return [];
  }
};

export const addHistory = (item: HistoryItem) => {
  let hs = getHistory().filter((v) => v.name !== item.name || v.ty !== item.ty);
  hs.push(item);
  while (hs.length > HS_LENGTH) {
    hs.shift();
  }
  localStorage.setItem(HS_KEY, JSON.stringify(hs));
};
