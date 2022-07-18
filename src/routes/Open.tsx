import { Component, For, Setter } from "solid-js";
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

  const openOldFile = (item: HistoryItem) => () => {
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
        <div class="mx-2 space-x-1 flex flex-row">
          <For each={[0, 1, 2] as FileType[]}>
            {(ty) => (
              <button
                class={
                  "flex-1 text-xl text-center py-2 " +
                  "shadow-md hover:shadow-lg rounded-3xl " +
                  TY_STYLES[ty]
                }
                onclick={() => openNewFile(ty)}
              >
                Open {TY_NAMES[ty]}
              </button>
            )}
          </For>
        </div>
        <div class="flex-1 overflow-x-hidden overflow-y-auto space-y-2">
          <For each={getHistory().reverse()}>
            {(item) => <OpenFile item={item} onclick={openOldFile(item)} />}
          </For>
        </div>
      </div>
    </div>
  );
};

export default Open;
