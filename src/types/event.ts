import DocumentedItem from "./item";
import DocumentedItemMeta from "./item-meta";
import DocumentedParam from "./param";

export default class DocumentedEvent extends DocumentedItem {
    registerMetaInfo(data) {
        data.meta = new DocumentedItemMeta(this, data.meta);

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
            deprecated: this.directData.deprecated,
            params: this.directData.params ? this.directData.params.map((p) => p.serialize()) : undefined,
            meta: this.directData.meta.serialize(),
        };
    }
}
