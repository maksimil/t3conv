import { Component, For } from "solid-js";
import { ParseResult } from "../../lib/parse";

const MetaOverlay: Component<{ fileData: ParseResult }> = (props) => {
  return (
    <div class="w-full flex flex-row z-5 absolute">
      <div class="max-h-[80vh] overflow-y-scroll m-2 bg-white shadow-md border-solid border-1 border-gray-500">
        <table class="m-1 mr-2">
          <tbody>
            <For each={props.fileData.meta.split("\n")}>
              {(line, idx) => (
                <tr class="font-mono pre">
                  <td class="p-0 text-gray-500 text-right pr-1">{idx() + 1}</td>
                  <td class="p-0">
                    <pre>{line}</pre>
                  </td>
                </tr>
              )}
            </For>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MetaOverlay;
