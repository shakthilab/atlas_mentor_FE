import { Component, Input, forwardRef, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-datepicker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DatepickerComponent),
      multi: true
    }
  ],
  template: `
    <div class="datepicker-container" [class.disabled]="disabled" [class.focused]="isFocused" (click)="focusInput()">
      <span class="material-icons calendar-icon">calendar_today</span>
      <input 
        #dateInput
        [type]="inputType" 
        [ngModel]="value" 
        (ngModelChange)="onValueChange($event)"
        (focus)="onFocus()"
        (blur)="onBlur()"
        [disabled]="disabled"
        [min]="min"
        [max]="max"
        [required]="required"
        [placeholder]="placeholder"
        class="native-date-input"
      >
    </div>
  `,
  styles: [`
    .datepicker-container {
      position: relative;
      display: flex;
      align-items: center;
      width: 100%;
      background: #ffffff;
      border: 1px solid #d0d5dd;
      border-radius: 8px;
      padding: 0 12px;
      height: 44px;
      transition: all 0.2s ease;
      cursor: text;
      box-shadow: 0 1px 2px rgba(16, 24, 40, 0.05);
    }

    .datepicker-container:hover:not(.disabled) {
      border-color: #667cb0;
    }

    .datepicker-container.focused {
      border-color: #667cb0;
      box-shadow: 0 0 0 4px rgba(102, 124, 176, 0.1);
    }

    .datepicker-container.disabled {
      background: #f9fafb;
      cursor: not-allowed;
      border-color: #eaecf0;
    }

    .calendar-icon {
      font-size: 1.25rem;
      color: #667085;
      margin-right: 10px;
      pointer-events: none;
    }

    .native-date-input {
      flex: 1;
      border: none;
      background: transparent;
      font-size: 0.9375rem;
      color: #101828;
      outline: none;
      font-family: inherit;
      width: 100%;
      height: 100%;
      padding: 0;
    }

    .native-date-input::placeholder {
      color: #667085;
      opacity: 1;
    }

    .disabled .calendar-icon,
    .disabled .native-date-input {
      color: #98a2b3;
    }

    /* Adjust date input internal padding for cleaner look */
    .native-date-input::-webkit-calendar-picker-indicator {
      cursor: pointer;
      padding: 5px;
      filter: invert(45%) sepia(10%) saturate(800%) hue-rotate(185deg) brightness(95%) contrast(90%);
    }
  `]
})
export class DatepickerComponent implements ControlValueAccessor {
  @Input() placeholder: string = 'Select date';
  @Input() min: string = '';
  @Input() max: string = '';
  @Input() required: boolean = false;
  @Input() disabled: boolean = false;

  @ViewChild('dateInput') dateInput!: ElementRef<HTMLInputElement>;

  value: string = '';
  isFocused: boolean = false;
  inputType: 'text' | 'date' = 'text';

  onChange: any = () => {};
  onTouched: any = () => {};

  writeValue(value: any): void {
    this.value = value || '';
    this.updateInputType();
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onValueChange(newValue: string): void {
    this.value = newValue;
    this.onChange(newValue);
    this.onTouched();
  }

  onFocus(): void {
    this.isFocused = true;
    this.inputType = 'date';
  }

  onBlur(): void {
    this.isFocused = false;
    this.onTouched();
    this.updateInputType();
  }

  private updateInputType(): void {
    this.inputType = (this.value || this.isFocused) ? 'date' : 'text';
  }

  focusInput(): void {
    if (!this.disabled) {
      this.dateInput.nativeElement.focus();
    }
  }
}
