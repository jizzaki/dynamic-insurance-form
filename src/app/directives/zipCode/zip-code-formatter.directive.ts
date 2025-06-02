import { Directive, ElementRef, HostListener, Optional } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appZipCodeFormatter]',
  standalone: false,
})
export class ZipCodeFormatterDirective {
  constructor(
    private el: ElementRef<HTMLInputElement>,
    @Optional() private control: NgControl
  ) {}

  @HostListener('input', ['$event.target'])
  onInput(input: HTMLInputElement) {
    const raw = input.value;
    const sanitized = raw.replace(/\D/g, '').slice(0, 5);

    // ✅ Update DOM value
    input.value = sanitized;

    // ✅ Update form control value
    if (this.control) {
      this.control.control?.setValue(sanitized, { emitEvent: false });
    }
  }
}
