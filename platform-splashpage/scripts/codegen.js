const fs = require("fs");

const topLine = `// Generated Code -- DO NOT EDIT`;
const filePath = "src/providers.ts";
const modPath = "node_modules/next-auth/src/providers";

/** @type {function(string): string} */
function toPascalCase(s) {
  return s
    .replace(/(\w)(\w*)/g, function (_, g1, g2) {
      return g1.toUpperCase() + g2.toLowerCase();
    })
    .toString();
}

const records = [];
const imports = [];

for (const v of fs.readdirSync(modPath)) {
  let key = v.toString().replace(".ts", "").replace(".js", "");
  if (key === "index") {
    continue;
  }

  try {
    if (require(`next-auth/providers/${key}`).default === undefined) {
      throw new Error("No default export");
    }
  } catch (e) {
    console.log("Skipping mod", key);
    continue;
  }

  let def = toPascalCase(key + "-provider").replace(new RegExp("-", "g"), "");
  if (new RegExp("^\\d+").test(def)) {
    def = "_" + def;
  }

  if (key.includes("-")) {
    records.push(`  "${key}": ${def},`);
  } else {
    records.push(`  ${key}: ${def},`);
  }

  imports.push(
    `import { default as ${def} } from "next-auth/providers/${key}";`
  );
}

const template = `${topLine}
import 'server-only'
${imports.join("\n")}

const Providers = {
${records.join("\n")}
};

export type TProviders = typeof Providers;

export default Providers;
`;

fs.writeFileSync(filePath, template);
