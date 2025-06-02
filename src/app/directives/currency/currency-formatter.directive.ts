import { Directive, ElementRef, HostListener, Optional } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
    selector: '[appCurrencyFormatter]',
    standalone: false
})
export class CurrencyFormatterDirective {

    constructor(private el: ElementRef,
        @Optional() private control: NgControl) { }

    @HostListener('input', ['$event'])
    onInput(event: Event): void {
        const input = event.target as HTMLInputElement;

        // Remove all non-digit characters
        let raw = input.value.replace(/\D/g, '');

        // Format number with commas (no decimal)
        let formatted = '$' + this.addCommas(raw);

        // Update the input and form control with formatted value
        input.value = formatted;
        if (this.control) {
            this.control.control?.setValue(formatted, { emitEvent: false });
        }
    }

    private addCommas(value: string): string {
        // Add commas for thousands
        return value.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
}
