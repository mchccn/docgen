import path from "path";
import { Item, Items } from "./types";
import DocumentedClass from "./types/class";
import DocumentedConstructor from "./types/constructor";
import DocumentedEvent from "./types/event";
import DocumentedExternal from "./types/external";
import DocumentedFunction from "./types/function";
import DocumentedInterface from "./types/interface";
import DocumentedMember from "./types/member";
import DocumentedTypeDef from "./types/typedef";

export default class Documentation {
    public rootTypes = {
        class: [DocumentedClass, "classes"],
        interface: [DocumentedInterface, "interfaces"],
        typedef: [DocumentedTypeDef, "typedefs"],
        external: [DocumentedExternal, "externals"],
    } as const;

    public childTypes = {
        constructor: DocumentedConstructor,
        member: DocumentedMember,
        function: DocumentedFunction,
        event: DocumentedEvent,
    } as const;

    public classes = new Map();
    public interfaces = new Map();
    public typedefs = new Map();
    public externals = new Map();

    public custom;

    public constructor(items: Items, custom: any) {
        this.custom = custom;

        this.parse(items);
    }

    public registerRoots(items: Items) {
        let i = 0;
        while (i < items.length) {
            const item = items[i];

            if (Array.isArray(this.rootTypes[item.kind as keyof Documentation["rootTypes"]])) {
                const [Type, key] = this.rootTypes[item.kind as keyof Documentation["rootTypes"]];

                this[key].set(item.name, new Type(this, item));

                items.splice(i, 1);
            } else {
                ++i;
            }
        }
    }

    public findParent(item: Item) {
        if (this.childTypes[item.kind as keyof Documentation["childTypes"]]) {
            for (const type in this.rootTypes) {
                const parent = this[this.rootTypes[type as keyof Documentation["rootTypes"]][1] as keyof Documentation].get(item.memberof);
                if (parent) return parent;
            }
        }

        return undefined;
    }

    public parse(items: Items) {
        this.registerRoots(items);

        for (const member of items) {
            let item;

            if (this.childTypes[member.kind as keyof Documentation["childTypes"]]) item = new this.childTypes[member.kind as keyof Documentation["childTypes"]](this, member);
            else console.warn(`- Unknown documentation kind "${item.kind}" - \n${JSON.stringify(item)}\n`);

            const parent = this.findParent(member);
            if (parent) {
                parent.add(item);
                continue;
            }

            const name = member.name || (member.directData ? member.directData.name : "UNKNOWN");
            let info = [];

            const memberof = member.memberof || (member.directData ? member.directData.memberof : undefined);
            if (memberof) info.push(`member of "${memberof}"`);

            const meta = member.meta
                ? member.meta.directData
                : member.directData && member.directData.meta
                ? {
                      path: member.directData.meta.path,
                      file: member.directData.meta.file ?? member.directData.meta.filename,
                      line: member.directData.meta.line ?? member.directData.meta.lineno,
                  }
                : undefined;

            if (meta) info.push(`${path.join(meta.path, meta.file)}${meta.line ? `:${meta.line}` : ""}`);

            const information = info.length > 0 ? ` (${info.join(", ")})` : "";

            console.warn(`- "${name}"${information} has no accessible parent.`);

            if (!name && information.length === 0) console.warn("Raw object:", member);
        }
    }

    public serialize() {
        const meta = {
            generator: "1.0.0",
            format: Documentation.FORMAT_VERSION,
            date: Date.now(),
        };

        const serialized = {
            meta,
            custom: this.custom,
            classes: [] as any[],
            interfaces: [] as any[],
            typedefs: [] as any[],
            externals: [] as any[],
        };

        for (const type in this.rootTypes) {
            const key = this.rootTypes[type as keyof Documentation["rootTypes"]][1];

            serialized[key] = Array.from(this[key].values()).map((i) => i.serialize());
        }

        return serialized;
    }

    public static get FORMAT_VERSION() {
        return 20;
    }
}
