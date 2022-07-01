import {
  Component,
  createSignal,
  createResource,
  Setter,
  Show,
  For,
} from "solid-js";
import { Route } from "../App";
import { fields, parseFile } from "../lib/parse";

const TopButton: Component<{ label: string; onclick: () => void }> = (
  props
) => (
  <button
    class="px-2 pt-1 hover:bg-gray-100 hover:shadow-md"
    onclick={props.onclick}
  >
    {props.label}
  </button>
);

const View: Component<{ setRoute: Setter<Route>; file: File }> = (props) => {
  const [fileData] = createResource(props.file, async (f) =>
    parseFile(await f.text())
  );

  const [showMeta, setShowMeta] = createSignal(true);

  return (
    <div class="w-full h-full">
      <div class="flex flex-row">
        <TopButton
          label="Open Another file"
          onclick={() => props.setRoute({ route: "open" })}
        />
        <TopButton
          label={showMeta() ? "Hide metadata" : "Show metadata"}
          onclick={() => setShowMeta((v) => !v)}
        />
      </div>
      <Show when={!fileData.loading} fallback={<p>Loading...</p>}>
        <Show when={showMeta()}>
          <div class="w-full flex">
            <table class="flex-1 m-2">
              <For each={fields}>
                {(fd) => (
                  <tr>
                    <td class="border-solid border-1 border-gray-500 px-1 pt-1 bg-green-100">
                      {fd}
                    </td>
                    <td class="border-solid border-1 border-gray-500 px-1 pt-1">
                      {fileData().meta[fd]}
                    </td>
                  </tr>
                )}
              </For>
            </table>
          </div>
        </Show>
      </Show>
    </div>
  );
};

export default View;
