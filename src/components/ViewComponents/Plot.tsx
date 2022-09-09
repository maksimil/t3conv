import {
  Component,
  onMount,
  createMemo,
  createEffect,
  Show,
  createSignal,
  onCleanup,
} from "solid-js";
import type { ParseResult, PlotData } from "@lib/parse";
import { plotLabels } from "@lib/plot";
import type { LineMode } from "./LinemodeOverlay";

const CONFIG = {
  responsive: true,
  scrollZoom: true,
};

const PLOT_COLORS = ["rgb(31, 119, 180)", "rgb(255, 127, 14)"];

const [plotlyLib, setPlotlyLib] = createSignal<any>(null);
export const loadPlotly = () => {
  if (plotlyLib() === null) {
    import("plotly.js-dist-min").then((value) => {
      setPlotlyLib(value);
    });
  }
};

const PlotWrapper: Component<{
  fileData: ParseResult;
  lineMode: LineMode;
  showTCurve: boolean;
}> = (props) => {
  return (
    <Show
      when={plotlyLib() !== null}
      fallback={
        <div id="plot" class="flex-1 h-full">
          Loading...
        </div>
      }
    >
      <Plot
        fileData={props.fileData}
        lineMode={props.lineMode}
        showTCurve={props.showTCurve}
        Plotly={plotlyLib()}
      />
    </Show>
  );
};

const Plot: Component<{
  fileData: ParseResult;
  lineMode: LineMode;
  showTCurve: boolean;
  Plotly: any;
}> = (props) => {
  const Plotly = props.Plotly;
  const plotDataMemo = createMemo(() => props.fileData.getPlotData());

  const lineModeS = () => {
    let mode = Object.keys(props.lineMode)
      .filter((v) => props.lineMode[v as keyof LineMode])
      .join("+");
    if (mode === "") {
      mode = "lines";
    }
    return mode;
  };

  const convertPlotly = ({ x, y, name, color }: PlotData) => ({
    x,
    y,
    mode: lineModeS(),
    name,
    line: { width: 1, color: PLOT_COLORS[color] },
    hovertemplate: "%{x:.2f}; %{y:.2f}<extra></extra>",
    showlegend: name !== "",
  });

  const getPlotData = () => {
    if (props.showTCurve) {
      return plotDataMemo().map(convertPlotly);
    } else {
      return plotDataMemo()
        .filter(({ color }) => color !== 1)
        .map(convertPlotly);
    }
  };

  const plotLayout = () => {
    const [xtitle, ytitle] = plotLabels(props.fileData);

    return {
      title: { text: props.fileData.name, font: { color: "#000" } },
      margin: {
        l: 100,
        r: 80,
        b: 100,
        t: 40,
      },
      showlegend: true,
      legend: {
        x: 0,
        y: 1,
        font: {
          color: "#000",
        },
      },
      xaxis: {
        title: xtitle,
        exponentformat: "e",
        linecolor: "black",
        mirror: true,
        linewidth: 1,
      },
      yaxis: {
        title: ytitle,
        exponentformat: "e",
        linecolor: "black",
        mirror: true,
        linewidth: 1,
      },
    };
  };

  const resize = () => {
    Plotly.Plots.resize("plot");
  };

  onMount(() => {
    Plotly.newPlot("plot", getPlotData(), plotLayout(), CONFIG);

    window.addEventListener("resize", resize);
  });

  onCleanup(() => {
    window.removeEventListener("resize", resize);
    Plotly.purge("plot");
  });

  createEffect(() => {
    Plotly.react("plot", getPlotData(), plotLayout(), CONFIG);
    Plotly.Plots.resize("plot");
  });

  return <div id="plot" class="flex-1 h-full" />;
};

export default PlotWrapper;
