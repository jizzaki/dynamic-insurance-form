import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormPage } from 'src/app/models/form-question.model';
import { FormEngineService } from 'src/app/services/form-engine.service';

@Component({
    selector: 'form-engine-stepper',
    templateUrl: './form-engine-stepper.component.html',
    standalone: false
})
export class FormEngineStepperComponent implements OnChanges {
    @Input() form!: FormGroup;
    @Input() pages: FormPage[] = [];
    @Input() currentPage = 0;

    @Output() stepChanged = new EventEmitter<number>();

    maxValidatedIndex = 0;
    visitedPages = new Set<number>();

    constructor(public formEngineService: FormEngineService) { }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['currentPage']) {
            this.markPageVisited(this.currentPage);
        }
    }

    goToStep(index: number): void {
        if (index === this.currentPage) return;

        const navCheck = this.formEngineService.shouldBlockNavigation(this.form, this.pages, this.currentPage, index);
        if (!navCheck.allowed) {
            console.warn(navCheck.reason);
            return;
        }

        this.stepChanged.emit(index);
    }

    updateValidationState(validatedIndex: number): void {
        let highestValidPage = -1;

        for (let i = 0; i <= validatedIndex; i++) {
            const result = this.formEngineService.validateForm(this.form, this.pages, i);
            if (result?.isValid) {
                highestValidPage = i;
            } else {
                break;
            }
        }

        this.maxValidatedIndex = Math.max(this.maxValidatedIndex, highestValidPage);
    }

    markPageVisited(index: number): void {
        this.visitedPages.add(index);
    }

    isStepClickable(index: number): boolean {
        return this.visitedPages.has(index) || index <= this.maxValidatedIndex;
    }
}
