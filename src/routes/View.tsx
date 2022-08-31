import {
  Component,
  createSignal,
  Show,
  onMount,
  Match,
  Switch,
  batch,
  Setter,
  onCleanup,
} from "solid-js";
import { createStore, produce } from "solid-js/store";
import type { ParseResult } from "../lib/parse";
import { parseFile } from "../lib/parseFile";
import {
  normalize,
  normValues,
  convertUnits,
  resetFormatting,
} from "../lib/format";
import ExportOverlay from "./ViewComponents/ExportOverlay";
import ConvertOverlay from "./ViewComponents/ConvertOverlay";
import MetaOverlay from "./ViewComponents/MetaOverlay";
import SideBar from "./ViewComponents/SideBar";
import NormalizeOverlay from "./ViewComponents/NormalizeOverlay";
import LinemodeOverlay, { LineMode } from "./ViewComponents/LinemodeOverlay";
import type { HistoryItem } from "../lib/history";
import Plot from "./ViewComponents/Plot";
import Overlay from "./ViewComponents/Overlay";

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

const PreView: Component<{ setRoute: Setter<string> }> = (props) => {
  const [fileData, setFileData] = createSignal<[ParseResult, string] | null>(
    null
  );

  onMount(() => {
    const cfile = localStorage.getItem("cfile");
    if (cfile === null) {
      setFileData([null, "Unable to open the file"]);
    } else {
      const hsitem: HistoryItem = JSON.parse(cfile);
      setFileData(parseFile(hsitem.name, hsitem.rawdata, hsitem.ty));
    }
  });

  return (
    <Show when={fileData() !== null} fallback={<p>Loading...</p>}>
      <Switch>
        <Match when={fileData()[1] === null}>
          <View fileData={fileData()[0]} setRoute={props.setRoute} />
        </Match>
        <Match when={fileData()[1] !== null}>
          <p>Error: {fileData()[1]}</p>
          <button
            onclick={() => props.setRoute("open")}
            class="p-1 border-1 bg-green-100 hover:bg-green-200 hover:shadow-md"
          >
            return home
          </button>
        </Match>
      </Switch>
    </Show>
  );
};

type ShowOver = "" | "meta" | "convert" | "export" | "normalize" | "linemode";

const View: Component<{
  fileData: ParseResult;
  setRoute: Setter<string>;
}> = (props) => {
  const [showOver, setShowOver] = createSignal("" as ShowOver);
  const [showTCurve, setShowTCurve] = createSignal(true);
  const [fileData, fileDataSetter] = createStore(props.fileData);
  const setFileData = (fn: (s: ParseResult) => ParseResult) => {
    fileDataSetter(
      produce((s) => {
        s = fn(s);
      })
    );
  };
  const [lineMode, setLineMode] = createStore({
    lines: true,
    markers: true,
  } as LineMode);

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

    window.addEventListener("resize", resize);
  });

  onCleanup(() => {
    window.removeEventListener("resize", resize);
  });

  // createEffect(() => {
  //   console.log(JSON.parse(JSON.stringify(fileData)));
  // });

  const TopButtonOverlay: Component<{
    label: string;
    option: ShowOver;
  }> = (props) => (
    <TopButton
      label={props.label}
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
          onclick={() => props.setRoute("open")}
        />
        <TopButtonOverlay label="Show metad" option="meta" />
        <TopButtonOverlay label="Convert" option="convert" />
        <Show when={fileData.data[0][0].length > 2}>
          <TopButton
            label={showTCurve() ? "Hide totalM" : "Show totalM"}
            onclick={() => setShowTCurve((v) => !v)}
          />
        </Show>
        <TopButtonOverlay label="Normalize" option="normalize" />
        <TopButtonOverlay label="Line mode" option="linemode" />
        <TopButtonOverlay label="Export csv" option="export" />
        <TopButton
          label="Reset"
          onclick={() => setFileData((s) => resetFormatting(s))}
        />
      </div>
      {/* over */}
      <Overlay
        close={() => {
          setShowOver("");
        }}
      >
        <Switch>
          <Match when={showOver() == "meta"}>
            <MetaOverlay fileData={fileData} />
          </Match>
          <Match when={showOver() == "convert"}>
            <ConvertOverlay
              units={fileData.units}
              convert={(units) => {
                batch(() => {
                  setFileData((s) => normalize(s, null, null));
                  setFileData((s) => convertUnits(s, units));
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
              initial={normValues(fileData)}
              normalize={(mass, volume) => {
                console.log(mass, volume);
                batch(() => {
                  setFileData((s) => normalize(s, mass, volume));
                  setShowOver((_) => "");
                });
              }}
            />
          </Match>
          <Match when={showOver() == "linemode"}>
            <LinemodeOverlay mode={lineMode} setter={setLineMode} />
          </Match>
        </Switch>
      </Overlay>
      {/* otherdata */}
      <div ref={mainBoxRef} class="px-1 pb-1 w-full flex flex-row">
        <SideBar fileData={fileData} />
        <Plot
          fileData={fileData}
          lineMode={lineMode}
          showTCurve={showTCurve()}
        />
      </div>
    </div>
  );
};

export default PreView;
