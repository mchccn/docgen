import DocumentedItem from "./item";
import DocumentedItemMeta from "./item-meta";
import DocumentedParam from "./param";
import DocumentedVarType from "./var-type";

export default class DocumentedTypeDef extends DocumentedItem {
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

        if (data.params) {
            if (data.params.length > 0) {
                for (let i = 0; i < data.params.length; i++) data.params[i] = new DocumentedParam(this, data.params[i]);
            } else {
                data.params = undefined;
            }
        }

        if (data.returns) {
            let returnDescription: string;

            let returnNullable: boolean;

            if (data.returns[0].description) returnDescription = data.returns[0].description;
            if (data.returns[0].nullable) returnNullable = true;
            data.returns = new DocumentedVarType(this, data.returns[0].type);
            data.returns.directData.description = returnDescription;
            data.returns.directData.nullable = returnNullable;
        }

        this.directData = data;
    }

    serializer() {
        return {
            name: this.directData.name,
            description: this.directData.description,
            see: this.directData.see,
            access: this.directData.access,
            deprecated: this.directData.deprecated,
            type: this.directData.type.serialize(),
            props: this.directData.properties ? this.directData.properties.map((p) => p.serialize()) : undefined,
            params: this.directData.params ? this.directData.params.map((p) => p.serialize()) : undefined,
            returns: this.directData.returns ? this.directData.returns.serialize() : undefined,
            returnsDescription: this.directData.returnsDescription,
            meta: this.directData.meta.serialize(),
        };
    }
}
