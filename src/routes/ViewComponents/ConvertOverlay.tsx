import { Component, createSignal } from "solid-js";
import { XUnits, YUnits } from "../../lib/parse";

const ConvertOverlay: Component<{
  units: [XUnits, YUnits];
  convert: (u: [XUnits, YUnits]) => void;
}> = (props) => {
  const [xUnit, setXUnit] = createSignal(props.units[0] as XUnits);
  const [yUnit, setYUnit] = createSignal(props.units[1] as YUnits);

  return (
    <div class="w-full flex flex-row z-5 absolute">
      <table class="m-2 bg-white shadow-md">
        <tbody>
          <tr>
            <td class="border-solid border-1 border-gray-500 px-1 pt-1 bg-green-100 w-30">
              Field
            </td>
            <td class="border-solid border-1 border-gray-500 w-20">
              <select
                value={xUnit()}
                class="w-full h-full bg-white cursor-pointer"
                onchange={(e) => {
                  setXUnit(
                    (_) => (e.target as HTMLSelectElement).value as XUnits
                  );
                }}
              >
                <option value="Oe">Oe</option>
                <option value="A/m">A/m</option>
                <option value="T">T</option>
              </select>
            </td>
          </tr>
          <tr>
            <td class="border-solid border-1 border-gray-500 px-1 pt-1 bg-green-100 w-30">
              Momentum
            </td>
            <td class="border-solid border-1 border-gray-500 w-20">
              <select
                value={yUnit()}
                class="w-full h-full bg-white cursor-pointer"
                onchange={(e) => {
                  setYUnit(
                    (_) => (e.target as HTMLSelectElement).value as YUnits
                  );
                }}
              >
                <option value="emu">emu</option>
                <option value="Am2">Am2</option>
              </select>
            </td>
          </tr>
          <tr>
            <td
              class={
                "border-solid border-1 border-gray-500 px-1 pt-1 " +
                "bg-green-100 hover:bg-green-200 cursor-pointer "
              }
              colspan="2"
              onclick={() => {
                props.convert([xUnit(), yUnit()]);
              }}
            >
              Convert
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default ConvertOverlay;
