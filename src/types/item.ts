export default class DocumentedItem {
    public directData = undefined;
    public parent;

    public constructor(parent, info) {
        this.parent = parent;

        try {
            this.registerMetaInfo(info);
        } catch (err) {
            err.message = `Error while loading ${this.detailedName(info)}: ${err.message}`;
            throw err;
        }
    }

    public serialize() {
        try {
            return this.serializer();
        } catch (err) {
            err.message = `Error while serializing ${this.detailedName(this.directData)}: ${err.message}`;

            throw err;
        }
    }

    public registerMetaInfo(info) {}

    public serializer() {}

    public detailedName(data?: { id: string; name: string }) {
        if (!data) return this.constructor.name;

        if (data.id) return `${data.id} (${this.constructor.name})`;

        if (data.name) return `${data.name} (${this.constructor.name})`;

        return this.constructor.name;
    }
}
