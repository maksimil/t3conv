import { parseLS } from "./parse/LS";
import { parsePrinceton } from "./parse/Princeton";
import { convertUnits } from "./format";
import { FileType, ParseResult, XUnits } from "./parse";

export const parseFile = (
  name: string,
  source: string,
  ty: FileType
): [ParseResult, string] => {
  try {
    source = source.replaceAll("\r\n", "\n");
    let res = (() => {
      switch (ty) {
        case FileType.LS_DCD:
        case FileType.LS_IRM:
        case FileType.LS_HYST:
          return parseLS(name, source, ty);
        case FileType.PRINCETON:
          return parsePrinceton(name, source, ty);
      }
    })();

    // post-processing
    if (res.units[0] == XUnits.T) {
      res = convertUnits(res, [XUnits.mT, res.initUnits[1]]);
      res.initUnits[0] = XUnits.mT;
    }

    return [res, null];
  } catch (err) {
    return [null, err.message];
  }
};
