import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  standalone: false,
  selector: 'input-with-directive',
  template: `
    <ng-container [ngSwitch]="directive">
      <!-- Phone -->
      <input
        *ngSwitchCase="'appPhoneNumberFormatter'"
        appPhoneNumberFormatter
        [type]="inputType || 'text'"
        [class]="className"
        [ngClass]="ngClass"
        [value]="value"
        [mask]="mask"
        (input)="onInput($event)"
        (blur)="onTouched()"
      />

      <!-- Zip -->
      <input
        *ngSwitchCase="'appZipCodeFormatter'"
        appZipCodeFormatter
        [type]="inputType || 'text'"
        [class]="className"
        [ngClass]="ngClass"
        [value]="value"
        [mask]="mask"
        (input)="onInput($event)"
        (blur)="onTouched()"
      />

      <!-- Currency -->
      <input
        *ngSwitchCase="'appCurrencyFormatter'"
        appCurrencyFormatter
        [type]="inputType || 'text'"
        [class]="className"
        [ngClass]="ngClass"
        [value]="value"
        [mask]="mask"
        (input)="onInput($event)"
        (blur)="onTouched()"
      />

      <!-- Date -->
      <input
        *ngSwitchCase="'appDateFormatter'"
        appDateFormatter
        [type]="inputType || 'text'"
        [class]="className"
        [ngClass]="ngClass"
        [value]="value"
        [mask]="mask"
        (input)="onInput($event)"
        (blur)="onTouched()"
      />

      <!-- Default -->
      <input
        *ngSwitchDefault
        [type]="inputType || 'text'"
        [class]="className"
        [ngClass]="ngClass"
        [value]="value"
        [mask]="mask"
        (input)="onInput($event)"
        (blur)="onTouched()"
      />
    </ng-container>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DynamicInputComponent),
      multi: true,
    },
  ],
})
export class DynamicInputComponent implements ControlValueAccessor {
  @Input() directive: string = '';
  @Input() inputType: string = 'text';
  @Input() className: string = 'form-control';
  @Input() ngClass: any;
  @Input() mask: string = '';

  value: any = '';
  onChange: (val: any) => void = () => {};
  onTouched: () => void = () => {};

  writeValue(val: any): void {
    this.value = val;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.value = input.value;
    this.onChange(this.value);
  }
}
