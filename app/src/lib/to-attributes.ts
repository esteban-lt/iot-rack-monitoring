export const toAttributes = (attributes: { key: string; value: unknown }[]) => {
  return Object.fromEntries(attributes.map((attribute) => [attribute.key, attribute.value]));
}
