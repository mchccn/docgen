import DocumentedItem from "./item";
import DocumentedParam from "./param";

export default class DocumentedConstructor extends DocumentedItem {
    registerMetaInfo(data) {
        if (data.params) {
            if (data.params.length > 0) {
                for (let i = 0; i < data.params.length; i++) data.params[i] = new DocumentedParam(this, data.params[i]);
            } else {
                data.params = undefined;
            }
        }
        this.directData = data;
    }

    serializer() {
        return {
            name: this.directData.name,
            description: this.directData.description,
            see: this.directData.see,
            access: this.directData.access,
            params: this.directData.params ? this.directData.params.map((p) => p.serialize()) : undefined,
        };
    }
}
