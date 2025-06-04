import { FormOption } from "../models/form-question.model";

export const ANIMAL_TYPES = [
  { code: 'lion', name: 'Lion' },
  { code: 'tiger', name: 'Tiger' },
  { code: 'zebra', name: 'Zebra' },
];

export const AnimalTypesOptions: FormOption[] = ANIMAL_TYPES.map(item => ({
  label: item.name,
  value: item.code
}));
