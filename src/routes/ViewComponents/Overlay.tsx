import { children, Component, JSX } from "solid-js";

const Overlay: Component<{ children: JSX.Element; close: () => void }> = (
  props
) => {
  const c = children(() => props.children);

  return <div class="w-full flex flex-row z-5 absolute">{c()}</div>;
};

export default Overlay;
