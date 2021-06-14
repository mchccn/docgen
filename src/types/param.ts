import DocumentedItem from "./item";
import DocumentedVarType from "./var-type";

export default class DocumentedParam extends DocumentedItem {
    registerMetaInfo(data) {
        data.type = new DocumentedVarType(this, data.type);
        this.directData = data;
    }

    serializer() {
        return {
            name: this.directData.name,
            description: this.directData.description,
            optional: this.directData.optional,
            default: this.directData.defaultvalue,
            variable: this.directData.variable,
            nullable: this.directData.nullable,
            type: this.directData.type.serialize(),
        };
    }
}
