import {
  Accessor,
  Setter,
  Component,
  createSignal,
  Switch,
  Match,
} from "solid-js";

const RowElement: Component<{
  accessor: Accessor<number | null>;
  setter: Setter<number | null>;
  label: string;
  units: string;
}> = (props) => {
  return (
    <Switch>
      <Match when={props.accessor() !== null}>
        <tr>
          <td
            class={
              "border-solid border-1 border-gray-500 px-1 pt-1 w-25 " +
              "bg-green-100 hover:bg-green-200 cursor-pointer "
            }
            onclick={() => {
              props.setter(null);
            }}
          >
            {props.label}
          </td>
          <td class="border-solid border-1 border-gray-500 pl-1">
            <input
              type="text"
              value={props.accessor()}
              class="w-15 focus:outline-none inline-block text-right"
              onchange={(e) => {
                const parsed = parseFloat(e.currentTarget.value);
                if (!isNaN(parsed)) {
                  props.setter(parsed);
                } else {
                  props.setter(null);
                }
              }}
            />
            <div class="inline ml-1">{props.units}</div>
          </td>
        </tr>
      </Match>
      <Match when={props.accessor() === null}>
        <tr
          class="bg-gray-100 hover:bg-gray-200 cursor-pointer"
          onclick={() => {
            props.setter(1);
          }}
        >
          <td class="border-solid border-1 border-gray-500 px-1 pt-1 w-25">
            {props.label}
          </td>
          <td class="border-solid border-1 border-gray-500 pl-1">
            <div class="w-15 inline-block text-right">-</div>
            <div class="inline ml-1">{props.units}</div>
          </td>
        </tr>
      </Match>
    </Switch>
  );
};

const NormalizeOverlay: Component<{
  initial: [number | null, number | null];
  normalize: (mass: number | null, volume: number | null) => void;
}> = (props) => {
  const [mass, setMass] = createSignal(props.initial[0]);
  const [volume, setVolume] = createSignal(props.initial[1]);

  return (
    <div class="w-full flex flex-row z-5 absolute">
      <table class="m-2 bg-white shadow-md">
        <tbody>
          <RowElement
            accessor={mass}
            setter={setMass}
            label="Mass"
            units="mg"
          />
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
                props.normalize(mass(), volume());
              }}
            >
              Normalize
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default NormalizeOverlay;
