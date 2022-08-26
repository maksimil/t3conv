import { Component, createSignal, Switch, Match, createEffect } from "solid-js";
import Open from "./Open";
import View from "./View";

const App: Component<{}> = () => {
  const [route, setRoute] = createSignal("open");

  return (
    <Switch>
      <Match when={route() === "open"}>
        <Open setRoute={setRoute} />
      </Match>
      <Match when={route() === "view"}>
        <View setRoute={setRoute} />
      </Match>
    </Switch>
  );
};

export default App;
