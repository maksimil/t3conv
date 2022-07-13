import { Component, For, Switch, Match } from "solid-js";
import { ParseResult, dataLabels } from "../../lib/parse";

const SideBar: Component<{ fileData: ParseResult }> = (props) => {
  return (
    <div class="overflow-y-scroll flex-none border-1 border-gray-400">
      <table class="border-separate" style="border-spacing:0;">
        <thead class="sticky top-0 z-2 bg-green-100">
          <tr class="divide-x divide-gray-400">
            <For each={dataLabels(props.fileData)}>
              {(lbl) => (
                <th
                  class={
                    "pt-1 px-1 text-left font-normal " +
                    "sticky top-0 z-2 border-b-1 border-gray-400 "
                  }
                >
                  {lbl}
                </th>
              )}
            </For>
          </tr>
        </thead>
        <tbody>
          <For each={props.fileData.data}>
            {(row, rowi) => (
              <tr class="divide-x divide-gray-400 ">
                <For each={row}>
                  {(x, i) => (
                    <Switch>
                      <Match when={x != null}>
                        <td
                          class={
                            "pt-1 px-1 text-right " +
                            (rowi() > 0 ? "border-t-1 border-gray-400 " : "")
                          }
                        >
                          {x.toFixed([1, 5, 5][i()])}
                        </td>
                      </Match>
                      <Match when={x == null}>
                        <td
                          class={
                            "bg-red-100 pt-1 px-1 text-right " +
                            (rowi() > 0 ? "border-t-1 border-gray-400 " : "")
                          }
                        >
                          -
                        </td>
                      </Match>
                    </Switch>
                  )}
                </For>
              </tr>
            )}
          </For>
        </tbody>
      </table>
    </div>
  );
};

export default SideBar;
