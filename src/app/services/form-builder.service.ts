import { Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ConditionalOn, FormQuestion, FormSection } from '../models/form-question.model';
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
    const isVisible = item.conditionalOn ? this.evaluateConditionalOn(item.conditionalOn, form) : true;

    if (item.key) {
      const control = form.get(item.key);

      if (control) {
        if (isVisible) {
          if (!item.disabled) control.enable({ emitEvent: false });
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
    const isVisible = section.conditionalOn ? this.evaluateConditionalOn(section.conditionalOn, form) : true;

    // If not visible, clear and disable all controls in this section
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

  evaluateCondition(
    value: any,
    expected: any,
    operator: ConditionalOperator,
    evaluateNested?: (c: ConditionalOn) => boolean
  ): boolean {
    const valueNum = Number(value);
    const expectedNum = Number(expected);

    // Defer evaluation if value is not yet filled
    if (
      [ConditionalOperator.Equals, ConditionalOperator.NotEquals,
      ConditionalOperator.GreaterThan, ConditionalOperator.GreaterThanOrEqual,
      ConditionalOperator.LessThan, ConditionalOperator.LessThanOrEqual].includes(operator)
      && (value === undefined || value === null || value === '')
    ) {
      console.warn('Skipping condition due to missing value:', { value, expected, operator });
      return false;
    }

    switch (operator) {
      case ConditionalOperator.Equals:
        return value === expected;
      case ConditionalOperator.NotEquals:
        return value !== expected;
      case ConditionalOperator.GreaterThan:
        return valueNum > expectedNum;
      case ConditionalOperator.LessThan:
        return valueNum < expectedNum;
      case ConditionalOperator.GreaterThanOrEqual:
        return valueNum >= expectedNum;
      case ConditionalOperator.LessThanOrEqual:
        return valueNum <= expectedNum;
      case ConditionalOperator.In:
        return Array.isArray(expected) && expected.includes(value);
      case ConditionalOperator.Any:
        return Array.isArray(value) && Array.isArray(expected) && value.some(v => expected.includes(v));
      case ConditionalOperator.All:
        return Array.isArray(value) && Array.isArray(expected) && expected.every(v => value.includes(v));
      case ConditionalOperator.IsTruthy:
        return !!value;
      case ConditionalOperator.Not:
        return !value;
      default:
        return value === expected;
    }
  }


  evaluateConditionalOn(cond: ConditionalOn, form: FormGroup): boolean {
    const operator = cond.operator ?? ConditionalOperator.Equals;

    if (operator === ConditionalOperator.All || operator === ConditionalOperator.Any) {
      if (!cond.conditions || cond.conditions.length === 0) return true;

      // Check if all dependent controls have values
      const allHaveValues = cond.conditions.every(c => {
        if (c.key) {
          const val = form.get(c.key)?.value;
          return val !== undefined && val !== null && val !== '';
        }
        return true; // nested conditions
      });

      if (!allHaveValues) return false;

      const results = cond.conditions.map(c => this.evaluateConditionalOn(c, form));
      return operator === ConditionalOperator.All ? results.every(Boolean) : results.some(Boolean);
    }


    if (operator === ConditionalOperator.Not) {
      const inner = cond.conditions?.[0];
      if (!inner) return false;

      // Recursively check all nested conditions have values
      const allKeysHaveValues = this.hasAllKeysFilled(inner, form);
      if (!allKeysHaveValues) return false;

      return !this.evaluateConditionalOn(inner, form);
    }

    // Delay evaluation if value is empty
    if (cond.key) {
      const value = form.get(cond.key)?.value;
      if (value === undefined || value === null || value === '') {
        // Don't evaluate yet
        return false;
      }

      return this.evaluateCondition(value, cond.value, cond.operator);
    }

    return true;
  }

  getRepeatArray(count: number): number[] {
    return Array.from({ length: count }, (_, i) => i);
  }

  private hasAllKeysFilled(cond: ConditionalOn, form: FormGroup): boolean {
    if (cond.key) {
      const val = form.get(cond.key)?.value;
      return val !== undefined && val !== null && val !== '';
    }

    if (cond.conditions?.length) {
      return cond.conditions.every(c => this.hasAllKeysFilled(c, form));
    }

    return true;
  }

} 