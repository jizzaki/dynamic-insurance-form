import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ZOO_ANIMAL_INSURANCE_FORM } from 'src/app/data/zoo-animal-form-pages';
import { FormBuilderService } from 'src/app/services/form-builder.service';
import { FormQuestion } from 'src/app/models/form-question.model';

@Component({
  selector: 'app-multi-step-form',
  templateUrl: './multi-step-form.component.html',
  standalone: false
})
export class MultiStepFormComponent implements OnInit {
  form: FormGroup;
  pages = ZOO_ANIMAL_INSURANCE_FORM;
  currentPageIndex = 0;
  premiumCalculated = false;
  premiumLoading = false;
  premiumError = '';
  paymentSuccess = false;
  paymentLoading = false;
  paymentError = '';
  last4Digits = '';

  constructor(private formBuilderService: FormBuilderService
    , private http: HttpClient) { }

  ngOnInit(): void {
    const allSections = this.pages.flatMap(p => p.sections);
    this.form = this.formBuilderService.buildForm(allSections, this.form, this.pages);
  }

  goToNextStep(): void {
    const currentPage = this.pages[this.currentPageIndex];

    const flattenQuestions = (questions: FormQuestion[]): FormQuestion[] =>
      questions.flatMap(q => [q, ...(q.children ? flattenQuestions(q.children) : [])]);

    const visibleSections = currentPage.sections.filter(section =>
      this.formBuilderService.isSectionVisible(section, this.form)
    );

    // Collect real FormQuestions with repeat metadata
    const allQuestions: { question: FormQuestion; key: string }[] = [];

    visibleSections.forEach(section => {
      if (section.repeatFor?.key) {
        const repeatCount = this.form.get(section.repeatFor.key)?.value || 0;
        section.questions.forEach(question => {
          for (let i = 0; i < repeatCount; i++) {
            allQuestions.push({
              question,
              key: `${question.key}_${i}`
            });
          }
        });
      } else {
        flattenQuestions(section.questions).forEach(q =>
          allQuestions.push({ question: q, key: q.key })
        );
      }
    });

    // Visibility + validation
    allQuestions.forEach(({ question, key }) => {
      const ctrl = this.form.get(key);
      const isVisible = this.formBuilderService.isVisible(question, this.form);

      if (ctrl) {
        if (!isVisible) {
          ctrl.markAsUntouched();
        } else {
          ctrl.updateValueAndValidity({ emitEvent: false });
        }
      }
    });

    const invalidControls = allQuestions
      .map(({ key }) => this.form.get(key))
      .filter(ctrl => ctrl && ctrl.enabled && ctrl.invalid);

    if (invalidControls.length > 0) {
      invalidControls.forEach(ctrl => ctrl.markAsTouched());
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

  private calculatePremium(): void {
    this.premiumLoading = true;
    this.premiumError = '';
    const payload = {
      animalType: this.form.get('animalType')?.value,
      animalAge: this.form.get('animalAge')?.value
    };

    // TEMP
    this.form.patchValue({ monthlyPremium: "1,000.00" });
    this.premiumCalculated = true;
    this.premiumLoading = false;
    this.currentPageIndex++;

    // this.http.post('/api/calculate-premium', payload).subscribe({
    //   next: (res: any) => {
    //     this.form.patchValue({ monthlyPremium: res.premium });
    //     this.premiumCalculated = true;
    //     this.premiumLoading = false;
    //     this.currentPageIndex++;
    //   },
    //   error: () => {
    //     this.premiumError = 'Failed to calculate premium. Please try again.';
    //     this.premiumLoading = false;
    //   }
    // });
  }

  private processPayment(): void {
    this.paymentLoading = true;
    this.paymentError = '';
    const paymentPayload = {
      amount: this.form.get('monthlyPremium')?.value,
      method: this.form.get('paymentType')?.value,
      account: this.form.get('accountNumber')?.value,
      routing: this.form.get('routingNumber')?.value
    };

    // TEMP
    this.paymentSuccess = true;
    this.last4Digits = paymentPayload.account.slice(-4);
    this.paymentLoading = false;
    this.currentPageIndex++;

    // this.http.post('/api/process-payment', paymentPayload).subscribe({
    //   next: (res: any) => {
    //     this.paymentSuccess = true;
    //     this.last4Digits = paymentPayload.account.slice(-4);
    //     this.paymentLoading = false;
    //     this.currentPageIndex++;
    //   },
    //   error: () => {
    //     this.paymentError = 'Payment failed. Please check your details and try again.';
    //     this.paymentLoading = false;
    //   }
    // });
  }

  onSubmit(): void {
    console.log(this.form.valid)
    if (this.form.valid) {
      console.log('Submitted', this.form.value);
    }
  }

}
