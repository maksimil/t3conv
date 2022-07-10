import {
  Component,
  createSignal,
  createResource,
  Setter,
  Show,
  For,
  onMount,
  createMemo,
  createEffect,
  Match,
  Switch,
} from "solid-js";
import { Route } from "../App";
import { fields, ParseResult, plotData } from "../lib/parse";

const TopButton: Component<{ label: string; onclick: () => void }> = (
  props
) => (
  <button
    class="px-2 pt-1 border-1 hover:bg-green-100 hover:shadow-md"
    onclick={props.onclick}
  >
    {props.label}
  </button>
);

const PreView: Component<{
  setRoute: Setter<Route>;
  data: () => Promise<ParseResult>;
}> = (props) => {
  const [fileData] = createResource(props.data);
  const [plotly] = createResource(async () => import("plotly.js-dist"));

  return (
    <Show
      when={!fileData.loading && !plotly.loading}
      fallback={<p>Loading...</p>}
    >
      <View setRoute={props.setRoute} fileData={fileData()} plotly={plotly()} />
    </Show>
  );
};

type ShowOver = "" | "meta";

const View: Component<{
  setRoute: Setter<Route>;
  fileData: ParseResult;
  plotly: any;
}> = (props) => {
  const [showOver, setShowOver] = createSignal("" as ShowOver);
  const [showTCurve, setShowTCurve] = createSignal(true);
  const [fileData, setFileData] = createSignal(props.fileData);

  const Plotly = props.plotly;

  const plotDataMemo = createMemo(() =>
    plotData(fileData()).map(([x, y]) => ({
      x,
      y,
      type: "scatter",
      line: { width: 1 },
      hovertemplate: "%{x:.2f}; %{y:.2f}<extra></extra>",
    }))
  );

  const plotLayout = () => ({
    margin: {
      l: 100,
      r: 80,
      b: 100,
      t: 40,
    },
    showlegend: false,
    xaxis: {
      title: `Field(${fileData().units[0]})`,
      exponentformat: "e",
      linecolor: "black",
      mirror: true,
      linewidth: 1,
    },
    yaxis: {
      title: `Moment(${fileData().units[1]})`,
      exponentformat: "e",
      linecolor: "black",
      mirror: true,
      linewidth: 1,
    },
  });

  const getPlotData = () => {
    if (showTCurve()) {
      return plotDataMemo();
    } else {
      return [plotDataMemo()[0]];
    }
  };

  let screenRef: HTMLDivElement,
    topBarRef: HTMLDivElement,
    mainBoxRef: HTMLDivElement;

  const resize = () => {
    const wh = screenRef.clientHeight;
    const bh = topBarRef.clientHeight;
    mainBoxRef.style.height = `${wh - bh}px`;
  };

  onMount(() => {
    resize();

    const plot = document.getElementById("plot");

    Plotly.newPlot("plot", getPlotData(), plotLayout());

    /* plot.on("plotly_hover", (d) => {
     *   console.log(d.points[0].pointIndex);
     * });
     * plot.on("plotly_unhover", (d) => {
     *   console.log(d);
     * }); */
  });

  createEffect(() => {
    Plotly.react("plot", getPlotData(), plotLayout());
  });

  window.addEventListener("resize", () => {
    resize();
  });

  return (
    <div ref={screenRef} class="w-full h-full">
      {/* top bar */}
      <div ref={topBarRef} class="flex flex-row px-1 pb-1 space-x-1">
        <TopButton
          label="Open Another file"
          onclick={() => props.setRoute({ route: "open" })}
        />
        <TopButton
          label={showOver() == "meta" ? "Hide metadata" : "Show metadata"}
          onclick={() => setShowOver((v) => (v == "meta" ? "" : "meta"))}
        />
        <Show when={fileData().ty == 0 || fileData().ty == 1}>
          <TopButton
            label={showTCurve() ? "Hide totalM" : "Show totalM"}
            onclick={() => setShowTCurve((v) => !v)}
          />
        </Show>
      </div>
      {/* over */}
      <Switch>
        <Match when={showOver() == "meta"}>
          <div class="w-full flex flex-row z-5 absolute">
            <table class="flex-1 m-2 bg-white shadow-md">
              <For each={fields}>
                {(fd) => (
                  <tr>
                    <td class="border-solid border-1 border-gray-500 px-1 pt-1 bg-green-100">
                      {fd}
                    </td>
                    <td class="border-solid border-1 border-gray-500 px-1 pt-1">
                      {fileData().meta[fd]}
                    </td>
                  </tr>
                )}
              </For>
            </table>
          </div>
        </Match>
      </Switch>
      {/* otherdata */}
      <div ref={mainBoxRef} class="px-1 pb-1 w-full flex flex-row">
        <div class="overflow-y-scroll flex-none border-1 border-gray-400">
          <table class="divide-y divide-gray-400">
            <For each={fileData().data}>
              {(row) => (
                <tr class="divide-x divide-gray-400">
                  <For each={row}>
                    {(x, i) => (
                      <Switch>
                        <Match when={x != null}>
                          <td class="pt-1 px-1 text-right">
                            {x.toFixed([1, 5, 5][i()])}
                          </td>
                        </Match>
                        <Match when={x == null}>
                          <td class="bg-red-100 pt-1 px-1 text-right">-</td>
                        </Match>
                      </Switch>
                    )}
                  </For>
                </tr>
              )}
            </For>
          </table>
        </div>
        <div id="plot" class="flex-1"></div>
      </div>
    </div>
  );
};

export default PreView;
