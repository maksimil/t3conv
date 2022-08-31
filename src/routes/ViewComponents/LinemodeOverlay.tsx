import { Component, batch } from "solid-js";
import type { SetStoreFunction } from "solid-js/store";

export type LineMode = { lines: boolean; markers: boolean };

const LinemodeOverlay: Component<{
  mode: LineMode;
  setter: SetStoreFunction<LineMode>;
}> = (props) => {
  const ModeBtn: Component<{ label: keyof LineMode }> = (btnprops) => {
    return (
      <td
        class={
          "border-solid border-1 border-gray-500 px-1 pt-1 cursor-pointer " +
          (props.mode[btnprops.label]
            ? "bg-green-100 hover:bg-green-200"
            : "bg-gray-100 hover:bg-gray-200")
        }
        onclick={() => {
          batch(() => {
            props.setter(btnprops.label, (v) => !v);
          });
        }}
      >
        {btnprops.label}
      </td>
    );
  };
  return (
    <table class="mx-2 bg-white shadow-md">
      <tbody>
        <tr>
          <ModeBtn label="lines" />
          <ModeBtn label="markers" />
        </tr>
      </tbody>
    </table>
  );
};

export default LinemodeOverlay;
