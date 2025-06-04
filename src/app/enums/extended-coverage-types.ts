import { FormOption } from "../models/form-question.model";

export enum ExtendedCoverageTypes {
  Dental,
  Vision,
  Injury,
  Transport,
}

export const ExtendedCoverageTypesMap = new Map<ExtendedCoverageTypes, string>([
  [ExtendedCoverageTypes.Dental, 'Dental'],
  [ExtendedCoverageTypes.Vision, 'Vision'],
  [ExtendedCoverageTypes.Injury, 'Injury'],
  [ExtendedCoverageTypes.Transport, 'Transport'],
]);


export const ExtendedCoverageTypesOptions: FormOption[] = Array.from(ExtendedCoverageTypesMap.entries()).map(
  ([key, value]) => ({
    label: value,
    value: key
  })
);
