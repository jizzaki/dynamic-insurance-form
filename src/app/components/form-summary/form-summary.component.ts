import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormPage, FormQuestion } from 'src/app/models/form-question.model';
import { FormBuilderService } from 'src/app/services/form-builder.service';

@Component({
  selector: 'app-form-summary',
  templateUrl: './form-summary.component.html',
  standalone: false
})
export class FormSummaryComponent {
  @Input() pages: FormPage[] = [];
  @Input() form!: FormGroup;

  constructor(private formBuilderService: FormBuilderService) { }

  getAnswer(question: FormQuestion, index?: number): string {
    const key = index !== undefined ? `${question.key}_${index}` : question.key;
    const value = this.form.get(key)?.value;

    if (Array.isArray(value)) {
      return value
        .map(val => this.getOptionLabel(question, val))
        .join(', ');
    }

    return this.getOptionLabel(question, value) || '-';
  }

  private getOptionLabel(question: FormQuestion, value: any): string {
    const match = question.options?.find(opt => opt.value == value);
    return match ? match.label : value;
  }

}
