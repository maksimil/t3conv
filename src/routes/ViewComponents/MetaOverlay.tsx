import { Component } from "solid-js";
import { ParseResult } from "../../lib/parse";

const MetaOverlay: Component<{ fileData: ParseResult }> = (props) => {
  return (
    <div class="w-full flex flex-row z-5 absolute">
      <div
        class={
          "max-h-[80vh] overflow-y-scroll m-2 p-2 bg-white " +
          "shadow-md border-solid border-1 border-gray-500 "
        }
      >
        <pre>{props.fileData.meta}</pre>
      </div>
    </div>
  );
};

export default MetaOverlay;
