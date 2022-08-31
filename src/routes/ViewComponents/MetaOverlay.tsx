import type { Component } from "solid-js";
import type { ParseResult } from "../../lib/parse";

const MetaOverlay: Component<{ fileData: ParseResult }> = (props) => {
  return (
    <div
      class={
        "max-h-[80vh] overflow-y-scroll mx-2 p-2 bg-white " +
        "shadow-md border-solid border-1 border-gray-500 "
      }
    >
      <pre>{props.fileData.meta}</pre>
    </div>
  );
};

export default MetaOverlay;
