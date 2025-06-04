import { FormOption } from "../models/form-question.model";

export enum AnimalTypes {
  Lion,
  Tiger,
  Zebra
}

export const AnimalTypesMap = new Map<AnimalTypes, string>([
  [AnimalTypes.Lion, 'Lion'],
  [AnimalTypes.Tiger, 'Tiger'],
  [AnimalTypes.Zebra, 'Zebra'],
]);

export const AnimalTypesOptions: FormOption[] = Array.from(AnimalTypesMap.entries()).map(
  ([key, value]) => ({
    label: value,
    value: key
  })
);
