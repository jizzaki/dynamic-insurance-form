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
  @Input() currentPageIndex = 0;
  @Input() pages: FormPage[] = [];
  @Input() form!: FormGroup;
  @Output() pageValidated = new EventEmitter<number>();
  @Output() pageVisited = new EventEmitter<number>();
  @Output() nextPage = new EventEmitter<void>();
  @Output() previousPage = new EventEmitter<void>();

  premiumCalculated = false;
  premiumLoading = false;
  premiumError = '';
  paymentSuccess = false;
  paymentLoading = false;
  paymentError = '';
  last4Digits = '';

  constructor(private formEngineService: FormEngineService, private http: HttpClient) {}

  ngOnInit(): void {
    this.pageVisited.emit(this.currentPageIndex);
  }

  goToNextStep(): void {
    const result = this.formEngineService.validateForm(
      this.form,
      this.pages,
      this.currentPageIndex
    );

    if (!result.isValid) {
      console.log('Invalid controls:', result.invalidKeys);
      return;
    }

    this.pageValidated.emit(this.currentPageIndex);
    this.pageVisited.emit(this.currentPageIndex + 1);
    this.nextPage.emit();
    
  }

  goToPreviousStep(): void {
    if (this.currentPageIndex > 0) {
      this.pageVisited.emit(this.currentPageIndex - 1);
    }
    this.previousPage.emit();
  }

  onSubmit(): void {
    const result = this.formEngineService.validateForm(
      this.form,
      this.pages,
      this.currentPageIndex
    );

    if (!result.isValid) {
      console.log('Invalid controls:', result.invalidKeys);
      return;
    }

    console.log('Submitted', this.form.value);
  }

}
