import yargs from "yargs";

const config = (yargs
    .usage("$0 [command] [options]")
    .example("$0 --source src --custom docs --output docs/docs.json", "")
    .example("$0 --config docgen.yml", "Runs the generator using a config file")
    .example("$0 completion", "Outputs Bash completion script")
    .option("source", {
        type: "array",
        alias: ["s", "i"],
        describe: "Source directories to parse JSDocs in",
        demand: true,
        normalize: true,
    })
    .option("custom", {
        type: "string",
        alias: "c",
        describe: "Custom docs definition file to use",
        normalize: true,
    })
    .option("root", {
        type: "string",
        alias: "r",
        describe: "Root directory of the project",
        normalize: true,
        default: ".",
    })
    .option("output", {
        type: "string",
        alias: "o",
        describe: "Path to output file",
        normalize: true,
    })
    .option("spaces", {
        type: "number",
        alias: "S",
        describe: "Number of spaces to use in output JSON",
        default: 0,
    })
    .option("jsdoc", {
        type: "string",
        alias: "j",
        describe: "Path to JSDoc config file",
        normalize: true,
    })
    .option("verbose", {
        type: "boolean",
        alias: "V",
        describe: "Logs extra information to the console",
        default: false,
    })

    .option("config", {
        type: "string",
        alias: "C",
        describe: "Path to JSON/YAML config file",
        group: "Special:",
        normalize: true,
        config: true,
        configParser: (configFile) => {
            const extension = require("path").extname(configFile).toLowerCase();
            if (extension === ".json") {
                return JSON.parse(require("fs").readFileSync(configFile));
            } else if (extension === ".yml" || extension === ".yaml") {
                return require("js-yaml").safeLoad(require("fs").readFileSync(configFile));
            }
            throw new Error("Unknown config file type.");
        },
    })
    .help()
    .alias("help", "h")
    .group("help", "Special:")
    .version("1.0.0")
    .alias("version", "v")
    .group("version", "Special:")
    .completion("completion")
    .wrap(yargs.terminalWidth()).argv as unknown) as {
    [x: string]: unknown;
    source: string[];
    custom: string | undefined;
    root: string;
    output: string | undefined;
    spaces: number;
    jsdoc: string | undefined;
    verbose: boolean;
    config: string | undefined;
    _: (string | number)[];
    $0: string;
};

export default config;
