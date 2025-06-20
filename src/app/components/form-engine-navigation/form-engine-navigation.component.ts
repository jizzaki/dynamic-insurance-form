// form-engine-navigation.component.ts
import { Component, Input } from '@angular/core';
import { FormEngineService } from 'src/app/services/form-engine.service';

@Component({
  selector: 'form-engine-navigation',
  templateUrl: './form-engine-navigation.component.html',
  standalone: false
})
export class FormEngineNavigationComponent {
  @Input() currentPage = 0;
  @Input() totalPages = 0;

  constructor(private formEngineService: FormEngineService) {}

  onPrevious(): void {
    this.formEngineService.emitPreviousPage();
  }

  onNext(): void {
    this.formEngineService.emitNextPage();
  }

  onSubmit(): void {
    this.formEngineService.emitSubmitForm();
  }
}
