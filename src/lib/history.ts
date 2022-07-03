import { ParseResult } from "./parse";

export type HistoryItem = {
  name: string;
  data: ParseResult;
};

const HS_KEY = "history";
const HS_LENGTH = 10;

export const getHistory = (): HistoryItem[] => {
  const hsdata = localStorage.getItem(HS_KEY);
  if (hsdata != null) {
    return JSON.parse(hsdata);
  } else {
    localStorage.setItem(HS_KEY, "[]");
    return [];
  }
};

export const addHistory = (item: HistoryItem) => {
  let hs = getHistory().filter((v) => v.name != item.name);
  hs.push(item);
  while (hs.length > HS_LENGTH) {
    hs.shift();
  }
  localStorage.setItem(HS_KEY, JSON.stringify(hs));
};
