import MSYTParser from "../MSYTParser.js";
import TOTKMSBTEditorParser from "../TOTKMSBTEditorParser.js";
import TOTKNXEditorParser from "../TOTKNXEditorParser.js";

/** A format available to export in. */
export default {
  MSYT: {
    id: "MSYT",
    optionLabel: "BOTW (MSYT)",
    docsLabel: "Learn how to use MSYT output",
    docsLink: "https://zeldamods.org/wiki/Help:Text_modding",
    parser: MSYTParser
  },
  TOTKNXEditor: {
    id: "TOTKNXEditor",
    optionLabel: "TOTK (NX Editor / YAML)",
    docsLabel: "Learn how to install NX Editor",
    docsLink: "https://github.com/NX-Editor/NxEditor/blob/master/ReadMe.md",
    parser: TOTKNXEditorParser
  },
  TOTKMSBTEditor: {
    id: "TOTKMSBTEditor",
    optionLabel: "TOTK (MSBT Editor)",
    docsLabel: "Download MSBT Editor",
    docsLink: "https://gitlab.com/AeonSake/msbt-editor/-/releases",
    parser: TOTKMSBTEditorParser
  }
};
