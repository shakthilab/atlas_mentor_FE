import { Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CalendarModule } from 'primeng/calendar';

@Component({
  selector: 'app-datepicker',
  standalone: true,
  imports: [CommonModule, FormsModule, CalendarModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DatepickerComponent),
      multi: true
    }
  ],
  template: `
    <p-calendar
      [ngModel]="dateValue"
      (ngModelChange)="onDateChange($event)"
      [showIcon]="true"
      [iconDisplay]="'input'"
      [minDate]="minDateObj"
      [maxDate]="maxDateObj"
      [required]="required"
      [disabled]="disabled"
      [placeholder]="placeholder"
      dateFormat="dd/mm/yy"
      styleClass="prime-datepicker"
    ></p-calendar>
  `,
  styles: [`
    :host { display: block; }
    :host ::ng-deep .prime-datepicker { width: 100%; }
    :host ::ng-deep .prime-datepicker .p-inputtext {
      width: 100%;
      border-radius: 8px;
      border: 1px solid #d0d5dd;
      height: 44px;
      font-family: inherit;
      font-size: 0.9375rem;
      color: #101828;
      padding: 0 12px;
    }
    :host ::ng-deep .prime-datepicker .p-inputtext:enabled:focus {
      border-color: #667cb0;
      box-shadow: 0 0 0 4px rgba(102, 124, 176, 0.1);
    }
    :host ::ng-deep .prime-datepicker .p-button {
      background: transparent;
      border: 1px solid #d0d5dd;
      border-left: none;
      border-radius: 0 8px 8px 0;
      color: #667085;
      height: 44px;
    }
    :host ::ng-deep .prime-datepicker .p-button:hover {
      background: #f9fafb;
      color: #667cb0;
    }
    :host ::ng-deep .p-calendar-w-btn .p-inputtext {
      border-radius: 8px 0 0 8px;
    }
  `]
})
export class DatepickerComponent implements ControlValueAccessor {
  @Input() placeholder: string = 'Select date';
  @Input() required: boolean = false;
  @Input() disabled: boolean = false;

  @Input() set min(val: string) {
    this.minDateObj = val ? new Date(val) : null;
  }
  @Input() set max(val: string) {
    this.maxDateObj = val ? new Date(val) : null;
  }

  dateValue: Date | null = null;
  minDateObj: Date | null = null;
  maxDateObj: Date | null = null;

  onChange: any = () => {};
  onTouched: any = () => {};

  writeValue(value: any): void {
    this.dateValue = value ? new Date(value) : null;
  }

  registerOnChange(fn: any): void { this.onChange = fn; }
  registerOnTouched(fn: any): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this.disabled = isDisabled; }

  onDateChange(date: Date | null): void {
    this.dateValue = date;
    if (date instanceof Date && !isNaN(date.getTime())) {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      this.onChange(`${y}-${m}-${d}`);
    } else {
      this.onChange(null);
    }
    this.onTouched();
  }
}
