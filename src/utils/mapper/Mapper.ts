export function mapToDto<Entity, Dto>(entity: Entity, dtoClass: new () => Dto): Dto {
  const dto = new dtoClass();
  const fields: string[] = Reflect.getMetadata('fields', dtoClass.prototype) || [];
  const fieldTypes: { [key: string]: any } = Reflect.getMetadata('fieldTypes', dtoClass.prototype) || {};


  fields.forEach((field) => {
    if (entity.hasOwnProperty(field)) {
      const fieldType = fieldTypes[field];
      if (fieldType && fieldType !== Number && fieldType !== String && fieldType !== Boolean && fieldType !== Array) {
        (dto as any)[field] = mapToDto((entity as any)[field], fieldType);
      } else {
        (dto as any)[field] = (entity as any)[field];
      }
    }
  });

  return dto;
}