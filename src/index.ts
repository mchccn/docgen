#!/usr/bin/env node
import fs from "fs";
import { readFile } from "fs/promises";
import yaml from "js-yaml";
import jsdoc2md from "jsdoc-to-markdown";
import path from "path";
import config from "./config";
import Documentation from "./documentation";
import { Item } from "./types";

(async () => {
    try {
        if (config.verbose) console.log("Running with config: ", config);

        const mainPromises = [undefined, undefined] as [Promise<object>?, Promise<string | {}>?];

        console.log("Parsing JSDocs in source files...");

        const files = [];

        for (const dir of config.source) files.push(`${dir}/*.js`, `${dir}/**/*.js`);

        mainPromises[0] = jsdoc2md.getTemplateData({ files, configure: config.jsdoc }).then((data) => {
            console.log(`${data.length} JSDoc items parsed.`);

            return data;
        });

        if (config.custom) {
            console.log("Loading custom docs files...");

            const customDir = path.dirname(config.custom);

            let type: string;

            const defExtension = path.extname(config.custom).toLowerCase();

            if (defExtension === ".json") type = "json";
            else if (defExtension === ".yml" || defExtension === ".yaml") type = "yaml";
            else throw new TypeError("Unknown custom docs definition file type.");

            const defContent = await readFile(config.custom, "utf-8");

            let definitions: {
                id: string;
                name: string;
                path: string;
                files: { id: string; name: string; path: string }[];
            }[];

            if (type === "json") definitions = JSON.parse(defContent);
            else definitions = yaml.load(defContent) as typeof definitions;

            const custom: {
                [id: string]: {
                    name: string;
                    files: {
                        [id: string]:
                            | {
                                  name: string;
                                  type: string;
                                  content: string;
                                  path: string;
                              }
                            | undefined;
                    };
                };
            } = {};

            const filePromises = [];

            for (const cat of definitions) {
                const catID = cat.id || cat.name.toLowerCase();
                const dir = path.join(customDir, cat.path || catID);

                const category = {
                    name: cat.name || cat.id,
                    files: {} as {
                        [id: string]:
                            | {
                                  name: string;
                                  type: string;
                                  content: string;
                                  path: string;
                              }
                            | undefined;
                    },
                };

                custom[catID] = category;

                for (const file of cat.files) {
                    const fileRootPath = path.join(dir, file.path);
                    const extension = path.extname(file.path);
                    const fileID = file.id || path.basename(file.path, extension);

                    category.files[fileID] = undefined;

                    filePromises.push(
                        readFile(fileRootPath, "utf-8").then((content) => {
                            category.files[fileID] = {
                                name: file.name,
                                type: extension.toLowerCase().replace(/^\./, ""),
                                content,
                                path: path.relative(config.root, fileRootPath).replace(/\\/g, "/"),
                            };

                            if (config.verbose) console.log(`Loaded custom docs file ${catID}/${fileID}`);
                        })
                    );
                }
            }

            await Promise.all(filePromises);

            const fileCount = Object.keys(custom)
                .map((k) => Object.keys(custom[k]))
                .reduce((prev, c) => prev + c.length, 0);

            const categoryCount = Object.keys(custom).length;

            console.log(`${fileCount} custom docs file${fileCount !== 1 ? "s" : ""} in ` + `${categoryCount} categor${categoryCount !== 1 ? "ies" : "y"} loaded.`);

            return custom;
        }

        return Promise.all(mainPromises).then((results) => {
            const [data, custom] = results;

            console.log(`Serializing documentation with format version ${Documentation.FORMAT_VERSION}...`);

            const docs = new Documentation(data as Item[], custom);

            let output = JSON.stringify(docs.serialize(), undefined, config.spaces);

            if (config.compress) {
                console.log("Compressing...");
                output = require("zlib").deflateSync(output).toString("utf8");
            }

            if (config.output) {
                console.log(`Writing to ${config.output}...`);
                fs.writeFileSync(config.output, output);
            }

            console.log("Done!");

            process.exit(0);
        });
    } catch (err) {
        console.error(err);

        process.exit(1);
    }
})();
