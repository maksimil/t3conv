import { Component, createSignal } from "solid-js";
import { ParseResult } from "../../lib/parse";
import { dataLabels } from "../../lib/plot";

const defaultFileName = (fileData: ParseResult) => fileData.name + ".csv";

const ExportOverlay: Component<{
  fileData: ParseResult;
  onexport: () => void;
}> = (props) => {
  const [rawFileName, setRawFileName] = createSignal(null);

  const fileName = () =>
    rawFileName() !== null ? rawFileName() : defaultFileName(props.fileData);

  const exportFn = () => {
    let text = dataLabels(props.fileData).join(";");

    props.fileData.data.forEach((row) => {
      text +=
        "\n" + row.map((c, i) => (c === null ? "" : c.toString())).join(";");
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
    <div class="w-full flex flex-row z-5 absolute">
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
    </div>
  );
};

export default ExportOverlay;
