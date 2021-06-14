import DocumentedItem from "./item";
import DocumentedItemMeta from "./item-meta";
import DocumentedParam from "./param";
import DocumentedVarType from "./var-type";

export default class DocumentedMember extends DocumentedItem {
    registerMetaInfo(data) {
        data.meta = new DocumentedItemMeta(this, data.meta);
        data.type = new DocumentedVarType(this, data.type);

        if (data.properties) {
            if (data.properties.length > 0) {
                for (let i = 0; i < data.properties.length; i++) {
                    data.properties[i] = new DocumentedParam(this, data.properties[i]);
                }
            } else {
                data.properties = undefined;
            }
        }

        this.directData = data;
    }

    serializer() {
        return {
            name: this.directData.name,
            description: this.directData.description,
            see: this.directData.see,
            scope: this.directData.scope !== "instance" ? this.directData.scope : undefined,
            access: this.directData.access,
            readonly: this.directData.readonly,
            nullable: this.directData.nullable,
            abstract: this.directData.virtual,
            deprecated: this.directData.deprecated,
            default: this.directData.default,
            type: this.directData.type.serialize(),
            props: this.directData.properties ? this.directData.properties.map((p) => p.serialize()) : undefined,
            meta: this.directData.meta.serialize(),
        };
    }
}
