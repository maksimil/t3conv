import { Component, createEffect } from "solid-js";
import { createStore, SetStoreFunction } from "solid-js/store";
import type { Normalization } from "../../lib/parse";

type NormalizationRow = { value: number; enabled: boolean };

const RowElement: Component<{
  accessor: NormalizationRow;
  setter: SetStoreFunction<NormalizationRow>;
  label: string;
  units: string;
}> = (props) => {
  return (
    <tr>
      <td
        class={
          "border-solid border-1 border-gray-500 px-1 pt-1 w-25 " +
          "cursor-pointer " +
          (props.accessor.enabled
            ? "bg-green-100 hover:bg-green-200 "
            : "bg-gray-100 hover:bg-gray-200 ")
        }
        onclick={() => {
          props.setter("enabled", (v) => !v);
        }}
      >
        {props.label}
      </td>
      <td class="border-solid border-1 border-gray-500 pl-1">
        <input
          type="text"
          value={props.accessor.value}
          class="w-15 focus:outline-none inline-block text-right"
          onchange={(e) => {
            const parsed = parseFloat(e.currentTarget.value);
            if (!isNaN(parsed) && parsed !== 0) {
              props.setter("value", parsed);
            } else {
              props.setter("value", 1);
            }
          }}
        />
        <div class="inline ml-1">{props.units}</div>
      </td>
    </tr>
  );
};

const NormalizeOverlay: Component<{
  initial: Normalization;
  normalize: (norm: Normalization) => void;
}> = (props) => {
  const [mass, setMass] = createStore(props.initial.mass);
  const [volume, setVolume] = createStore(props.initial.volume);

  createEffect(() => {
    if (mass.enabled) {
      setVolume("enabled", false);
    }
  });

  createEffect(() => {
    if (volume.enabled) {
      setMass("enabled", false);
    }
  });

  return (
    <table class="mx-2 bg-white shadow-md">
      <tbody>
        <RowElement accessor={mass} setter={setMass} label="Mass" units="mg" />
        <RowElement
          accessor={volume}
          setter={setVolume}
          label="Volume"
          units="cm3"
        />
        <tr>
          <td
            class={
              "border-solid border-1 border-gray-500 px-1 pt-1 " +
              "bg-green-100 hover:bg-green-200 cursor-pointer"
            }
            colspan="2"
            onclick={() => {
              props.normalize({ mass, volume });
            }}
          >
            Normalize
          </td>
        </tr>
      </tbody>
    </table>
  );
};

export default NormalizeOverlay;
