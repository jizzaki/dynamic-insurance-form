// form-engine-form.component.ts
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { FormEngineService } from 'src/app/services/form-engine.service';
import { FormPage } from 'src/app/models/form-question.model';

@Component({
  selector: 'form-engine-form',
  templateUrl: './form-engine-form.component.html',
  standalone: false
})
export class FormEngineFormComponent implements OnInit {
  @Input() currentPage = 0;
  @Input() pages: FormPage[] = [];
  @Input() form!: FormGroup;
  @Output() previousPage = new EventEmitter<void>();
  @Output() nextPage = new EventEmitter<void>();
  @Output() submitted = new EventEmitter<void>();
  @Output() errors = new EventEmitter<any>();

  constructor(private formEngineService: FormEngineService, private http: HttpClient) { }

  ngOnInit(): void {
    this.formEngineService.emitPageVisited(this.currentPage);

    // The form engine navigation component emits these page navigation events
    this.formEngineService.nextPage$.subscribe(() => {
      this.goToNextStep();
    });

    this.formEngineService.previousPage$.subscribe(() => {
      this.goToPreviousStep();
    });

    this.formEngineService.submitForm$.subscribe(() => {
      this.submit();
    });

  }

  goToNextStep(): void {
    const result = this.formEngineService.validateForm(
      this.form,
      this.pages,
      this.currentPage
    );

    if (!result.isValid) {
      console.log('Invalid controls:', result.invalidKeys);
      return;
    }

    this.formEngineService.emitPageVisited(this.currentPage + 1);
    this.formEngineService.emitPageValidated(this.currentPage);

    this.nextPage.emit();
  }

  goToPreviousStep(): void {
    if (this.currentPage > 0) {
      this.formEngineService.emitPageVisited(this.currentPage - 1);
    }

    const canLeave = this.formEngineService.canLeavePage(this.form, this.pages, this.currentPage);
  if (!canLeave) return;
    this.previousPage.emit();
  }

  submit(): void {
    const result = this.formEngineService.validateForm(this.form, this.pages, this.currentPage);

    if (!result.isValid) {
      this.errors.emit(result.invalidKeys);
      return;
    }

    this.submitted.emit(this.form.value);
  }

}
