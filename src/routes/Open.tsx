import { Component, createSignal, For, Setter, Switch, Match } from "solid-js";
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

const Open: Component<{ setRoute: Setter<Route> }> = (props) => {
  const [fileType, setFileType] = createSignal(
    undefined as FileType | undefined
  );

  return (
    <div class="w-full h-full flex items-center justify-center bg-gray-100">
      <div
        class={
          "w-3/5 h-3/5 bg-gray-50 rounded-3xl shadow-lg p-4 " +
          "space-y-4 flex flex-col"
        }
      >
        <div class="flex flex-row">
          <button
            class={
              "flex-1 text-xl text-center p-2 mx-2 " +
              "shadow-md rounded-3xl " +
              (fileType() !== undefined
                ? "bg-green-50 hover:bg-green-100 hover:shadow-lg "
                : "bg-gray-100 ")
            }
            disabled={fileType() === undefined}
            onclick={() => {
              const fileSelector = document.createElement("input");
              fileSelector.setAttribute("type", "file");
              fileSelector.click();
              fileSelector.onchange = (_) => {
                props.setRoute({
                  route: "view",
                  data: async () => {
                    const file = fileSelector.files[0];

                    const data = parseFile(await file.text(), fileType());
                    const name = file.name;
                    const ty = fileType();

                    addHistory({ data, name, ty });
                    return data;
                  },
                });
              };
            }}
          >
            Open new file
          </button>
          <Switch>
            <Match when={fileType() === undefined}>
              <div class="flex-1 flex flex-row mx-2 space-x-1 ">
                <For each={[0, 1, 2] as FileType[]}>
                  {(ty) => (
                    <button
                      class={
                        "flex-1 text-xl text-center py-2 " +
                        "shadow-md hover:shadow-lg rounded-3xl " +
                        TY_STYLES[ty]
                      }
                      onclick={() => setFileType((_) => ty)}
                    >
                      {TY_NAMES[ty]}
                    </button>
                  )}
                </For>
              </div>
            </Match>
            <Match when={fileType() !== undefined}>
              <button
                class={
                  "flex-1 text-xl text-center py-2 mx-2 " +
                  "shadow-sm hover:shadow-md rounded-3xl " +
                  TY_STYLES[fileType()]
                }
                onclick={() => setFileType((_) => undefined)}
              >
                {TY_NAMES[fileType()]}
              </button>
            </Match>
          </Switch>
        </div>
        <div class="flex-1 overflow-x-hidden overflow-y-auto space-y-2">
          <For each={getHistory().reverse()}>
            {(item) => (
              <OpenFile
                item={item}
                onclick={() => {
                  props.setRoute({
                    route: "view",
                    data: async () => {
                      addHistory(item);
                      return item.data;
                    },
                  });
                }}
              />
            )}
          </For>
        </div>
      </div>
    </div>
  );
};

export default Open;
