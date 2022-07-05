import { Component, createSignal, For, Setter } from "solid-js";
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
        "shadow-sm hover:shadow-md rounded-xl " +
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
  const [fileType, setFileType] = createSignal(2 as FileType);

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
              "shadow-sm hover:shadow-md rounded-3xl " +
              "bg-green-50 hover:bg-green-100"
            }
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
          <button
            class={
              "flex-1 text-xl text-center p-2 mx-2 " +
              "shadow-sm hover:shadow-md rounded-3xl " +
              TY_STYLES[fileType()]
            }
            onclick={() => setFileType((v) => ((v + 1) % 3) as FileType)}
          >
            {TY_NAMES[fileType()]}
          </button>
        </div>
        <div class="flex-1 overflow-scroll space-y-2">
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
