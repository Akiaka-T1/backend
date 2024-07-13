import 'reflect-metadata';

export function Field(target: any, key: string) {
  const fields = Reflect.getMetadata('fields', target) || [];
  const fieldTypes = Reflect.getMetadata('fieldTypes', target) || {};

  fields.push(key);
  fieldTypes[key] = Reflect.getMetadata('design:type', target, key);

  Reflect.defineMetadata('fields', fields, target);
  Reflect.defineMetadata('fieldTypes', fieldTypes, target);
}
