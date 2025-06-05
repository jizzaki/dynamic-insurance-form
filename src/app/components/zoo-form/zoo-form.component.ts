import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ZOO_ANIMAL_INSURANCE_FORM } from 'src/app/data/zoo-animal-form-pages';
import { FormEngineService } from 'src/app/services/form-engine.service';
import { FormSection, FormQuestion } from 'src/app/models/form-question.model';

@Component({
  selector: 'app-zoo-form',
  templateUrl: './zoo-form.component.html',
  standalone: false
})
export class ZooFormComponent implements OnInit {
  form!: FormGroup;
  pages = ZOO_ANIMAL_INSURANCE_FORM;
  currentPageIndex = 0;
  premiumCalculated = false;
  premiumLoading = false;
  premiumError = '';
  paymentSuccess = false;
  paymentLoading = false;
  paymentError = '';
  last4Digits = '';

  constructor(
    private formEngine: FormEngineService,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    this.form = this.formEngine.buildFormFromPages(this.pages);
  }

  getCurrentPage() {
    return this.pages[this.currentPageIndex];
  }

  isSectionVisible(section: FormSection): boolean {
    return this.formEngine.isSectionVisible(section, this.form);
  }

  isQuestionVisible(question: FormQuestion): boolean {
    return this.formEngine.isVisible(question, this.form);
  }

  goToNextStep(): void {
    const currentPage = this.getCurrentPage();
    const visibleQuestions = currentPage.sections.flatMap(section =>
      this.isSectionVisible(section)
        ? section.questions.filter(q => this.isQuestionVisible(q))
        : []
    );

    let hasError = false;

    visibleQuestions.forEach(q => {
      const key = q.key;
      const ctrl = this.form.get(key);
      if (ctrl && ctrl.invalid) {
        ctrl.markAsTouched();
        hasError = true;
      }
    });

    if (hasError) {

      console.log(this.form.errors)
      return;
    }


    switch (this.currentPageIndex) {
      case 0:
        this.calculatePremium();
        break;
      case 1:
        this.processPayment();
        break;
      default:
        if (this.currentPageIndex < this.pages.length - 1) {
          this.currentPageIndex++;
        }
        break;
    }
  }

  goToPreviousStep(): void {
    if (this.currentPageIndex > 0) {
      this.currentPageIndex--;
    }
  }

  calculatePremium(): void {
    this.premiumLoading = true;
    this.premiumError = '';
    const payload = {
      animalType: this.form.get('animalType')?.value,
      animalAge: this.form.get('animalAge')?.value
    };

    this.form.patchValue({ monthlyPremium: "1,000.00" });
    this.premiumCalculated = true;
    this.premiumLoading = false;
    this.currentPageIndex++;

    // Example placeholder for actual API call
    // this.http.post('/api/calculate-premium', payload).subscribe(...);
  }

  processPayment(): void {
    this.paymentLoading = true;
    this.paymentError = '';
    const paymentPayload = {
      amount: this.form.get('monthlyPremium')?.value,
      method: this.form.get('paymentType')?.value,
      account: this.form.get('accountNumber')?.value,
      routing: this.form.get('routingNumber')?.value
    };

    this.paymentSuccess = true;
    this.last4Digits = paymentPayload.account?.slice(-4) || '';
    this.paymentLoading = false;
    this.currentPageIndex++;

    // Example placeholder for actual API call
    // this.http.post('/api/process-payment', paymentPayload).subscribe(...);
  }

  getRepeatArray(key: string): number[] {
    const count = this.form.get(key)?.value || 0;
    return this.formEngine.getRepeatArray(count);
  }

  getAnswerValue(key: string, index?: number): string {
    const actualKey = index !== undefined ? `${key}_${index}` : key;
    return this.form.get(actualKey)?.value ?? '';
  }

  onSubmit(): void {
    if (this.form.valid) {
      console.log('Submitted', this.form.value);
    } else {
      console.log(this.form.errors)
    }
  }
}
