import { Directive, ElementRef, HostListener, Optional } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
    selector: '[appPhoneNumberFormatter]',    
    standalone: false
})
export class PhoneNumberFormatterDirective {

    constructor(private el: ElementRef,
        @Optional() private control: NgControl) { }

    @HostListener('input', ['$event'])
    onInput(event: Event): void {
        const input = event.target as HTMLInputElement;

        // Remove all non-digit characters
        const raw = input.value.replace(/\D/g, '').slice(0, 10);

        // Format it: (123) 456-7890
        let formatted = '';
        if (raw.length > 0) {
            formatted += `(${raw.slice(0, 3)}`;
        }
        if (raw.length >= 4) {
            formatted += `) ${raw.slice(3, 6)}`;
        }
        if (raw.length >= 7) {
            formatted += `-${raw.slice(6, 10)}`;
        }

        // Set both the input box and the form control value to the formatted value
        input.value = formatted;
        if (this.control) {
            this.control.control?.setValue(formatted, { emitEvent: false });
        }   
    }
}
