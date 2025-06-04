import { FormOption } from "../models/form-question.model";

export enum YesNo {
  Yes,
  No,
}

export const YesNoMap = new Map<YesNo, string>([
  [YesNo.Yes, 'Yes'],
  [YesNo.No, 'No'],
]);

export const YesNoOptions: FormOption[] = Array.from(YesNoMap.entries()).map(
  ([key, value]) => ({
    label: value,
    value: key
  })
);
