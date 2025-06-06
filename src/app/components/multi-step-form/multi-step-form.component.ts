import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ZOO_ANIMAL_INSURANCE_FORM } from 'src/app/data/zoo-animal-form-pages';
import { FormEngineService } from 'src/app/services/form-engine.service';
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

  constructor(private formEngineService: FormEngineService
    , private http: HttpClient) { }

  ngOnInit(): void {
    const allSections = this.pages.flatMap(p => p.sections);
    this.form = this.formEngineService.buildForm(allSections, this.form, this.pages);
  }

  goToNextStep(): void {

    const result = this.formEngineService.validateVisibleFieldsForPage(
      this.form,
      this.pages[this.currentPageIndex]
    );

    if (!result.isValid) {
      console.log('Invalid controls:', result.invalidKeys);
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
    //this.last4Digits = paymentPayload.account.slice(-4);
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

    this.pages.forEach(page => {
      page.sections.forEach(section => {
        section.questions.forEach(q => {
          const sectionVisible = section.conditionalOn
            ? this.formEngineService.evaluateConditionalOn(section.conditionalOn, this.form)
            : true;

          this.formEngineService.isVisible(q, this.form, sectionVisible);
        });
      });
    });

    this.logInvalidControls(this.form);

    console.log(this.form.valid)
    if (this.form.valid) {
      console.log('Submitted', this.form.value);
    }
  }

  logInvalidControls(form: FormGroup, parentKey: string = ''): void {
    Object.keys(form.controls).forEach(key => {
      const control = form.get(key);

      const fullKey = parentKey ? `${parentKey}.${key}` : key;

      if (control instanceof FormGroup) {
        this.logInvalidControls(control, fullKey);
      } else if (control && control.invalid) {
        console.warn(`Invalid control: ${fullKey}`, control.errors);
      }
    });
  }

}
