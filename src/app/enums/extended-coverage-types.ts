import { FormOption } from "../models/form-question.model";

export const EXTENDED_COVERAGE_TYPES = [
  { code: 'dental', name: 'Dental' },
  { code: 'vision', name: 'Vision' },
  { code: 'injury', name: 'Injury' },
  { code: 'transport', name: 'Transport' },
];

export const ExtendedCoverageTypesOptions: FormOption[] = EXTENDED_COVERAGE_TYPES.map(item => ({
  label: item.name,
  value: item.code
}));
