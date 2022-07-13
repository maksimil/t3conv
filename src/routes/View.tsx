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
  batch,
} from "solid-js";
import { createStore } from "solid-js/store";
import { Route } from "../App";
import {
  fields,
  ParseResult,
  XUnits,
  YUnits,
  plotData,
  convertUnits,
  TY_NAMES,
  dataLabels,
} from "../lib/parse";
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

const ConvertOverlay: Component<{
  units: [XUnits, YUnits];
  convert: (u: [XUnits, YUnits]) => void;
}> = (props) => {
  const [xUnit, setXUnit] = createSignal(props.units[0] as XUnits);
  const [yUnit, setYUnit] = createSignal(props.units[1] as YUnits);

  return (
    <div class="w-full flex flex-row z-5 absolute">
      <table class="m-2 bg-white shadow-md">
        <tbody>
          <tr>
            <td class="border-solid border-1 border-gray-500 px-1 pt-1 bg-green-100 w-30">
              Field
            </td>
            <td class="border-solid border-1 border-gray-500 w-20">
              <select
                value={xUnit()}
                class="w-full h-full bg-white cursor-pointer"
                onchange={(e) => {
                  setXUnit(
                    (_) => (e.target as HTMLSelectElement).value as XUnits
                  );
                }}
              >
                <option value="Oe">Oe</option>
                <option value="A/m">A/m</option>
                <option value="T">T</option>
              </select>
            </td>
          </tr>
          <tr>
            <td class="border-solid border-1 border-gray-500 px-1 pt-1 bg-green-100 w-30">
              Momentum
            </td>
            <td class="border-solid border-1 border-gray-500 w-20">
              <select
                value={yUnit()}
                class="w-full h-full bg-white cursor-pointer"
                onchange={(e) => {
                  setYUnit(
                    (_) => (e.target as HTMLSelectElement).value as YUnits
                  );
                }}
              >
                <option value="emu">emu</option>
                <option value="Am2">Am2</option>
              </select>
            </td>
          </tr>
          <tr>
            <td
              class={
                "border-solid border-1 border-gray-500 px-1 pt-1 " +
                "bg-green-100 hover:bg-green-200 cursor-pointer "
              }
              colspan="2"
              onclick={() => {
                props.convert([xUnit(), yUnit()]);
              }}
            >
              Convert
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

const ExportOverlay: Component<{
  fileData: ParseResult;
  onexport: () => void;
}> = (props) => {
  const [fileName, setFileName] = createSignal(
    props.fileData.meta["Sample ID"] +
      "-" +
      TY_NAMES[props.fileData.ty] +
      ".csv"
  );
  return (
    <div class="w-full flex flex-row z-5 absolute">
      <table class="m-2 bg-white shadow-md">
        <tbody>
          <tr>
            <td class="border-solid border-1 border-gray-500 px-1 pt-1 bg-green-100 w-25">
              Filename
            </td>
            <td class="border-solid border-1 border-gray-500 pl-1 w-75">
              <input
                class="w-full focus:outline-none"
                type="text"
                value={fileName()}
                onInput={(e) => {
                  setFileName(e.currentTarget.value);
                }}
              />
            </td>
          </tr>
          <tr>
            <td
              class={
                "border-solid border-1 border-gray-500 px-1 pt-1 " +
                "bg-green-100 hover:bg-green-200 cursor-pointer"
              }
              colspan="2"
              onclick={() => {
                let text = dataLabels(props.fileData).join(";");

                props.fileData.data.forEach((row) => {
                  text +=
                    "\n" + row.map((c) => (c === null ? "" : c)).join(";");
                });

                const el = document.createElement("a");
                el.setAttribute(
                  "href",
                  "data:text/plain;charset=utf-8," + encodeURIComponent(text)
                );
                el.setAttribute("download", fileName());
                el.click();

                props.onexport();
              }}
            >
              Export
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

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

type ShowOver = "" | "meta" | "convert" | "export";

const CONFIG = {
  responsive: true,
  scrollZoom: true,
};

const View: Component<{
  setRoute: Setter<Route>;
  fileData: ParseResult;
}> = (props) => {
  const [showOver, setShowOver] = createSignal("" as ShowOver);
  const [showTCurve, setShowTCurve] = createSignal(true);
  const [fileData, setFileData] = createStore(props.fileData);

  const plotDataMemo = createMemo(() =>
    plotData(fileData).map(([x, y]) => ({
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
      title: `Field(${fileData.units[0]})`,
      exponentformat: "e",
      linecolor: "black",
      mirror: true,
      linewidth: 1,
    },
    yaxis: {
      title: `Moment(${fileData.units[1]})`,
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
    mainBoxRef: HTMLDivElement,
    sideBarRef: HTMLDivElement;

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
          labelHide="Hide export"
          labelShow="Export csv"
          option="export"
        />
      </div>
      {/* over */}
      <Switch>
        <Match when={showOver() == "meta"}>
          <div class="w-full flex flex-row z-5 absolute">
            <table class="m-2 bg-white shadow-md">
              <For each={fields}>
                {(fd) => (
                  <tr>
                    <td class="border-solid border-1 border-gray-500 px-1 pt-1 bg-green-100 w-50">
                      {fd}
                    </td>
                    <td class="border-solid border-1 border-gray-500 px-1 pt-1">
                      {fileData.meta[fd]}
                    </td>
                  </tr>
                )}
              </For>
            </table>
          </div>
        </Match>
        <Match when={showOver() == "convert"}>
          <ConvertOverlay
            units={fileData.units}
            convert={(units) => {
              console.log(units);
              batch(() => {
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
      </Switch>
      {/* otherdata */}
      <div ref={mainBoxRef} class="px-1 pb-1 w-full flex flex-row">
        <div
          ref={sideBarRef}
          class="overflow-y-scroll flex-none border-1 border-gray-400"
        >
          <table class="border-separate" style="border-spacing:0;">
            <thead class="sticky top-0 z-2 bg-green-100">
              <tr class="divide-x divide-gray-400">
                <For each={dataLabels(fileData)}>
                  {(lbl) => (
                    <th
                      class={
                        "pt-1 px-1 text-left font-normal " +
                        "sticky top-0 z-2 border-b-1 border-gray-400 "
                      }
                    >
                      {lbl}
                    </th>
                  )}
                </For>
              </tr>
            </thead>
            <tbody>
              <For each={fileData.data}>
                {(row, rowi) => (
                  <tr class="divide-x divide-gray-400 ">
                    <For each={row}>
                      {(x, i) => (
                        <Switch>
                          <Match when={x != null}>
                            <td
                              class={
                                "pt-1 px-1 text-right " +
                                (rowi() > 0
                                  ? "border-t-1 border-gray-400 "
                                  : "")
                              }
                            >
                              {x.toFixed([1, 5, 5][i()])}
                            </td>
                          </Match>
                          <Match when={x == null}>
                            <td
                              class={
                                "bg-red-100 pt-1 px-1 text-right " +
                                (rowi() > 0
                                  ? "border-t-1 border-gray-400 "
                                  : "")
                              }
                            >
                              -
                            </td>
                          </Match>
                        </Switch>
                      )}
                    </For>
                  </tr>
                )}
              </For>
            </tbody>
          </table>
        </div>
        <div id="plot" class="flex-1 h-full" />
      </div>
    </div>
  );
};

export default PreView;
