import { ConditionalOperator } from '../enums/conditional-operator';
import { MathOperands } from '../enums/math-operands';
import { FormPage } from '../models/form-question.model';
import { Validators } from '@angular/forms';
import { MathValidator } from '../validators/math.validator';
import { StateListOptions } from '../enums/state-list';
import { YesNo, YesNoOptions } from '../enums/yes-no';
import { PaymentTypesOptions } from '../enums/payment-types';
import { ExtendedCoverageTypesOptions } from '../enums/extended-coverage-types';
import { AnimalTypesOptions } from '../enums/animal-types';

export const ZOO_ANIMAL_INSURANCE_FORM: FormPage[] = [
  {
    title: 'Insured Information',
    sections: [
      {
        title: 'Insured Details',
        questions: [
          { key: 'name', label: 'Name', type: 'text', validators: [Validators.required] },
          { key: 'address', label: 'Address', type: 'text', validators: [Validators.required] },
          { key: 'phone', label: 'Phone Number', type: 'text', inputType: "tel", directive: "appPhoneNumberFormatter", validators: [Validators.required] },
          { key: 'state', label: 'State', type: 'select', options: StateListOptions, validators: [Validators.required] },
          { key: 'zip', label: 'Zip Code', type: 'text', directive: "appZipCodeFormatter", 
            conditionalOn: { key: 'state', operator: ConditionalOperator.In, value: ['CA', 'FL'] }, 
            validators: [Validators.required] },
          { key: 'policyStartDate', label: 'Policy Start Date', type: 'text', directive: "appDateFormatter", validators: [Validators.required] },
        ]
      },
      {
        title: 'Financial Info',
        questions: [
          { key: 'income', label: 'Income', type: 'number' },
          { key: 'expenses', label: 'Expenses', type: 'number' },
          {
            key: 'netTotal',
            label: 'Net Total',
            type: 'number',
            validators: [ 
              MathValidator.validate(ConditionalOperator.GreaterThan, 0)
            ],
            math: {
              operation: MathOperands.Subtract,
              dependsOn: ['income', 'expenses'],
            }
          }
        ]
      },
      {
        title: 'Animal Details',
        questions: [
          { key: 'animalType', label: 'Animal Type', type: 'select', options: AnimalTypesOptions, validators: [Validators.required] },
          { key: 'animalPrice', label: 'Animal Price', type: 'text', directive: "appCurrencyFormatter", validators: [Validators.required] },
          { key: 'wantsExtended', label: 'Would you like extended coverage?', type: 'radio', options: YesNoOptions, validators: [Validators.required] },
          { key: 'tigersAreOld', label: 'Are your tigers seniors?', type: 'radio', options: YesNoOptions, validators: [Validators.required] },
          { key: 'numberOfTigers', label: 'How many tigers do you have?', type: 'number', min: 0, max: 10, validators: [Validators.required] },
        ],
      },
      {
        title: 'Animal Questionnaire',
        conditionalOn: { key: 'numberOfTigers', operator: ConditionalOperator.GreaterThan, value: 0 },
        repeatFor: { key: 'numberOfTigers' }, // this field holds the number of repeats
        questions: [
          { key: 'animalName', label: 'Name of Tiger', type: 'text', validators: [Validators.required] },
          { key: 'animalAge', label: 'Age of Tiger', type: 'text', validators: [Validators.required] },
          { key: 'costOfAnimal', label: 'How much did tiger cost?', type: 'number' },
          { key: 'costOfAnimalExpenses', label: 'How much were the tigers total expenses?', type: 'number' },
          {
            key: 'tigerTotalExpenses',
            label: 'Net Total',
            type: 'number',
            validators: [ 
              MathValidator.validate(ConditionalOperator.GreaterThan, 0)
            ],
            math: {
              operation: MathOperands.Sum,
              dependsOn: ['costOfAnimal', 'costOfAnimalExpenses'],
            }
          }
        ]
      },
      {
        title: 'Old Tigers Only Questionnaire',
        conditionalOn: {
          operator: ConditionalOperator.All,
          conditions: [
            { key: 'numberOfTigers', operator: ConditionalOperator.GreaterThan, value: 0 },
            { key: 'tigersAreOld', operator: ConditionalOperator.Equals, value: YesNo.Yes }
          ]
        },
        questions: [
          { key: 'animalNameSenior', label: 'Where was the tiger born?', type: 'text', validators: [Validators.required] },
          { key: 'animalAgeSenior', label: 'Name of the original owner?', type: 'text', validators: [Validators.required] },
        ]
      },
      {
        title: 'Extended Coverage Questionnaire',
        conditionalOn: { key: 'wantsExtended', value: YesNo.Yes },
        questions: [
          {
            key: 'extendedCoverageReason',
            label: 'Please explain why you need extended coverage',
            type: 'textarea',
            validators: [Validators.required]
          },
          {
            key: 'extendedCoverageOptions',
            label: 'Select the types of coverage you want',
            type: 'checkbox-group',
            options: ExtendedCoverageTypesOptions,
            validators: [Validators.required]
          }
        ]
      }
    ]
  },
  {
    title: 'Payment',
    sections: [
      { title: 'Review Details', questions: [] },
      {
        title: 'Monthly Premium',
        questions: [{ key: 'monthlyPremium', label: 'Premium Amount', type: 'text' }]
      },
      {
        title: 'Payment Details',
        questions: [
          { key: 'paymentType', label: 'Payment Method', type: 'select', options: PaymentTypesOptions, validators: [Validators.required] },
          { key: 'accountNumber', label: 'Account/Card Number', type: 'text', validators: [Validators.required] },
          { key: 'expirationDate', label: 'Expiration Date', type: 'text', validators: [Validators.required] },
          { key: 'routingNumber', label: 'Routing Number', type: 'text', validators: [Validators.required] }
        ]
      }
    ]
  },
  {
    title: 'Confirmation',
    sections: [
      {
        title: 'Insurance Summary',
        questions: []
      }
    ]
  }
];
