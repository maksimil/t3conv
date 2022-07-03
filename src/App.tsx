import { Component, createSignal, Switch, Match } from "solid-js";
import { ParseResult } from "./lib/parse";
import Open from "./routes/Open";
import View from "./routes/View";

export type Route =
  | {
      route: "open";
    }
  | {
      route: "view";
      data: () => Promise<ParseResult>;
    };

const INITIAL_ROUTE = { route: "open" } as Route;

const App: Component = () => {
  const [route, setRoute] = createSignal(INITIAL_ROUTE);
  return (
    <Switch fallback={<p></p>}>
      <Match when={route().route == "open"}>
        <Open setRoute={setRoute} />
      </Match>
      <Match when={route().route == "view"}>
        <View setRoute={setRoute} data={route().data} />
      </Match>
    </Switch>
  );
};

export default App;
