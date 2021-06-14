import path from "path";
import config from "../config";
import DocumentedItem from "./item";

export default class DocumentedItemMeta extends DocumentedItem {
    registerMetaInfo(data) {
        this.directData = {
            line: data.lineno,
            file: data.filename,
            path: path.relative(config.root, data.path).replace(/\\/g, "/"),
        };
    }

    serializer() {
        return {
            line: this.directData.line,
            file: this.directData.file,
            path: this.directData.path,
        };
    }
}
