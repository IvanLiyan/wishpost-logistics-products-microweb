import * as astUtil from "./ast-util";
import tplLoader from "./tpl-loader";
import program from "commander";
import fs from "fs";
import * as ts from "typescript";
import * as svelte from "svelte/compiler";
import sveltePreprocess from "svelte-preprocess";
import * as compiler from "vue-template-compiler";

function commaSeparatedList(value, dummyPrevious) {
  return value.split(",");
}

function exit(message: string) {
  console.error(message);
  process.exit(1);
}

type TranslationEntry = {
  type: string;
  file_name: string;
  arguments: Array<string>;
};

program
  .option("-f, --files <string>", "files to extract", commaSeparatedList)
  .option("-a, --allowInferences <string>", "allow jsx inferences", "true");

program.parse(process.argv);

const allowInferences = program.allowInferences === "true";

(async () => {
  const files: Array<string> = program.files || [];

  if (files.length <= 0) {
    exit(`Error: need to provide files`);
    return;
  }

  let entries: Array<TranslationEntry> = [];

  for (const filePath of files) {
    const data = fs.readFileSync(filePath);
    if (!data) {
      exit(`Cannot read file: ${filePath}`);
      return;
    }

    let dataString = filePath.endsWith(".html")
      ? tplLoader(data.toString())
      : data.toString();

    if (filePath.endsWith('.vue')) {
      let render = compiler.compile(dataString).render; // <template> part
      let script = compiler.parseComponent(dataString).script.content; // <script> part
      dataString = render + '\n' + script;
    }

    if (filePath.endsWith(".ts") || filePath.endsWith(".tsx")) {
      dataString = ts.transpileModule(dataString, {
        compilerOptions: {
          target: ts.ScriptTarget.ES2015,
          jsx: filePath.endsWith(".tsx") ? ts.JsxEmit.Preserve : ts.JsxEmit.None
        }
      }).outputText;
    } else if (filePath.endsWith(".svelte")) {
      dataString = svelte.compile(
        (
          await svelte.preprocess(dataString, sveltePreprocess(), {
            filename: filePath
          })
        ).code,
        { generate: "ssr" }
      ).js.code;
    }

    let ast = null;
    try {
      ast = astUtil.parse(dataString);
    } catch (error) {
      exit(`Error parsing ${filePath}: ${error}`);
      return;
    }

    for (const entry of astUtil.infer(ast, allowInferences)) {
      const { expr, type } = entry;
      let { stringArgs } = entry;
      if (!stringArgs) {
        continue;
      }

      stringArgs = stringArgs.map(str => str.replace(/\n/g, "\\n"));

      const string = stringArgs[0];
      entries = [
        ...entries,
        {
          type,
          file_name: filePath,
          arguments: stringArgs
        }
      ];
    }
  }

  console.log(
    JSON.stringify({
      strings: entries
    })
  );
})().catch(exit);

//./node_modules/.bin/ts-node extract.ts  -f ~/ContextLogic/clroot/sweeper/merchant_dashboard/static/js/lego/component/tax/TaxReportsCard.js
