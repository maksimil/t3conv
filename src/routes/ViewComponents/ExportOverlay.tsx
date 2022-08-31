import { Component, createSignal } from "solid-js";
import type { ParseResult } from "../../lib/parse";
import Overlay from "./Overlay";

const defaultFileName = (fileData: ParseResult) => fileData.name + ".csv";

const ExportOverlay: Component<{
  fileData: ParseResult;
  onexport: () => void;
}> = (props) => {
  const [rawFileName, setRawFileName] = createSignal<null | string>(null);

  const fileName = () =>
    rawFileName() !== null
      ? (rawFileName() as string)
      : defaultFileName(props.fileData);

  const exportFn = () => {
    let text = props.fileData.getDataLabels().join(";");

    props.fileData.data.forEach((segment) => {
      segment.forEach((row) => {
        text +=
          "\n" + row.map((c) => (c === null ? "" : c.toString())).join(";");
      });
    });

    const el = document.createElement("a");
    el.setAttribute(
      "href",
      "data:text/plain;charset=utf-8," + encodeURIComponent(text)
    );
    el.setAttribute("download", fileName());
    el.click();

    props.onexport();
  };

  return (
    <Overlay>
      <table class="m-2 bg-white shadow-md">
        <tbody>
          <tr>
            <td
              class={
                "border-solid border-1 border-gray-500 px-1 pt-1 w-25 " +
                (rawFileName() === null
                  ? "bg-gray-100 "
                  : "bg-green-100 hover:bg-green-200 cursor-pointer ")
              }
              onclick={() => setRawFileName(null)}
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
                value={fileName()}
                onInput={(e) => {
                  setRawFileName(e.currentTarget.value);
                }}
              />
            </td>
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
    </Overlay>
  );
};

export default ExportOverlay;
