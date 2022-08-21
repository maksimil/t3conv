import { Component, createSignal, Switch, Match } from "solid-js";
import { INITIAL_ROUTE } from "./routes";
import Open from "./routes/Open";
import View from "./routes/View";

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
