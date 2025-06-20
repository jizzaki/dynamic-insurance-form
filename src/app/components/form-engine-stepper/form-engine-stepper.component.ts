// form-engine-stepper.component.ts
import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { FormPage } from "src/app/models/form-question.model";
import { FormEngineService } from "src/app/services/form-engine.service";

@Component({
    selector: 'form-engine-stepper',
    templateUrl: './form-engine-stepper.component.html',
    standalone: false
})
export class FormEngineStepperComponent implements OnInit {
    @Input() form!: FormGroup;
    @Input() pages: FormPage[] = [];
    @Input() currentPage = 0;

    @Output() stepChanged = new EventEmitter<number>();

    maxValidatedIndex = 0;
    visitedPages = new Set<number>();

    constructor(public formEngineService: FormEngineService) { }

    ngOnInit(): void {
        this.formEngineService.pageVisited$.subscribe((index) => {
            this.markPageVisited(index);
        });

        this.formEngineService.pageValidated$.subscribe((index) => {
            this.updateValidationState(index);
        });

        this.markPageVisited(this.currentPage);
    }



    goToStep(index: number): void {
        if (this.visitedPages.has(index)) {
            this.stepChanged.emit(index);
        }
    }

    markPageVisited(index: number): void {
        this.visitedPages.add(index);
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
} 
