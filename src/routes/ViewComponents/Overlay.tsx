import { children, Component, JSX, Match, Switch } from "solid-js";

const Overlay: Component<{ children: JSX.Element; close: () => void }> = (
  props
) => {
  const c = children(() => props.children);

  return (
    <Switch>
      <Match when={c() === undefined}>
        <></>
      </Match>
      <Match when={c() !== undefined}>
        <div class="w-full z-5 absolute">
          <div
            class={
              "w-min mx-2 mt-2 pt-1 px-1 bg-red-100 " +
              "hover:bg-red-200 cursor-pointer " +
              "border-t-1 border-l-1 border-r-1 border-solid border-gray-500 "
            }
            onclick={() => {
              props.close();
            }}
          >
            Hide
          </div>
          <div class="w-full flex flex-row">{c()}</div>
        </div>
      </Match>
    </Switch>
  );
};

export default Overlay;
