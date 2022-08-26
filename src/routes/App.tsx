import { Component, createSignal, Switch, Match, onMount } from "solid-js";
import Open from "./Open";
import View from "./View";
import { loadPlotly } from "./ViewComponents/Plot";

const App: Component<{}> = () => {
  const [route, setRoute] = createSignal("open");

  onMount(() => {
    loadPlotly();
  });

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
