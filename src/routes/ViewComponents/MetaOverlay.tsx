import { Component, For } from "solid-js";
import { ParseResult } from "../../lib/parse";

const MetaOverlay: Component<{ fileData: ParseResult }> = (props) => {
  return (
    <div class="w-full flex flex-row z-5 absolute">
      <table class="m-2 bg-white shadow-md">
        <For each={props.fileData.meta}>
          {([name, value]) => (
            <tr>
              <td class="border-solid border-1 border-gray-500 px-1 pt-1 bg-green-100 w-50">
                {name}
              </td>
              <td class="border-solid border-1 border-gray-500 px-1 pt-1">
                {value}
              </td>
            </tr>
          )}
        </For>
      </table>
    </div>
  );
};

export default MetaOverlay;
