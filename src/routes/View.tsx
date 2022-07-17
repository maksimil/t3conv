import {
  Component,
  createSignal,
  createResource,
  Setter,
  Show,
  onMount,
  createMemo,
  createEffect,
  Match,
  Switch,
  batch,
} from "solid-js";
import { createStore } from "solid-js/store";
import { Route } from "../App";
import {
  ParseResult,
  plotData,
  convertUnits,
  normalize,
  plotLabels,
  norm_values,
} from "../lib/parse";
import Plotly from "plotly.js-dist";
import ExportOverlay from "./ViewComponents/ExportOverlay";
import ConvertOverlay from "./ViewComponents/ConvertOverlay";
import MetaOverlay from "./ViewComponents/MetaOverlay";
import SideBar from "./ViewComponents/SideBar";
import NormalizeOverlay from "./ViewComponents/NormalizeOverlay";
import LinemodeOverlay from "./ViewComponents/LinemodeOverlay";

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

  return (
    <Show when={!fileData.loading} fallback={<p>Loading...</p>}>
      <View setRoute={props.setRoute} fileData={fileData()} />
    </Show>
  );
};

type ShowOver = "" | "meta" | "convert" | "export" | "normalize" | "linemode";

const CONFIG = {
  responsive: true,
  scrollZoom: true,
};

export type LineMode = { lines: boolean; markers: boolean };

const View: Component<{
  setRoute: Setter<Route>;
  fileData: ParseResult;
}> = (props) => {
  const [showOver, setShowOver] = createSignal("" as ShowOver);
  const [showTCurve, setShowTCurve] = createSignal(true);
  const [fileData, setFileData] = createStore(props.fileData);
  const [lineMode, setLineMode] = createStore({
    lines: true,
    markers: true,
  } as LineMode);

  const plotDataMemo = createMemo(() => {
    let mode = Object.keys(lineMode)
      .filter((v) => lineMode[v])
      .join("+");
    if (mode === "") {
      mode = "lines";
    }
    return plotData(fileData).map(([x, y]) => ({
      x,
      y,
      mode,
      line: { width: 1 },
      hovertemplate: "%{x:.2f}; %{y:.2f}<extra></extra>",
    }));
  });

  const plotLayout = () => {
    const [xtitle, ytitle] = plotLabels(fileData);

    return {
      margin: {
        l: 100,
        r: 80,
        b: 100,
        t: 40,
      },
      showlegend: false,
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

    Plotly.newPlot("plot", getPlotData(), plotLayout(), CONFIG);
  });

  createEffect(() => {
    Plotly.react("plot", getPlotData(), plotLayout(), CONFIG);
    Plotly.Plots.resize("plot");
  });

  createEffect(() => {
    console.log(JSON.parse(JSON.stringify(fileData)));
  });

  window.addEventListener("resize", () => {
    resize();
    Plotly.Plots.resize("plot");
  });

  const TopButtonOverlay: Component<{
    labelHide: string;
    labelShow: string;
    option: ShowOver;
  }> = (props) => (
    <TopButton
      label={showOver() == props.option ? props.labelHide : props.labelShow}
      onclick={() =>
        setShowOver((v) => (v == props.option ? "" : props.option))
      }
    />
  );

  return (
    <div ref={screenRef} class="w-full h-full">
      {/* top bar */}
      <div ref={topBarRef} class="flex flex-row px-1 pb-1 space-x-1">
        <TopButton
          label="Open Another file"
          onclick={() => props.setRoute({ route: "open" })}
        />
        <TopButtonOverlay
          labelHide="Hide metadata"
          labelShow="Show metadata"
          option="meta"
        />
        <TopButtonOverlay
          labelHide="Hide convert"
          labelShow="Convert"
          option="convert"
        />
        <Show when={fileData.ty == 0 || fileData.ty == 1}>
          <TopButton
            label={showTCurve() ? "Hide totalM" : "Show totalM"}
            onclick={() => setShowTCurve((v) => !v)}
          />
        </Show>
        <TopButtonOverlay
          labelHide="Hide normalize"
          labelShow="Normalize"
          option="normalize"
        />
        <TopButtonOverlay
          labelHide="Hide line mode"
          labelShow="Line mode"
          option="linemode"
        />
        <TopButtonOverlay
          labelHide="Hide export"
          labelShow="Export csv"
          option="export"
        />
      </div>
      {/* over */}
      <Switch>
        <Match when={showOver() == "meta"}>
          <MetaOverlay fileData={fileData} />
        </Match>
        <Match when={showOver() == "convert"}>
          <ConvertOverlay
            units={fileData.units}
            convert={(units) => {
              console.log(units);
              batch(() => {
                normalize(fileData, setFileData, null, null);
                convertUnits(fileData, setFileData, units);
                setShowOver((_) => "");
              });
            }}
          />
        </Match>
        <Match when={showOver() == "export"}>
          <ExportOverlay
            fileData={fileData}
            onexport={() => setShowOver((_) => "")}
          />
        </Match>
        <Match when={showOver() == "normalize"}>
          <NormalizeOverlay
            initial={norm_values(fileData)}
            normalize={(mass, volume) => {
              console.log(mass, volume);
              batch(() => {
                normalize(fileData, setFileData, mass, volume);
                setShowOver((_) => "");
              });
            }}
          />
        </Match>
        <Match when={showOver() == "linemode"}>
          <LinemodeOverlay mode={lineMode} setter={setLineMode} />
        </Match>
      </Switch>
      {/* otherdata */}
      <div ref={mainBoxRef} class="px-1 pb-1 w-full flex flex-row">
        <SideBar fileData={fileData} />
        <div id="plot" class="flex-1 h-full" />
      </div>
    </div>
  );
};

export default PreView;
