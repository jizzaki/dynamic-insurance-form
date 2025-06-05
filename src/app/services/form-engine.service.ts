import { Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ConditionalOn, FormPage, FormQuestion, FormSection } from '../models/form-question.model';
import { ConditionalOperator } from '../enums/conditional-operator';
import { MathOperands } from '../enums/math-operands';

@Injectable({ providedIn: 'root' })
export class FormEngineService {
  constructor(private fb: FormBuilder) {}

  buildFormFromPages(pages: FormPage[]): FormGroup {
    const form = this.fb.group({});

    pages.forEach(page => {
      page.sections.forEach(section => {
        if (section.repeatFor?.key) {
          form.addControl(section.repeatFor.key, new FormControl(0));
        }

        section.questions.forEach(q => {
          const ctrl = new FormControl('', q.validators || []);
          form.addControl(q.key, ctrl);
        });
      });
    });

    this.setupMathWatchers(form, pages);
    this.setupConditionalWatchers(form, pages);

    return form;
  }

  setupMathWatcher(form: FormGroup, q: FormQuestion, key: string): void {
    const sourceKeys = q.math?.dependsOn || [];

    sourceKeys.forEach(dep => {
      form.get(dep)?.valueChanges.subscribe(() => {
        this.computeMathValue(form, q);
      });
    });

    this.computeMathValue(form, q);
  }

  getRepeatArray(count: number): number[] {
    return Array.from({ length: count }, (_, i) => i);
  }

  isVisible(q: FormQuestion, form: FormGroup): boolean {
    if (!q.conditionalOn) return true;
    return this.evaluateConditionalOn(q.conditionalOn, form);
  }

  isSectionVisible(section: FormSection, form: FormGroup): boolean {
    if (!section.conditionalOn) return true;
    return this.evaluateConditionalOn(section.conditionalOn, form);
  }

  getVisibleQuestionsFromSection(section: FormSection, form: FormGroup): FormQuestion[] {
    return section.questions.filter(q => this.isVisible(q, form));
  }

  private setupMathWatchers(form: FormGroup, pages: FormPage[]): void {
    pages.forEach(page => {
      page.sections.forEach(section => {
        section.questions.forEach(q => {
          if (q.math) {
            this.setupMathWatcher(form, q, q.key);
          }
        });
      });
    });
  }

  private computeMathValue(form: FormGroup, q: FormQuestion): void {
    const sources = q.math?.dependsOn?.map(key => +form.get(key)?.value || 0) || [];
    let result = 0;

    switch (q.math?.operation) {
      case MathOperands.Add:
        result = sources.reduce((a, b) => a + b, 0);
        break;
      case MathOperands.Subtract:
        result = sources.reduce((a, b) => a - b);
        break;
      case MathOperands.Multiply:
        result = sources.reduce((a, b) => a * b, 1);
        break;
      case MathOperands.Divide:
        result = sources.reduce((a, b) => (b === 0 ? a : a / b));
        break;
    }

    form.get(q.key)?.setValue(result, { emitEvent: false });
  }

  private setupConditionalWatchers(form: FormGroup, pages: FormPage[]): void {
    pages.forEach(page => {
      page.sections.forEach(section => {
        if (section.conditionalOn) {
          this.registerWatcher(section.conditionalOn, form);
        }

        section.questions.forEach(q => {
          if (q.conditionalOn) {
            this.registerWatcher(q.conditionalOn, form);
          }
        });
      });
    });
  }

  private registerWatcher(cond: ConditionalOn, form: FormGroup): void {
    if (cond.key) {
      form.get(cond.key)?.valueChanges.subscribe(() => {});
    }
    cond.conditions?.forEach(c => this.registerWatcher(c, form));
  }

  private evaluateConditionalOn(cond: ConditionalOn, form: FormGroup): boolean {
    const operator = cond.operator ?? ConditionalOperator.Equals;

    if (operator === ConditionalOperator.All || operator === ConditionalOperator.Any) {
      const results = cond.conditions?.map(c => this.evaluateConditionalOn(c, form)) || [];
      return operator === ConditionalOperator.All
        ? results.every(Boolean)
        : results.some(Boolean);
    }

    if (operator === ConditionalOperator.Not) {
      const inner = cond.conditions?.[0];
      if (!inner) return false;
      return !this.evaluateConditionalOn(inner, form);
    }

    const val = form.get(cond.key || '')?.value;
    const target = cond.value;

    switch (operator) {
      case ConditionalOperator.Equals:
        return val === target;
      case ConditionalOperator.NotEquals:
        return val !== target;
      case ConditionalOperator.GreaterThan:
        return +val > +target;
      case ConditionalOperator.GreaterThanOrEqual:
        return +val >= +target;
      case ConditionalOperator.LessThan:
        return +val < +target;
      case ConditionalOperator.LessThanOrEqual:
        return +val <= +target;
      case ConditionalOperator.In:
        return Array.isArray(target) && target.includes(val);
      case ConditionalOperator.NotIn:
        return Array.isArray(target) && !target.includes(val);
      default:
        return true;
    }
  }
}
