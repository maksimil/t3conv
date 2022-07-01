import { Component, createSignal, Switch, Match } from "solid-js";
import Open from "./routes/Open";
import View from "./routes/View";

export type Route =
  | {
      route: "open";
    }
  | {
      route: "view";
      file: File;
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
        <View setRoute={setRoute} file={route().file} />
      </Match>
    </Switch>
  );
};

export default App;
