import type { Component } from "solid-js";
import type { ParseResult } from "../../lib/parse";
import Overlay from "./Overlay";

const MetaOverlay: Component<{ fileData: ParseResult }> = (props) => {
  return (
    <Overlay>
      <div
        class={
          "max-h-[80vh] overflow-y-scroll m-2 p-2 bg-white " +
          "shadow-md border-solid border-1 border-gray-500 "
        }
      >
        <pre>{props.fileData.meta}</pre>
      </div>
    </Overlay>
  );
};

export default MetaOverlay;
