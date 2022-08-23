import { ParseResult } from "./lib/parse";

export type Route =
  | {
      route: "open";
    }
  | {
      route: "view";
      data: () => Promise<[ParseResult, string]>;
    };

export const INITIAL_ROUTE = { route: "open" } as Route;
