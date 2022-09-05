import {
  Component,
  createSignal,
  For,
  Signal,
  Switch,
  Match,
  onMount,
  batch,
  createEffect,
  onCleanup,
  Setter,
} from "solid-js";
import { FileType, FILE_TYPES } from "@lib/parse";
import { addHistory, getHistory, HistoryItem } from "@lib/history";

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
      onclick={() => {
        props.onclick();
        console.log(props.item);
      }}
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
    if (openRef !== null) {
      openRef.style.width = `${mainRef.clientWidth}px`;
    }
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
            onClick={() => {
              batch(() => {
                setOpen(true);
                setTy(null);
              });
            }}
          >
            {!!ty() ? ty() : "Select file type"}
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

const Open: Component<{ setRoute: Setter<string> }> = (props) => {
  const [ty, setTy] = createSignal<FileType | null>(null);
  const [history, setHistory] = createSignal<HistoryItem[]>([]);

  onMount(() => {
    setTy(getPreviousTy());
    setHistory(getHistory());
  });

  createEffect(() => {
    if (ty() !== null) {
      setPreviousTy(ty());
    }
  });

  const openFile = (data: () => Promise<HistoryItem>) => {
    data().then((value) => {
      localStorage.setItem("cfile", JSON.stringify(value));
      props.setRoute("view");
    });
  };

  const openNewFile = (ty: FileType) => {
    const fileSelector = document.createElement("input");
    fileSelector.setAttribute("type", "file");
    fileSelector.click();
    fileSelector.onchange = (_) => {
      openFile(async () => {
        const file = fileSelector.files[0];

        const rawdata = await file.text();
        const name = file.name;
        const item: HistoryItem = { rawdata, name, ty };

        addHistory(item);
        return item;
      });
    };
  };

  const openOldFile = (item: HistoryItem) => {
    openFile(async () => {
      addHistory(item);
      return item;
    });
  };

  return (
    <div class="w-full h-full flex items-center justify-center bg-gray-100">
      <div
        class={
          "w-3/5 h-4/5 bg-gray-50 rounded-3xl shadow-lg p-4 pb-2 " +
          "space-y-4 flex flex-col"
        }
      >
        <div>
          <div class="text-3xl font-mono font-medium text-center">
            Hysteresis.online
          </div>
          <div class="space-x-4 flex flex-row justify-center">
            <a class="text-lg font-mono hover:text-gray-400" href="/docs">
              docs
            </a>
            <a
              class="text-lg font-mono hover:text-gray-400"
              href="https://github.com/maksimil/t3conv"
            >
              github&lt;3
            </a>
          </div>
        </div>
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
          <For each={history().reverse()}>
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
