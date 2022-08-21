import { parseLS } from "./parse/LS";
import { parsePrinceton } from "./parse/Princeton";

import { FileType, ParseResult, FileType } from "./parse";

export const parseFile = (
  name: string,
  source: string,
  ty: FileType
): ParseResult | null => {
  switch (ty) {
    case FileType.LS_DCD:
    case FileType.LS_IRM:
    case FileType.LS_HYST:
      return parseLS(name, source, ty);
    case FileType.PRINCETON:
      return parsePrinceton(name, source, ty);
  }
};
