export interface FormQuestion {
  key: string;
  label: string;
  type: 'text' | 'radio' | 'textarea' | 'select' | 'group' | 'checkbox-group' | 'number';
  options?: string[];
  children?: FormQuestion[]; // nested dynamic questions
  conditionalOn?: {
    key: string;
    value: any;
  };
  validators?: any[];
  onBlur?: string;
  multiple?: boolean; // for checkbox-group
  mask?: string;
  inputType?: string; // for things like 'email', 'tel', etc.
  directive?: string; // for custom directives if needed
  disabled?: boolean;
}

export interface FormSection {
  title: string;
  questions: FormQuestion[];
  conditionalOn?: {
    key: string;
    value: any;
  };
  repeatFor?: { key: string };
}

export interface FormPage {
  title: string;
  sections: FormSection[];
}
