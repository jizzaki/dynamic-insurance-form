import { Component, Input } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { FormQuestion } from '../../models/form-question.model';
import { FormEngineService } from 'src/app/services/form-engine.service';

@Component({
  selector: 'app-question-renderer2',
  templateUrl: './question-renderer2.component.html',
  standalone: false,
})
export class QuestionRenderer2Component {
  @Input() question!: FormQuestion;
  @Input() form!: FormGroup;
  @Input() index?: number;

  ctrl!: FormControl;

  constructor(public formEngine: FormEngineService) {}

  ngOnInit(): void {
    const key = this.index !== undefined ? `${this.question.key}_${this.index}` : this.question.key;
    this.ctrl = this.form.get(key) as FormControl;

    if (this.question.math) {
      this.formEngine.setupMathWatcher(this.form, this.question, key);
    }
  }

  isVisible(): boolean {
    return this.formEngine.isVisible(this.question, this.form);
  }

  toggleCheckbox(value: string): void {
    if (!this.ctrl || !Array.isArray(this.ctrl.value)) return;

    const values = this.ctrl.value as string[];
    const index = values.indexOf(value);

    if (index > -1) {
      values.splice(index, 1);
    } else {
      values.push(value);
    }
    this.ctrl.setValue([...values]);
  }

  clampValue(): void {
    if (!this.ctrl) return;
    const val = parseFloat(this.ctrl.value);
    if (isNaN(val)) return;

    let clamped = val;
    if (this.question.min !== undefined && val < this.question.min) {
      clamped = this.question.min;
    }
    if (this.question.max !== undefined && val > this.question.max) {
      clamped = this.question.max;
    }
    if (clamped !== val) {
      this.ctrl.setValue(clamped);
    }
  }
}
