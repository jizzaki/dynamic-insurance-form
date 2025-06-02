import { Directive, ElementRef, HostListener, Optional } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
    selector: '[appDateFormatter]',
    standalone: false
})
export class DateFormatterDirective {
    constructor(private el: ElementRef,
        @Optional() private control: NgControl) { }

    @HostListener('input', ['$event'])
    onInput(event: Event): void {
        const input = event.target as HTMLInputElement;

        // Get only digits
        const digits = input.value.replace(/\D/g, '').slice(0, 8); // MMDDYYYY

        // Format to MM/DD/YYYY
        let formatted = '';
        if (digits.length > 0) {
            formatted += digits.slice(0, 2);
        }
        if (digits.length >= 3) {
            formatted += '/' + digits.slice(2, 4);
        }
        if (digits.length >= 5) {
            formatted += '/' + digits.slice(4, 8);
        }

        // Set the formatted value in the input and the form control
        input.value = formatted;
        if (this.control) {
            this.control.control?.setValue(formatted, { emitEvent: false });
        }
    }
}
