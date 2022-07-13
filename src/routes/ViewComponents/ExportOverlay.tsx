import { Component, createSignal } from "solid-js";
import { TY_NAMES, ParseResult, dataLabels } from "../../lib/parse";

const ExportOverlay: Component<{
  fileData: ParseResult;
  onexport: () => void;
}> = (props) => {
  const [fileName, setFileName] = createSignal(
    props.fileData.meta["Sample ID"] +
      "-" +
      TY_NAMES[props.fileData.ty] +
      ".csv"
  );

  const exportFn = () => {
    let text = dataLabels(props.fileData).join(";");

    props.fileData.data.forEach((row) => {
      text += "\n" + row.map((c) => (c === null ? "" : c)).join(";");
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
            <td class="border-solid border-1 border-gray-500 px-1 pt-1 bg-green-100 w-25">
              Filename
            </td>
            <td class="border-solid border-1 border-gray-500 pl-1 w-75">
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
              colspan="2"
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
