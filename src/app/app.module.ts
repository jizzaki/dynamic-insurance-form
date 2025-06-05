import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { AppComponent } from './app.component';

// Angular Material modules
import { MatStepperModule } from '@angular/material/stepper';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app.router.module';
import { RouterOutlet } from '@angular/router';
import { CurrencyFormatterDirective } from './directives/currency/currency-formatter.directive';
import { DateFormatterDirective } from './directives/date/date-formatter.directive';
import { PhoneNumberFormatterDirective } from './directives/phoneNumber/phone-number-formatter.directive';
import { ZipCodeFormatterDirective } from './directives/zipCode/zip-code-formatter.directive';
import { StepFormComponent } from './components/step-form/step-form.component';
import { DynamicInputComponent } from './components/dynamic-input/dynamic-input.component';
import { provideNgxMask } from 'ngx-mask';
import { QuestionRendererComponent } from './components/question-renderer/question-renderer.component';
import { FormSummaryComponent } from './components/form-summary/form-summary.component';
import { ZooFormComponent } from './components/zoo-form/zoo-form.component';
import { QuestionRenderer2Component } from './components/question-renderer2/question-renderer2.component';

providers: [provideNgxMask()]

@NgModule({
    declarations: [
        AppComponent,
        StepFormComponent,
        ZooFormComponent,
        QuestionRendererComponent,
        QuestionRenderer2Component,
        FormSummaryComponent,
        DynamicInputComponent,
        ZipCodeFormatterDirective,
        PhoneNumberFormatterDirective,
        DateFormatterDirective,
        CurrencyFormatterDirective,
    ],
    imports: [
        AppRoutingModule,
        RouterOutlet,
        BrowserModule,
        BrowserAnimationsModule,
        ReactiveFormsModule,
        HttpClientModule,
        MatStepperModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule,
        MatProgressSpinnerModule
    ],
    providers: [provideNgxMask()],
    bootstrap: [AppComponent]
})
export class AppModule { }
