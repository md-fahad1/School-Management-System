// Zero-dependency stand-in for graphql-request's `gql` tag. It only
// exists for syntax-highlighting/tooling — no runtime GraphQL parsing
// happens here — so we don't need to pull in graphql-request (and its
// cross-fetch/node-fetch/whatwg-url/tr46 dependency chain) just to use
// this one tiny helper in client-side code.
export function gql(strings: TemplateStringsArray, ...values: unknown[]): string {
  return strings.reduce(
    (result, str, i) => result + str + (i < values.length ? String(values[i]) : ""),
    "",
  );
}