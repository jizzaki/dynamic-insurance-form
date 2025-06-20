// zoo-quote-form.component.ts
import { Component, OnInit } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { ZOO_ANIMAL_INSURANCE_FORM } from "src/app/data/zoo-animal-form-pages";
import { FormEngineService } from "src/app/services/form-engine.service";

@Component({
    selector: 'zoo-quote',
    templateUrl: './zoo-quote-form.component.html',
    standalone: false
})
export class ZooQuoteFormComponent implements OnInit {
    form!: FormGroup;
    pages = ZOO_ANIMAL_INSURANCE_FORM;
    currentPageIndex = 0;

    constructor(private formEngineService: FormEngineService) { }

    ngOnInit() {
        this.form = this.formEngineService.buildForm(this.pages);
    }

    onStepChanged(newIndex: number): void {
        this.currentPageIndex = newIndex;
    }

    goToNextPage(): void {
        if (this.currentPageIndex < this.pages.length - 1) {
            this.currentPageIndex++;
        }
    }

    goToPreviousPage(): void {
        if (this.currentPageIndex > 0) {
            this.currentPageIndex--;
        }
    }

    onFormSubmitted($event): void {
        console.log('Submitted', $event);
    }

    onFormErrors($event): void {
        console.log('Invalid controls', $event);
    }
} 
