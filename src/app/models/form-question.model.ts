import { ValidatorFn } from "@angular/forms";
import { ConditionalOperator } from "../enums/conditional-operator";
import { MathOperands } from "../enums/math-operands";

export interface FormPage {
  title: string;
  sections: FormSection[];
}

export interface FormSection {
  title?: string;
  questions: FormQuestion[];
  conditionalOn?: ConditionalOn;
  repeatFor?: { key: string };
}


export interface FormQuestion {
  key: string;
  label: string;
  type: 'text' | 'radio' | 'textarea' | 'select' | 'group' | 'checkbox-group' | 'number';
  options?: FormOption[];
  children?: FormQuestion[]; // Nested dynamic questions
  conditionalOn?: ConditionalOn;
  validators?: any[];
  onBlur?: string;
  multiple?: boolean; // For checkbox-group
  mask?: string;
  inputType?: string; // For things like 'email', 'tel', etc.
  directive?: string; // For custom directives if needed
  disabled?: boolean;
  min?: number;       // Minimum number length
  max?: number;       // Maximum number length
  math?: Math;        // Optional math-related metadata
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

export interface FormOption {
  label: string;
  value: string | number | boolean;
}