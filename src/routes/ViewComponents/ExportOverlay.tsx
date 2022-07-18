import { Component, createSignal } from "solid-js";
import { TY_NAMES, ParseResult, dataLabels } from "../../lib/parse";
import { convertMask } from "./SideBar";

type DataMode = "Raw" | "Converted";

const ExportOverlay: Component<{
  fileData: ParseResult;
  onexport: () => void;
}> = (props) => {
  const [dataMode, setDataMode] = createSignal("Converted" as DataMode);
  const [fileName, setFileName] = createSignal(null as string | null);

  const autoFileName = () =>
    props.fileData.meta["Sample ID"] +
    "-" +
    TY_NAMES[props.fileData.ty] +
    "-" +
    dataMode() +
    ".csv";

  const exportFn = () => {
    let text = dataLabels(props.fileData).join(";");

    const convert: ((v: number) => string)[] = (() => {
      switch (dataMode()) {
        case "Raw":
          return [
            (v) => v.toString(),
            (v) => v.toString(),
            (v) => v.toString(),
          ];
        case "Converted":
          return convertMask(props.fileData);
      }
    })();

    props.fileData.data.forEach((row) => {
      text +=
        "\n" + row.map((c, i) => (c === null ? "" : convert[i](c))).join(";");
    });

    const el = document.createElement("a");
    el.setAttribute(
      "href",
      "data:text/plain;charset=utf-8," + encodeURIComponent(text)
    );
    el.setAttribute(
      "download",
      fileName() === null ? autoFileName() : fileName()
    );
    el.click();

    props.onexport();
  };

  const DataChoice: Component<{ mode: DataMode }> = (props) => (
    <td
      class={
        "w-45 border-solid border-1 border-gray-500 px-1 pt-1 cursor-pointer " +
        (dataMode() === props.mode
          ? "bg-green-100 hover:bg-green-200 "
          : "bg-gray-100 hover:bg-gray-200")
      }
      onclick={() => setDataMode(props.mode)}
    >
      {props.mode}
    </td>
  );

  return (
    <div class="w-full flex flex-row z-5 absolute">
      <table class="m-2 bg-white shadow-md">
        <tbody>
          <tr>
            <td
              class={
                "border-solid border-1 border-gray-500 px-1 pt-1 w-25 " +
                (fileName() === null
                  ? "bg-gray-100 "
                  : "bg-green-100 hover:bg-green-200 cursor-pointer ")
              }
              onclick={() => setFileName(null)}
            >
              Filename
            </td>
            <td
              class="border-solid border-1 border-gray-500 pl-1 w-90"
              colspan="2"
            >
              <input
                class="w-full focus:outline-none"
                type="text"
                value={fileName() === null ? autoFileName() : fileName()}
                onInput={(e) => {
                  setFileName(e.currentTarget.value);
                }}
              />
            </td>
          </tr>
          <tr>
            <td class="border-solid border-1 border-gray-500 px-1 pt-1 bg-green-100 w-25">
              Data
            </td>
            <DataChoice mode="Raw" />
            <DataChoice mode="Converted" />
          </tr>
          <tr>
            <td
              class={
                "border-solid border-1 border-gray-500 px-1 pt-1 " +
                "bg-green-100 hover:bg-green-200 cursor-pointer"
              }
              colspan="3"
              onclick={exportFn}
            >
              Export
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default ExportOverlay;
