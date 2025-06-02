import { Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { FormQuestion } from '../models/form-question.model';

@Injectable({ providedIn: 'root' })
export class FormBuilderService {
  constructor(private fb: FormBuilder) { }

  buildForm(sections: any[], form?: FormGroup): FormGroup {
    const group: Record<string, FormControl> = {};

    for (const section of sections) {
      // ✅ Skip if section.questions is not an array
      if (!Array.isArray(section.questions)) {
        console.warn('Invalid section.questions:', section);
        continue;
      }

      if (section.repeatFor) {
        const repeatCount = form?.get(section.repeatFor.key)?.value || 0;

        for (let i = 0; i < repeatCount; i++) {
          for (const question of section.questions) {
            const key = `${question.key}_${i}`;
            const initialValue = question.type === 'checkbox-group' ? [] : null;

            group[key] = new FormControl(
              { value: initialValue, disabled: !!question.conditionalOn },
              question.validators || []
            );

            if (question.children) {
              const childGroup = this.buildForm([{ questions: question.children }]);
              Object.keys(childGroup.controls).forEach(childKey => {
                group[`${childKey}_${i}`] = childGroup.get(childKey) as FormControl;
              });
            }
          }
        }
      } else {
        for (const question of section.questions) {
          const initialValue = question.type === 'checkbox-group' ? [] : null;

          group[question.key] = new FormControl(
            { value: initialValue, disabled: !!question.conditionalOn },
            question.validators || []
          );

          if (question.children) {
            const childGroup = this.buildForm([{ questions: question.children }]);
            Object.assign(group, childGroup.controls);
          }
        }
      }
    }

    return this.fb.group(group);
  }


  buildFormOld(questions: FormQuestion[]): FormGroup {
    const group: Record<string, FormControl> = {};

    for (const question of questions) {
      const validators = question.validators || [];
      const initialValue = question.type === 'checkbox-group' ? [] : null;

      group[question.key] = new FormControl(
        { value: initialValue, disabled: !!question.conditionalOn },
        validators
      );

      if (question.children) {
        const childrenGroup = this.buildForm(question.children);
        Object.assign(group, childrenGroup.controls);
      }
    }

    return this.fb.group(group);
  }

  isVisible(
    item: {
      key?: string;
      conditionalOn?: { key: string; value: any };
      validators?: any[];
      children?: any[];
    },
    form: FormGroup
  ): boolean {

    // Evaluate visibility based on conditional parent
    let isVisible = true;

    if (item.conditionalOn) {
      const parentControl = form.get(item.conditionalOn.key);
      isVisible = parentControl?.value === item.conditionalOn.value;
    }

    // Only apply form control logic if this item has a key (i.e., it's a question)
    if (item.key) {
      const control = form.get(item.key);

      if (control) {
        if (isVisible) {
          control.enable({ emitEvent: false });
          if (item.validators?.length) {
            control.setValidators(item.validators);
          }
        } else {
          control.clearValidators();
          control.setValue(null);
          control.disable({ emitEvent: false });
        }

        control.updateValueAndValidity({ emitEvent: false });
      }
    }

    // Recursively evaluate children
    if (item.children?.length) {
      item.children.forEach(child => this.isVisible(child, form));
    }

    return isVisible;
  }

  isSectionVisible(
    section: { conditionalOn?: { key: string; value: any }; questions: any[] },
    form: FormGroup
  ): boolean {
    if (!section.conditionalOn) return true;

    const parentControl = form.get(section.conditionalOn.key);
    const isVisible = parentControl?.value === section.conditionalOn.value;

    // If section is not visible, disable all its questions
    if (!isVisible) {
      section.questions.forEach(q => {
        const control = form.get(q.key);
        if (control) {
          control.setValue(null);
          control.clearValidators();
          control.disable({ emitEvent: false });
          control.updateValueAndValidity({ emitEvent: false });
        }
      });
    }

    return isVisible;
  }

  getRepeatArray(count: number): number[] {
    return Array.from({ length: count }, (_, i) => i);
  }

} 