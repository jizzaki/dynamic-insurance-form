import { Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { FormQuestion, FormSection } from '../models/form-question.model';
import { ConditionalOperator } from '../enums/conditional-operator';

@Injectable({ providedIn: 'root' })
export class FormBuilderService {
  constructor(private fb: FormBuilder) { }

  buildForm(sections: any[], form?: FormGroup): FormGroup {
    const group: Record<string, FormControl> = {};

    for (const section of sections) {
      // Skip if section.questions is not an array
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
              { value: initialValue, disabled: !!question.conditionalOn || !!question.disabled },
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
            { value: initialValue, disabled: !!question.conditionalOn || !!question.disabled },
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

  isVisible(item: FormQuestion, form: FormGroup): boolean {
    let isVisible = true;

    if (item.conditionalOn) {
      const parentControl = form.get(item.conditionalOn.key);
      const value = parentControl?.value;
      const expected = item.conditionalOn.value;
      const operator = item.conditionalOn.operator ?? 'equals';

      switch (operator) {
        case ConditionalOperator.Equals:
          isVisible = value === expected;
          break;
        case ConditionalOperator.NotEquals:
          isVisible = value !== expected;
          break;
        case ConditionalOperator.GreaterThan:
          isVisible = value > expected;
          break;
        case ConditionalOperator.LessThan:
          isVisible = value < expected;
          break;
        case ConditionalOperator.GreaterThanOrEqual:
          isVisible = value >= expected;
          break;
        case ConditionalOperator.LessThanOrEqual:
          isVisible = value <= expected;
          break;
        default:
          isVisible = value === expected;
          break;
      }

    }

    if (item.key) {
      const control = form.get(item.key);

      if (control) {
        if (isVisible) {
          if (!item.disabled) {
            control.enable({ emitEvent: false });
          }
        } else {
          control.disable({ emitEvent: false });
        }

        if (item.validators?.length && !item.disabled) {
          control.setValidators(item.validators);
        } else {
          control.clearValidators();
        }

        control.updateValueAndValidity({ emitEvent: false });
      }
    }

    // Recurse on children
    if (item.children?.length) {
      item.children.forEach(child => this.isVisible(child, form));
    }

    return isVisible;
  }


  isSectionVisible(section: FormSection, form: FormGroup): boolean {
    if (!section.conditionalOn) return true;

    const control = form.get(section.conditionalOn.key);
    const value = control?.value;
    const expected = section.conditionalOn.value;
    const operator = section.conditionalOn.operator ?? 'equals';

    // Coerce to number for math comparisons
    const valueNum = Number(value);
    const expectedNum = Number(expected);

    let isVisible = true;

    switch (operator) {
      case ConditionalOperator.Equals:
        isVisible = value === expected;
        break;
      case ConditionalOperator.NotEquals:
        isVisible = value !== expected;
        break;
      case ConditionalOperator.GreaterThan:
        isVisible = valueNum > expectedNum;
        break;
      case ConditionalOperator.LessThan:
        isVisible = valueNum < expectedNum;
        break;
      case ConditionalOperator.GreaterThanOrEqual:
        isVisible = valueNum >= expectedNum;
        break;
      case ConditionalOperator.LessThanOrEqual:
        isVisible = valueNum <= expectedNum;
        break;
      default:
        isVisible = value === expected;
        break;
    }

    // If section is not visible, clear and disable all its controls
    if (!isVisible) {
      section.questions.forEach(q => {
        const ctrl = form.get(q.key);
        if (ctrl) {
          ctrl.setValue(null);
          ctrl.clearValidators();
          ctrl.disable({ emitEvent: false });
          ctrl.updateValueAndValidity({ emitEvent: false });
        }
      });
    }

    return isVisible;
  }

  getRepeatArray(count: number): number[] {
    return Array.from({ length: count }, (_, i) => i);
  }

} 