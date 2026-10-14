export function getMongooseEnumOptions(schema, pathName) {
  const path = schema.path(pathName);

  if (!path) {
    throw new Error(`Path "${pathName}" does not exist on the provided schema.`);
  }

  // Handle standard enum arrays and array-wrapped enum casters
  const enumValues = path.enumValues || (path.caster && path.caster.enumValues);

  if (!enumValues || enumValues.length === 0) {
    throw new Error(`Path "${pathName}" is not configured with a valid Mongoose enum validator.`);
  }

  return enumValues.map((val) => ({
    value: val,
    label: val.charAt(0).toUpperCase() + val.slice(1).replace(/[-_]/g, ' '), // Capitalize and clean up spacers
  }));
}
