import { Component, createSignal } from "solid-js";
import { TY_NAMES, ParseResult, dataLabels } from "../../lib/parse";

const defaultFileName = (fileData: ParseResult) => {
  const parts = [fileData.meta["Sample ID"], TY_NAMES[fileData.ty]];

  if (
    fileData.normalization[0] !== null ||
    fileData.normalization[1] !== null
  ) {
    parts.push("Normalized");
  }

  return parts.join("-") + ".csv";
};

const ExportOverlay: Component<{
  fileData: ParseResult;
  onexport: () => void;
}> = (props) => {
  const [fileName, setFileName] = createSignal(defaultFileName(props.fileData));

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
                value={fileName()}
                onInput={(e) => {
                  setFileName(e.currentTarget.value);
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
