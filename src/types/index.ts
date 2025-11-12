export type FieldType = 
  | 'text' 
  | 'number' 
  | 'date' 
  | 'amount' 
  | 'singleSelect' 
  | 'multiSelect' 
  | 'boolean';

export type TextOperator = 
  | 'equals' 
  | 'contains' 
  | 'startsWith' 
  | 'endsWith' 
  | 'doesNotContain';

export type NumberOperator = 
  | 'equals' 
  | 'greaterThan' 
  | 'lessThan' 
  | 'greaterThanOrEqual' 
  | 'lessThanOrEqual' 
  | 'between';

export type DateOperator = 'between';

export type AmountOperator = 'between';

export type SelectOperator = 'is' | 'isNot';

export type MultiSelectOperator = 'in' | 'notIn';

export type BooleanOperator = 'is';

export type Operator = 
  | TextOperator 
  | NumberOperator 
  | DateOperator 
  | AmountOperator 
  | SelectOperator 
  | MultiSelectOperator 
  | BooleanOperator;

export interface FieldDefinition {
  key: string;
  label: string;
  type: FieldType;
  operators: Operator[];
  options?: string[]; // For select fields
  path?: string; // For nested fields like "address.city"
}

export interface FilterCondition {
  id: string;
  field: string;
  operator: Operator;
  value: any;
  value2?: any; // For "between" operators
}

export interface Employee {
  id: number;
  name: string;
  email: string;
  department: string;
  role: string;
  salary: number;
  joinDate: string;
  isActive: boolean;
  skills: string[];
  address: {
    city: string;
    state: string;
    country: string;
  };
  projects: number;
  lastReview: string;
  performanceRating: number;
}

export interface FilterState {
  conditions: FilterCondition[];
}

export interface OperatorConfig {
  value: Operator;
  label: string;
}
