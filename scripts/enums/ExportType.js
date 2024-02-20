import MSYTParser from "../MSYTParser.js";
import TOTKMSBTEditorParser from "../TOTKMSBTEditorParser.js";

/** A format available to export in. */
export default {
  MSYT: {
    id: "MSYT",
    optionLabel: "BOTW (MSYT)",
    docsLabel: "Learn how to use MSYT output",
    docsLink: "https://zeldamods.org/wiki/Help:Text_modding",
    parser: MSYTParser
  },
  TOTKMSBTEditor: {
    id: "TOTKMSBTEditor",
    optionLabel: "TOTK (MSBT Editor)",
    docsLabel: "Download MSBT Editor",
    docsLink: "https://gitlab.com/AeonSake/msbt-editor/-/releases",
    parser: TOTKMSBTEditorParser
  }
};
