import {
  Component,
  createSignal,
  createResource,
  Setter,
  Show,
  For,
  onMount,
  createMemo,
} from "solid-js";
import { Route } from "../App";
import { fields, parseFile, ParseResult } from "../lib/parse";
import Plotly from "plotly.js-dist";

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

const PreView: Component<{ setRoute: Setter<Route>; file: File }> = (props) => {
  const [fileData] = createResource(props.file, async (f) =>
    parseFile(await f.text())
  );

  return (
    <Show when={!fileData.loading} fallback={<p>Loading...</p>}>
      <View setRoute={props.setRoute} fileData={fileData()} />
    </Show>
  );
};

const PLOT_LAYOUT = {
  margin: {
    l: 100,
    r: 80,
    b: 100,
    t: 40,
  },
  showlegend: false,
  xaxis: {
    title: "Field(Oe)",
    exponentformat: "e",
    linecolor: "black",
    mirror: true,
    linewidth: 1,
  },
  yaxis: {
    title: "Moment(emu)",
    exponentformat: "e",
    linecolor: "black",
    mirror: true,
    linewidth: 1,
  },
};

const View: Component<{ setRoute: Setter<Route>; fileData: ParseResult }> = (
  props
) => {
  const [showMeta, setShowMeta] = createSignal(false);

  const xymemo = createMemo(() => {
    const x = props.fileData.data.map((v) => v[0]);
    const y = props.fileData.data.map((v) => v[1]);
    return [x, y];
  });

  let screenRef: HTMLDivElement,
    topBarRef: HTMLDivElement,
    mainBoxRef: HTMLDivElement;

  const resize = () => {
    const wh = screenRef.clientHeight;
    const bh = topBarRef.clientHeight;
    mainBoxRef.style.height = `${wh - bh}px`;
  };

  const plotData = () => {
    const [x, y] = xymemo();
    return [
      {
        x,
        y,
        type: "scatter",
        line: { width: 1 },
        hovertemplate: "%{x:.2f}; %{y:.2f}<extra></extra>",
      },
    ];
  };

  onMount(() => {
    resize();

    const plot = document.getElementById("plot");

    Plotly.newPlot("plot", plotData(), PLOT_LAYOUT);

    plot.on("plotly_hover", (d) => {
      console.log(d.points[0].pointIndex);
    });
    plot.on("plotly_unhover", (d) => {
      console.log(d);
    });
  });

  window.addEventListener("resize", () => {
    resize();
    Plotly.react("plot", plotData(), PLOT_LAYOUT);
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
          label={showMeta() ? "Hide metadata" : "Show metadata"}
          onclick={() => setShowMeta((v) => !v)}
        />
      </div>
      {/* metadata  */}
      <Show when={showMeta()}>
        <div class="w-full flex flex-row z-5 absolute">
          <table class="flex-1 m-2 bg-white shadow-md">
            <For each={fields}>
              {(fd) => (
                <tr>
                  <td class="border-solid border-1 border-gray-500 px-1 pt-1 bg-green-100">
                    {fd}
                  </td>
                  <td class="border-solid border-1 border-gray-500 px-1 pt-1">
                    {props.fileData.meta[fd]}
                  </td>
                </tr>
              )}
            </For>
          </table>
        </div>
      </Show>
      {/* otherdata */}
      <div ref={mainBoxRef} class="px-1 pb-1 w-full flex flex-row">
        <div class="overflow-y-scroll flex-none border-1 border-gray-400">
          <table>
            <For each={props.fileData.data}>
              {([x, y], i) => (
                <tr class="border-b-1 border-gray-400">
                  <td class="border-r-1 border-gray-400 pt-1 px-1 text-right">
                    {x.toFixed(1)}
                  </td>
                  <td class="pt-1 px-1 text-right">{y.toFixed(5)}</td>
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
