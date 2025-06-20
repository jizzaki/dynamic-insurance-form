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

  getAnswer(key: string): string {
    const value = this.form.get(key)?.value;
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    return value !== undefined && value !== null && value !== '' ? value : '-';
  }

}
