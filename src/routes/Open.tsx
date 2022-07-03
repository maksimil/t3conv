import { Component, For, Setter } from "solid-js";
import { Route } from "../App";
import { parseFile } from "../lib/parse";
import { addHistory, getHistory } from "../lib/history";

const OpenFile: Component<{ fname: string; onclick: () => void }> = ({
  fname,
  onclick,
}) => {
  return (
    <button
      class={
        "w-full text-md text-left p-2 " +
        "bg-white shadow-sm hover:shadow-md rounded-xl"
      }
      onclick={onclick}
    >
      {fname}
    </button>
  );
};

const Open: Component<{ setRoute: Setter<Route> }> = (props) => {
  console.log(getHistory());
  return (
    <div class="w-full h-full flex items-center justify-center bg-gray-100">
      <div
        class={
          "w-3/5 h-3/5 bg-gray-50 rounded-3xl shadow-lg p-4 " +
          "space-y-4 flex flex-col"
        }
      >
        <button
          class={
            "w-full text-xl text-center p-2 " +
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

                  const data = parseFile(await file.text());
                  const name = file.name;

                  addHistory({ data, name });
                  return data;
                },
              });
            };
          }}
        >
          Open new file
        </button>
        <div class="flex-1 overflow-scroll space-y-2">
          <For each={getHistory().reverse()}>
            {({ name, data }) => (
              <OpenFile
                fname={name}
                onclick={() => {
                  props.setRoute({
                    route: "view",
                    data: async () => {
                      addHistory({ data, name });
                      return data;
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
