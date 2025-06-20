import { Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ConditionalOn, FormPage, FormQuestion, FormSection, Math } from '../models/form-question.model';
import { ConditionalOperator } from '../enums/conditional-operator';
import { MathOperands } from '../enums/math-operands';
import { Subject } from 'rxjs';


@Injectable({ providedIn: 'root' })
export class FormEngineService {
  pageVisited$ = new Subject<number>();
  pageValidated$ = new Subject<number>();
  // ====================================================================
  // Author: Eric Tijerina eric@liftrtech.com
  // =   Core Form Engine Service Logic   =
  // ====================================================================
  constructor(private fb: FormBuilder) { }

  /** Builds a dynamic reactive FormGroup from FormPages or Sections. */
  buildForm(pages: FormPage[]): FormGroup;
  buildForm(sections: FormSection[]): FormGroup;
  buildForm(input: FormPage[] | FormSection[]): FormGroup {
    const group: Record<string, FormControl> = {};
    const form = new FormGroup({});
    const isPages = this.isFormPageArray(input);
    const formPages: FormPage[] = isPages ? (input as FormPage[]) : [];
    const sections: FormSection[] = isPages ? formPages.flatMap(p => p.sections) : (input as FormSection[]);

    // Step 1: Initialize controls
    for (const section of sections) {
      if (!Array.isArray(section.questions)) continue;
      section.repeatFor ? this.initializeRepeatableSection(group, section, form) : this.initializeFlatSection(group, section);
    }

    const formGroup = this.fb.group(group);

    // Step 2: Setup math watchers
    sections.forEach(section => {
      if (!section.repeatFor) {
        section.questions.forEach(q => q.math?.dependsOn?.length && this.setupMathWatchers(formGroup, q));
      }
    });

    // Step 3: Setup repeat section watchers
    formPages.forEach(page => {
      page.sections.filter(s => s.repeatFor?.key && s.questions).forEach(section => this.setupRepeatWatcher(formGroup, section));
    });

    // Step 4: Initial visibility
    this.evaluateInitialVisibility(sections, formGroup);
    return formGroup;
  }

  /** Validates visible fields for either current or all pages depending on index. */
  validateForm(form: FormGroup, pages: FormPage[], currentPageIndex: number) {
    const targetPages = currentPageIndex === pages.length - 1 ? pages : [pages[currentPageIndex]];
    const invalidKeys: string[] = [];
    targetPages.forEach(p => p.sections.forEach(s => this.processSectionQuestions(s, form, invalidKeys)));
    return { isValid: invalidKeys.length === 0, invalidKeys };
  }

  /** Determines and applies visibility of a question and its children. */
  isVisible(item: FormQuestion, form: FormGroup, parentVisible = true): boolean {
    const selfVisible = item.conditionalOn ? this.evaluateConditionalOn(item.conditionalOn, form) : true;
    /** Determines and applies visibility of a question and its children. */
    const isVisible = selfVisible && parentVisible;
    const control = item.key ? form.get(item.key) : null;

    if (control) {
      // Cache original validators once
      if (!(control as any)._originalValidators) {
        (control as any)._originalValidators = control.validator ? [control.validator] : [];
      }

      /** Determines and applies visibility of a question and its children. */
      if (isVisible) {
        control.setValidators((control as any)._originalValidators);
        control.enable({ emitEvent: false });
      } else {
        control.clearValidators();
        control.disable({ emitEvent: false });
      }

      control.updateValueAndValidity({ emitEvent: false });
    }

    // Recurse on children
    if (item.children?.length) {
      /** Determines and applies visibility of a question and its children. */
      item.children.forEach(child => this.isVisible(child, form, isVisible));
    }

    /** Determines and applies visibility of a question and its children. */
    return isVisible;
  }

  /** Determines visibility of an entire section and clears values if hidden. */
  isSectionVisible(section: FormSection, form: FormGroup): boolean {
    /** Determines and applies visibility of a question and its children. */
    const isVisible = section.conditionalOn ? this.evaluateConditionalOn(section.conditionalOn, form) : true;

    // If not visible, clear and disable all controls in this section
    /** Determines and applies visibility of a question and its children. */
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

    /** Determines and applies visibility of a question and its children. */
    return isVisible;
  }

  getRepeatArray(count: number): number[] {
    return Array.from({ length: count }, (_, i) => i);
  }

  /** Adds or removes a value from a checkbox group control. */
  toggleCheckboxValue(form: FormGroup, key: string, value: string): void {
    const control = form.get(key);
    if (!control) return;

    const current: string[] = control.value || [];
    if (current.includes(value)) {
      control.setValue(current.filter(v => v !== value));
    } else {
      control.setValue([...current, value]);
    }
  }

  emitPageVisited(index: number): void {
    this.pageVisited$.next(index);
  }

  emitPageValidated(index: number): void {
    this.pageValidated$.next(index);
  }

  private isFormPageArray(input: any[]): input is FormPage[] {
    return input.length > 0 &&
      input.every(p => typeof p === 'object' && 'sections' in p && Array.isArray(p.sections));
  }

  private initializeRepeatableSection(group: Record<string, FormControl>, section: FormSection, form?: FormGroup): void {
    const repeatCount = form?.get(section.repeatFor!.key)?.value || 0;

    for (let i = 0; i < repeatCount; i++) {
      for (const question of section.questions) {
        const key = `${question.key}_${i}`;
        group[key] = this.initializeQuestionControl(question);

        // Handle nested children
        if (question.children) {
          /** Builds a dynamic reactive FormGroup from FormPages or Sections. */
          const childGroup = this.buildForm([{ questions: question.children } as FormSection]);
          Object.keys(childGroup.controls).forEach(childKey => {
            group[`${childKey}_${i}`] = childGroup.get(childKey) as FormControl;
          });
        }
      }
    }
  }

  private initializeQuestionControl(question: FormQuestion): FormControl {
    const initialValue = question.type === 'checkbox-group' ? [] : null;
    const validators = question.validators ? [...question.validators] : [];

    const control = new FormControl(
      { value: initialValue, disabled: !!question.conditionalOn || !!question.disabled },
      validators
    );

    // Cache validators for visibility toggling
    (control as any)._originalValidators = validators;

    return control;
  }

  private initializeFlatSection(group: Record<string, FormControl>, section: FormSection): void {
    for (const question of section.questions) {
      group[question.key] = this.initializeQuestionControl(question);

      // Ensure math dependencies are initialized
      if (question.math?.dependsOn?.length) {
        question.math.dependsOn.forEach(depKey => {
          if (!group[depKey]) {
            group[depKey] = new FormControl(null);
          }
        });
      }

      // Handle nested children
      if (question.children) {
        /** Builds a dynamic reactive FormGroup from FormPages or Sections. */
        const childGroup = this.buildForm([{ questions: question.children } as FormSection]);
        Object.assign(group, childGroup.controls);
      }
    }
  }


  // =================================================================================
  // =     Helper Methods     =
  // =================================================================================
  private setupMathWatchers(form: FormGroup, question: FormQuestion): void {
    const updateComputedValue = () => {
      const newValue = this.computeMathValue(form, question.math!);
      form.get(question.key)?.setValue(newValue, { emitEvent: true });
      form.get(question.key)?.updateValueAndValidity();
    };

    question.math!.dependsOn.forEach(depKey => {
      form.get(depKey)?.valueChanges.subscribe(updateComputedValue);
    });

    updateComputedValue(); // Initialize
  }

  /** Watches repeat control value and dynamically adjusts repeat section controls. */
  private setupRepeatWatcher(formGroup: FormGroup, section: FormSection): void {
    const repeatKey = section.repeatFor!.key;
    const repeatControl = formGroup.get(repeatKey);
    if (!repeatControl) return;

    repeatControl.valueChanges.subscribe(count => this.handleRepeatSection(formGroup, section, count));
    if (repeatControl.value) this.handleRepeatSection(formGroup, section, repeatControl.value);
  }

  private evaluateInitialVisibility(sections: FormSection[], formGroup: FormGroup) {

    // Step 5: Evaluate initial visibility across all questions
    sections.forEach(section => {
      section.questions.forEach(q => {
        const sectionVisible = section.conditionalOn
          ? this.evaluateConditionalOn(section.conditionalOn, formGroup)
          : true;

        /** Determines and applies visibility of a question and its children. */
        this.isVisible(q, formGroup, sectionVisible);
      });
    });

  }

  private computeMathValue(form: FormGroup, math: Math): number {
    const values = math.dependsOn.map(key => Number(form.get(key)?.value || 0));
    switch (math.operation) {
      case MathOperands.Sum:
        return values.reduce((acc, val) => acc + val, 0);
      case MathOperands.Subtract:
        return values.reduce((acc, val) => acc - val);
      case MathOperands.Multiply:
        return values.reduce((acc, val) => acc * val, 1);
      case MathOperands.Divide:
        return values.reduce((acc, val) => acc / (val || 1));
      default:
        return 0;
    }
  }

  private evaluateCondition(
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

  private evaluateConditionalOn(cond: ConditionalOn, form: FormGroup): boolean {
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

  private handleRepeatSection(form: FormGroup, section: any, count: number): void {
    if (!Array.isArray(section.questions)) return;

    // Remove old controls
    section.questions.forEach(q => {
      Object.keys(form.controls)
        .filter(k => k.startsWith(`${q.key}_`))
        .forEach(k => form.removeControl(k));
    });

    // Add new repeated controls
    for (let i = 0; i < count; i++) {
      section.questions.forEach(q => {
        const key = `${q.key}_${i}`;
        const initialValue = q.type === 'checkbox-group' ? [] : null;
        form.addControl(key, new FormControl(initialValue, q.validators || []));

        // 👇 Add math logic here
        if (q.math?.dependsOn?.length) {
          const scopedQuestion: FormQuestion = {
            ...q,
            key: key,
            math: {
              ...q.math,
              dependsOn: q.math.dependsOn.map(dep => `${dep}_${i}`),
            }
          };

          this.setupMathWatchers(form, scopedQuestion);
        }


      });
    }
  }

  /** Loops through a section's questions and applies visibility + validation. */
  private processSectionQuestions(section: FormSection, form: FormGroup, invalidKeys: string[]): void {
    const sectionVisible = section.conditionalOn ? this.evaluateConditionalOn(section.conditionalOn, form) : true;
    section.questions.forEach(q => {
      /** Determines and applies visibility of a question and its children. */
      const visible = this.isVisible(q, form, sectionVisible);
      if (!visible) return;
      section.repeatFor?.key ? this.validateRepeatedQuestion(form, q, section.repeatFor.key, invalidKeys) : this.validateQuestion(form, q, invalidKeys);
    });
  }

  /** Validates all repeated controls of a repeatable question. */
  private validateRepeatedQuestion(form: FormGroup, question: FormQuestion, repeatKey: string, invalidKeys: string[]): void {
    const repeatCount = form.get(repeatKey)?.value || 0;
    for (let i = 0; i < repeatCount; i++) {
      const key = `${question.key}_${i}`;
      this.markInvalidIfNeeded(form, key, invalidKeys);
    }
  }

  /** Recursively validates a question and its children. */
  private validateQuestion(form: FormGroup, question: FormQuestion, invalidKeys: string[]): void {
    const stack: FormQuestion[] = [question];
    while (stack.length) {
      const q = stack.pop();
      if (!q) continue;
      this.markInvalidIfNeeded(form, q.key, invalidKeys);
      q.children?.forEach(child => stack.push(child));
    }
  }

  /** Marks control as touched and collects invalid keys if control is invalid. */
  private markInvalidIfNeeded(form: FormGroup, key: string, invalidKeys: string[]) {
    const ctrl = form.get(key);
    if (ctrl?.enabled && ctrl.invalid) {
      ctrl.markAsTouched();
      invalidKeys.push(key);
    }
  }

  //** Recursively check all nested conditions have values. */ 
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