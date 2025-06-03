import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { ConditionalOperator } from '../enums/conditional-operator';

type AllowedMathOperators = ConditionalOperator.Equals | ConditionalOperator.GreaterThan | ConditionalOperator.LessThan;

export class MathValidator {

    static validate(
        operator: ConditionalOperator.Equals | ConditionalOperator.GreaterThan | ConditionalOperator.LessThan,
        value: number,
        messageFn?: (value: number) => string
    ): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            const actualValue = Number(control.value);

            if (isNaN(actualValue)) {
                return { mathValidation: messageFn ? messageFn(actualValue) : 'Invalid number input' };
            }

            return mathValidator(operator, value, messageFn)(control);
        };
    }
}

export function mathValidator(
    operator: AllowedMathOperators,
    value: number,
    messageFn?: (value: number) => string
): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const actualValue = Number(control.value);
        const expected = value;
        // Strict Enum validation
        if (!(Object.values(ConditionalOperator).includes(operator))) {
            return { mathValidation: 'Invalid operator' };
        }

        switch (operator) {
            case ConditionalOperator.Equals:
                return actualValue === expected ? null : { mathValidation: messageFn ? messageFn(actualValue) : `Expected ${expected}` };
            case ConditionalOperator.GreaterThan:
                return actualValue > expected ? null : { mathValidation: messageFn ? messageFn(actualValue) : `Must be greater than ${expected}` };
            case ConditionalOperator.LessThan:
                return actualValue < expected ? null : { mathValidation: messageFn ? messageFn(actualValue) : `Must be less than ${expected}` };
            default:
                return null;
        }
    };
}
