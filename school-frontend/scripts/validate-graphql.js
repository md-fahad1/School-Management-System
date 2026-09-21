#!/usr/bin/env node
/**
 * Checks every GraphQL document in the frontend against the backend's real
 * schema, so mistakes are caught before a page silently shows "no data".
 * (Typos in a field name, Float vs Int, unknown arguments, ...)
 *
 * Usage (from the frontend folder):
 *   npm run validate:gql
 *   SCHEMA_PATH=../backend/src/schema.gql npm run validate:gql
 *
 * The backend regenerates src/schema.gql every time it starts, so run the
 * backend once after changing any resolver, then run this.
 *
 * What it checks: gql`...` template strings, and `mutation(...)` strings such
 * as those in FormModal. Documents built with ${...} interpolation are skipped.
 */
const fs = require("fs");
const path = require("path");
const { buildSchema, parse, validate } = require("graphql");

const schemaPath = path.resolve(process.env.SCHEMA_PATH || process.argv[2] || "../backend/src/schema.gql");
if (!fs.existsSync(schemaPath)) {
  console.error(`Schema not found: ${schemaPath}\nSet SCHEMA_PATH or pass the path as the first argument.`);
  process.exit(2);
}
const schema = buildSchema(fs.readFileSync(schemaPath, "utf8"));

const files = [];
(function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (/\.(ts|tsx|js|jsx)$/.test(name)) files.push(p);
  }
})("src");

const re = /(?:gql`\s*|`\s*(?=mutation\s*\())((?:query|mutation)\b[\s\S]*?)`/g;
let total = 0;
let problems = 0;

for (const file of files) {
  const src = fs.readFileSync(file, "utf8").replace(/\r/g, "");
  let m;
  while ((m = re.exec(src))) {
    const text = m[1];
    if (text.includes("${")) continue;
    total++;
    const name = (text.match(/(?:query|mutation)\s+(\w+)/) || [])[1] || text.slice(0, 40).replace(/\s+/g, " ");
    let doc;
    try {
      doc = parse(text);
    } catch (e) {
      problems++;
      console.log(`SYNTAX   ${file}  (${name})\n         ${e.message}`);
      continue;
    }
    const errors = validate(schema, doc);
    if (errors.length) {
      problems++;
      console.log(`INVALID  ${file}  (${name})\n         ${errors.map((e) => e.message).join("\n         ")}`);
    }
  }
}

console.log(`\n${total} GraphQL documents checked, ${problems} with problems.`);
process.exit(problems ? 1 : 0);