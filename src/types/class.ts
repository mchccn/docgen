import DocumentedConstructor from "./constructor";
import DocumentedEvent from "./event";
import DocumentedFunction from "./function";
import DocumentedItem from "./item";
import DocumentedItemMeta from "./item-meta";
import DocumentedMember from "./member";
import DocumentedVarType from "./var-type";

export default class DocumentedClass extends DocumentedItem {
    public props = new Map();
    public methods = new Map();
    public events = new Map();

    public extends?: DocumentedVarType;
    public implements?: DocumentedVarType;

    construct?;

    public constructor(docParent, data) {
        super(docParent, data);

        if (data.augments) this.extends = new DocumentedVarType(this, { names: data.augments });
        if (data.implements) this.implements = new DocumentedVarType(this, { names: data.implements });
    }

    public add(item: DocumentedItem) {
        if (item instanceof DocumentedConstructor) {
            if (this.construct) throw new Error(`Doc ${this.directData.name} already has constructor`);

            this.construct = item;
        } else if (item instanceof DocumentedFunction) {
            const prefix = item.directData.scope === "static" ? "s-" : "";
            if (this.methods.has(prefix + item.directData.name)) {
                throw new Error(`Doc ${this.directData.name} already has method ${item.directData.name}`);
            }
            this.methods.set(prefix + item.directData.name, item);
        } else if (item instanceof DocumentedMember) {
            if (this.props.has(item.directData.name)) {
                throw new Error(`Doc ${this.directData.name} already has prop ${item.directData.name}`);
            }
            this.props.set(item.directData.name, item);
        } else if (item instanceof DocumentedEvent) {
            if (this.events.has(item.directData.name)) {
                throw new Error(`Doc ${this.directData.name} already has event ${item.directData.name}`);
            }
            this.events.set(item.directData.name, item);
        }
    }

    public registerMetaInfo(data) {
        this.directData = data;

        this.directData.meta = new DocumentedItemMeta(this, data.meta);
    }

    public serializer() {
        return {
            name: this.directData.name,
            description: this.directData.description,
            see: this.directData.see,
            extends: this.extends ? this.extends.serialize() : undefined,
            implements: this.implements ? this.implements.serialize() : undefined,
            access: this.directData.access,
            abstract: this.directData.virtual,
            deprecated: this.directData.deprecated,
            construct: this.construct ? this.construct.serialize() : undefined,
            props: this.props.size > 0 ? Array.from(this.props.values()).map((p) => p.serialize()) : undefined,
            methods: this.methods.size > 0 ? Array.from(this.methods.values()).map((m) => m.serialize()) : undefined,
            events: this.events.size > 0 ? Array.from(this.events.values()).map((e) => e.serialize()) : undefined,
            meta: this.directData.meta.serialize(),
        };
    }
}
