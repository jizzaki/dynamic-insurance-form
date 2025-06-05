// question-renderer.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, AbstractControl } from '@angular/forms';
import { FormQuestion } from 'src/app/models/form-question.model';

@Component({
  selector: 'app-question-renderer',
  templateUrl: './question-renderer.component.html',
  standalone: false,
})
export class QuestionRendererComponent {
  @Input() question!: FormQuestion;
  @Input() ctrl!: AbstractControl;
  @Input() form!: FormGroup;
  @Input() index?: number;
  @Output() checkboxToggle = new EventEmitter<{ key: string; value: any }>();

  onCheckboxToggle(key: string, value: any): void {
    this.checkboxToggle.emit({ key, value });
  }

  get keyWithIndex(): string {
    return this.index !== undefined ? `${this.question.key}_${this.index}` : this.question.key;
  }

  get isInvalid(): boolean {
    return this.ctrl.invalid && (this.ctrl.touched || this.ctrl.dirty);
  }
}
