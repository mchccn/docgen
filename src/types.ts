import Documentation from "./documentation";

export interface Item {
    name: string;
    kind: keyof Documentation["childTypes"] | keyof Documentation["rootTypes"];
    memberof: string;
    meta: {
        directData: {
            path: string;
            file: string;
            filename: string;
            line?: number;
            lineno: number;
        };
    };
    directData: {
        name: string;
        memberof: string;
        meta: {
            path: string;
            file?: string;
            filename: string;
            line?: number;
            lineno: number;
        };
        scope: string;
    };
}

export type Items = Item[];
