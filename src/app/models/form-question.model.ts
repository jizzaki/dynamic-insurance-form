import { ValidatorFn } from "@angular/forms";
import { ConditionalOperator } from "../enums/conditional-operator";
import { MathOperands } from "../enums/math-operands";

export interface FormQuestion {
  key: string;
  label: string;
  type: 'text' | 'radio' | 'textarea' | 'select' | 'group' | 'checkbox-group' | 'number';
  options?: string[];
  children?: FormQuestion[]; // nested dynamic questions
  conditionalOn?: ConditionalOn;
  validators?: any[];
  onBlur?: string;
  multiple?: boolean; // for checkbox-group
  mask?: string;
  inputType?: string; // for things like 'email', 'tel', etc.
  directive?: string; // for custom directives if needed
  disabled?: boolean;
  min?: number;  // Minimum number length
  max?: number;  // Maximum number length
  math?: Math;        // Optional math-related metadata
}

export interface FormSection {
  title?: string;
  questions: FormQuestion[];
  conditionalOn?: ConditionalOn;
  repeatFor?: { key: string };
}

export interface FormPage {
  title: string;
  sections: FormSection[];
}

export interface ConditionalOn {
  key?: string;
  value?: any;
  operator?: ConditionalOperator;
  conditions?: ConditionalOn[];
}

export interface Math {
  operation?: MathOperands;
  dependsOn?: string[];
}