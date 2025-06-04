import { FormOption } from "../models/form-question.model";

export const YES_OR_NO_LIST = [
  { code: 'Yes', name: 'Yes' },
  { code: 'No', name: 'No' },
];

export const YesOrNoListOptions: FormOption[] = YES_OR_NO_LIST.map(item => ({
  label: item.name,
  value: item.code
}));
