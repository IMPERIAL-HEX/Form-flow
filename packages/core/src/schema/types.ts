/** Top-level form definition. */
export interface FormSchema {
  id: string;
  version: string;
  title: string;
  description?: string;
  layout: LayoutConfig;
  steps: StepSchema[];
  submission: SubmissionConfig;
  theme?: ThemeConfig;
}

/** Step within a multi-step form. */
export interface StepSchema {
  id: string;
  title: string;
  heading?: string;
  description?: string;
  icon?: string;
  fields: FieldSchema[];
  layout?: 'single-column' | 'two-column';
  showIf?: Condition;
}

/** Base properties shared by all fields. */
export interface BaseFieldSchema {
  key: string;
  label: string;
  description?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  ui?: {
    variant?: string;
    width?: 'full' | 'half' | 'third';
    columns?: number;
    className?: string;
  };
  showIf?: Condition;
  messages?: {
    required?: string;
    invalid?: string;
    min?: string;
    max?: string;
  };
}

/** Text field schema. */
export interface TextFieldSchema extends BaseFieldSchema {
  type: 'text';
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  patternHint?: string;
}

/** Number field schema. */
export interface NumberFieldSchema extends BaseFieldSchema {
  type: 'number';
  min?: number;
  max?: number;
  step?: number;
}

/** Currency field schema. */
export interface CurrencyFieldSchema extends BaseFieldSchema {
  type: 'currency';
  currency: string;
  min: number;
  max: number;
  step?: number;
  quickSelect?: number[];
}

/** Option used by select-like fields. */
export interface SelectOption {
  value: string;
  label: string;
  icon?: string;
  description?: string;
}

/** Select field schema. */
export interface SelectFieldSchema extends BaseFieldSchema {
  type: 'select';
  options: SelectOption[];
}

/** Multi-select field schema. */
export interface MultiSelectFieldSchema extends BaseFieldSchema {
  type: 'multi-select';
  options: SelectOption[];
  minSelections?: number;
  maxSelections?: number;
}

/** Date field schema. */
export interface DateFieldSchema extends BaseFieldSchema {
  type: 'date';
  minDate?: string;
  maxDate?: string;
}

/** Phone field schema. */
export interface PhoneFieldSchema extends BaseFieldSchema {
  type: 'phone';
  defaultCountryCode?: string;
}

/** Email field schema. */
export interface EmailFieldSchema extends BaseFieldSchema {
  type: 'email';
}

/** File value object. */
export interface FileValue {
  name: string;
  size: number;
  type: string;
}

/** File upload field schema. */
export interface FileUploadFieldSchema extends BaseFieldSchema {
  type: 'file';
  accept?: string[];
  maxSizeMb?: number;
  multiple?: boolean;
}

/** Address value shape for address fields. */
export interface AddressValue {
  line1: string;
  line2?: string;
  city: string;
  region: string;
  postcode: string;
  country: string;
}

/** Address field schema. */
export interface AddressFieldSchema extends BaseFieldSchema {
  type: 'address';
  includeLine2?: boolean;
  regionLabel?: string;
  postcodeLabel?: string;
  countries?: SelectOption[];
}

/** Checkbox field schema. */
export interface CheckboxFieldSchema extends BaseFieldSchema {
  type: 'checkbox';
}

/** Textarea field schema. */
export interface TextAreaFieldSchema extends BaseFieldSchema {
  type: 'textarea';
  minLength?: number;
  maxLength?: number;
  rows?: number;
}

/** Read-only informational block schema. */
export interface InfoBlockSchema extends BaseFieldSchema {
  type: 'info';
  variant?: 'callout' | 'warning' | 'summary';
  content: string;
}

/** Union type for all field schemas. */
export type FieldSchema =
  | TextFieldSchema
  | NumberFieldSchema
  | CurrencyFieldSchema
  | SelectFieldSchema
  | MultiSelectFieldSchema
  | DateFieldSchema
  | PhoneFieldSchema
  | EmailFieldSchema
  | FileUploadFieldSchema
  | AddressFieldSchema
  | CheckboxFieldSchema
  | TextAreaFieldSchema
  | InfoBlockSchema;

/** Condition for conditional visibility. */
export interface Condition {
  field: string;
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'notIn' | 'exists';
  value?: unknown;
  and?: Condition[];
  or?: Condition[];
}

/** Layout configuration. */
export interface LayoutConfig {
  template: 'top-stepper' | 'sidebar-left' | 'centered';
  header?: {
    title: string;
    subtitle?: string;
    background?: 'solid' | 'gradient';
    showLogo?: boolean;
  };
  navigator?: {
    showStepNumbers?: boolean;
    showIcons?: boolean;
    showProgress?: boolean;
    clickableSteps?: boolean;
  };
  footer?: {
    previousLabel?: string;
    nextLabel?: string;
    submitLabel?: string;
    showPreviousOnFirstStep?: boolean;
  };
}

/** Submission configuration. */
export interface SubmissionConfig {
  endpoint: string;
  method?: 'POST' | 'PUT';
  headers?: Record<string, string>;
  transformKeys?: boolean;
  onSuccess?: {
    message?: string;
    redirectUrl?: string;
  };
}

/** Theme configuration. */
export interface ThemeConfig {
  primaryColor?: string;
  borderRadius?: 'none' | 'sm' | 'md' | 'lg' | 'full';
  fontFamily?: string;
  mode?: 'light' | 'dark';
}
