import { Component, For, Switch, Match, createMemo } from "solid-js";
import { ParseResult, XUnits, YUnits } from "../../lib/parse";

const CONVERT_FNS: Record<XUnits | YUnits, (v: number) => string> = {
  [XUnits.Oe]: (v: number) => v.toFixed(2),
  [XUnits.Am]: (v: number) => v.toFixed(0),
  [XUnits.T]: (v: number) => v.toFixed(4),
  [XUnits.mT]: (v: number) => v.toFixed(4),
  [YUnits.emu]: (v: number) => v.toExponential(5),
  [YUnits.Am2]: (v: number) => v.toExponential(5),
};

export const convertMask = (data: ParseResult): ((v: number) => string)[] => [
  CONVERT_FNS[data.units[0]],
  CONVERT_FNS[data.units[1]],
  CONVERT_FNS[data.units[1]],
];

const SideBar: Component<{ fileData: ParseResult }> = (props) => {
  const maskMemo = createMemo(() => convertMask(props.fileData));

  return (
    <div class="overflow-y-scroll flex-none border-1 border-gray-400">
      <table class="border-separate" style="border-spacing:0;">
        <thead class="sticky top-0 z-2 bg-green-100">
          <tr class="divide-x divide-gray-400">
            <For each={props.fileData.getDataLabels()}>
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
          <For each={props.fileData.data.flat(1)}>
            {(row) => (
              <tr class="divide-x divide-gray-400 ">
                <For each={row}>
                  {(x, i) => (
                    <Switch>
                      <Match when={x != null}>
                        <td
                          class={
                            "pt-1 px-1 text-right " +
                            "border-b-1 border-gray-400 "
                          }
                        >
                          {maskMemo()[i()](x)}
                        </td>
                      </Match>
                      <Match when={x == null}>
                        <td
                          class={
                            "bg-red-100 pt-1 px-1 text-right " +
                            "border-b-1 border-gray-400 "
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
