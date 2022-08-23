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
  onCleanup,
} from "solid-js";
import { Route } from "../routes";
import { FileType, FILE_TYPES } from "../lib/parse";
import { parseFile } from "../lib/parseFile";
import { addHistory, getHistory, HistoryItem } from "../lib/history";

const OpenFile: Component<{ item: HistoryItem; onclick: () => void }> = (
  props
) => {
  return (
    <button
      class={
        "w-full text-md text-left p-2 pr-5 " +
        "shadow-md hover:shadow-lg rounded-xl " +
        "flex flex-row bg-green-50 hover:bg-green-100 "
      }
      onclick={props.onclick}
    >
      <div class="flex-1">{props.item.name}</div>
      <div>{props.item.ty}</div>
    </button>
  );
};

const TypeSetter: Component<{ tySignal: Signal<FileType | null> }> = (
  props
) => {
  const [open, setOpen] = createSignal(false);
  const [ty, setTy] = props.tySignal;

  let mainRef: HTMLDivElement, openRef: HTMLDivElement;

  const onWindowResize = () => {
    openRef.style.width = `${mainRef.clientWidth}px`;
  };

  onMount(() => {
    window.addEventListener("resize", onWindowResize);
  });

  onCleanup(() => {
    window.removeEventListener("resize", onWindowResize);
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
              <For each={FILE_TYPES}>
                {(e, idx) => (
                  <button
                    class={
                      "text-xl text-center w-full hover:bg-gray-200 p-2 " +
                      (idx() === 0 ? "rounded-t-3xl " : "") +
                      (idx() === FILE_TYPES.length - 1 ? "rounded-b-3xl " : "")
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

const FILE_TYPE_STORE = "previous_fty";

const getPreviousTy = (): FileType | null =>
  localStorage.getItem(FILE_TYPE_STORE) as FileType | null;

const setPreviousTy = (previous: FileType) => {
  localStorage.setItem(FILE_TYPE_STORE, previous);
};

const Open: Component<{ setRoute: Setter<Route> }> = (props) => {
  const [ty, setTy] = createSignal(getPreviousTy());

  createEffect(() => {
    setPreviousTy(ty());
  });

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
          const name = file.name;
          const data = parseFile(name, rawdata, ty);

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
        return parseFile(item.name, item.rawdata, item.ty);
      },
    });
  };

  return (
    <div class="w-full h-full flex items-center justify-center bg-gray-100">
      <div
        class={
          "w-3/5 h-3/5 bg-gray-50 rounded-3xl shadow-lg p-4 pb-2 " +
          "space-y-4 flex flex-col"
        }
      >
        <div class="flex flex-row">
          <TypeSetter tySignal={[ty, setTy]} />
          <div class="flex-1 flex flex-row">
            <button
              class={
                "flex-1 text-xl text-center p-2 mx-2 " +
                "shadow-md rounded-3xl " +
                (ty() !== null
                  ? "bg-green-50 hover:bg-green-100 hover:shadow-lg "
                  : "bg-gray-100 cursor-default ")
              }
              disabled={!ty()}
              onclick={() => openNewFile(ty())}
            >
              Open file
            </button>
          </div>
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
