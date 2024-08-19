export function mapToDto<Entity, Dto>(entity: Entity, dtoClass: new () => Dto): Dto {
  const dto = new dtoClass();
  const fields: string[] = Reflect.getMetadata('fields', dtoClass.prototype) || [];
  const fieldTypes: { [key: string]: any } = Reflect.getMetadata('fieldTypes', dtoClass.prototype) || {};

  fields.forEach((field) => {
    if (entity.hasOwnProperty(field)) {
      const fieldType = fieldTypes[field];
      const fieldValue = (entity as any)[field];

      if (fieldType && fieldType !== Number && fieldType !== String && fieldType !== Boolean && fieldType !== Array) {
        (dto as any)[field] = mapToDto(fieldValue, fieldType);
      } else if (fieldValue instanceof Date) {
        (dto as any)[field] = fieldValue.toLocaleString();
      } else {
        (dto as any)[field] = fieldValue;
      }
    }
  });

  return dto;
}