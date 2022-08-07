import {
  Component,
  createSignal,
  For,
  Setter,
  Signal,
  Switch,
  Match,
  onMount,
  createEffect,
  batch,
} from "solid-js";
import { Route } from "../App";
import { FileType, parseFile, TY_NAMES } from "../lib/parse";
import { addHistory, getHistory, HistoryItem } from "../lib/history";

const TY_STYLES = [
  "bg-red-50 hover:bg-red-100 ",
  "bg-orange-50 hover:bg-orange-100 ",
  "bg-blue-50 hover:bg-blue-100 ",
];

const OpenFile: Component<{ item: HistoryItem; onclick: () => void }> = (
  props
) => {
  return (
    <button
      class={
        "w-full text-md text-left p-2 pr-5 " +
        "shadow-md hover:shadow-lg rounded-xl " +
        TY_STYLES[props.item.ty] +
        "flex flex-row"
      }
      onclick={props.onclick}
    >
      <div class="flex-1">{props.item.name}</div>
      <div>{TY_NAMES[props.item.ty]}</div>
    </button>
  );
};

const FILETYPES: FileType[] = [0, 1, 2];

const TypeSetter: Component<{ tySignal: Signal<FileType | null> }> = (
  props
) => {
  const [open, setOpen] = createSignal(false);
  const [ty, setTy] = props.tySignal;

  let mainRef: HTMLDivElement, openRef: HTMLDivElement;

  onMount(() => {
    window.addEventListener("resize", () => {
      openRef.style.width = `${mainRef.clientWidth}px`;
    });
  });

  createEffect(() => {
    if (open()) {
      openRef.style.width = `${mainRef.clientWidth}px`;
    }
  });

  return (
    <div ref={mainRef} class="flex-1 flex flex-row">
      <Switch>
        <Match when={open()}>
          <div ref={openRef} class="absolute">
            <div
              class={
                "shadow-md rounded-3xl mx-2 bg-gray-100 " +
                "divide-y divide-gray-200 "
              }
            >
              <For each={FILETYPES}>
                {(e, idx) => (
                  <button
                    class={
                      "text-xl text-center w-full hover:bg-gray-200 p-2 " +
                      (idx() === 0 ? "rounded-t-3xl " : "") +
                      (idx() === FILETYPES.length - 1 ? "rounded-b-3xl " : "")
                    }
                    onclick={() =>
                      batch(() => {
                        setOpen(false);
                        setTy(e);
                      })
                    }
                  >
                    {e}
                  </button>
                )}
              </For>
            </div>
          </div>
        </Match>
        <Match when={!open()}>
          <button
            class={
              "flex-1 text-xl text-center p-2 mx-2 " +
              "shadow-md rounded-3xl " +
              "bg-gray-100 hover:bg-gray-200 "
            }
            onclick={() =>
              batch(() => {
                setOpen(true);
                setTy(null);
              })
            }
          >
            {ty() !== null ? ty() : "Select file type"}
          </button>
        </Match>
      </Switch>
    </div>
  );
};

const Open: Component<{ setRoute: Setter<Route> }> = (props) => {
  const [ty, setTy] = createSignal(null as FileType | null);

  const openNewFile = (ty: FileType) => {
    const fileSelector = document.createElement("input");
    fileSelector.setAttribute("type", "file");
    fileSelector.click();
    fileSelector.onchange = (_) => {
      props.setRoute({
        route: "view",
        data: async () => {
          const file = fileSelector.files[0];

          const rawdata = await file.text();
          const data = parseFile(rawdata, ty);
          const name = file.name;

          addHistory({ rawdata, name, ty });
          return data;
        },
      });
    };
  };

  const openOldFile = (item: HistoryItem) => {
    props.setRoute({
      route: "view",
      data: async () => {
        addHistory(item);
        return parseFile(item.rawdata, item.ty);
      },
    });
  };

  return (
    <div class="w-full h-full flex items-center justify-center bg-gray-100">
      <div
        class={
          "w-3/5 h-3/5 bg-gray-50 rounded-3xl shadow-lg p-4 " +
          "space-y-4 flex flex-col"
        }
      >
        <div class="flex flex-row">
          <div class="flex-1 flex flex-row">
            <button
              class={
                "flex-1 text-xl text-center p-2 mx-2 " +
                "shadow-md rounded-3xl " +
                (ty() !== null
                  ? "bg-green-50 hover:bg-green-100 hover:shadow-lg "
                  : "bg-gray-100 ")
              }
            >
              Open file
            </button>
          </div>
          <TypeSetter tySignal={[ty, setTy]} />
          {/* <select
              class={
              "flex-1 text-xl text-center p-2 mx-2 " +
              "shadow-md rounded-3xl " +
              (ty() !== null
              ? "bg-green-50 hover:bg-green-100 hover:shadow-lg "
              : "bg-gray-100 ")
              }
              >
              <option class={"shadow-md rounded-3xl bg-green-50"} value="">
              amgus
              </option>
              </select> */}
        </div>
        <div class="flex-1 overflow-x-hidden overflow-y-auto space-y-2">
          <For each={getHistory().reverse()}>
            {(item) => (
              <OpenFile item={item} onclick={() => openOldFile(item)} />
            )}
          </For>
        </div>
      </div>
    </div>
  );
};

export default Open;
