import { Employee, FilterCondition, Operator } from '../types';
import { getFieldDefinition } from '../config/fieldDefinitions';

const getNestedValue = (obj: any, path: string): any => {
  return path.split('.').reduce((current, prop) => current?.[prop], obj);
};

const matchesCondition = (employee: Employee, condition: FilterCondition): boolean => {
  const fieldDef = getFieldDefinition(condition.field);
  if (!fieldDef) return true;

  const fieldValue = fieldDef.path 
    ? getNestedValue(employee, fieldDef.path)
    : (employee as any)[condition.field];

  const { operator, value, value2 } = condition;

  if (fieldValue === null || fieldValue === undefined) {
    return false;
  }

  if (fieldDef.type === 'text') {
    // Case-sensitive text matching
    const fieldStr = String(fieldValue);
    const valueStr = String(value);

    switch (operator) {
      case 'equals':
        return fieldStr === valueStr;
      case 'contains':
        return fieldStr.includes(valueStr);
      case 'startsWith':
        return fieldStr.startsWith(valueStr);
      case 'endsWith':
        return fieldStr.endsWith(valueStr);
      case 'doesNotContain':
        return !fieldStr.includes(valueStr);
      default:
        return true;
    }
  }

  if (fieldDef.type === 'number' || fieldDef.type === 'amount') {
    const fieldNum = Number(fieldValue);
    const valueNum = Number(value);
    const value2Num = value2 !== undefined ? Number(value2) : undefined;

    switch (operator) {
      case 'equals':
        return fieldNum === valueNum;
      case 'greaterThan':
        return fieldNum > valueNum;
      case 'lessThan':
        return fieldNum < valueNum;
      case 'greaterThanOrEqual':
        return fieldNum >= valueNum;
      case 'lessThanOrEqual':
        return fieldNum <= valueNum;
      case 'between':
        if (value2Num === undefined) return true;
        return fieldNum >= valueNum && fieldNum <= value2Num;
      default:
        return true;
    }
  }

  if (fieldDef.type === 'date') {
    const fieldDate = new Date(fieldValue);
    const valueDate = new Date(value);
    const value2Date = value2 ? new Date(value2) : undefined;

    switch (operator) {
      case 'between':
        if (!value2Date) return true;
        return fieldDate >= valueDate && fieldDate <= value2Date;
      default:
        return true;
    }
  }

  if (fieldDef.type === 'boolean') {
    return fieldValue === value;
  }

  if (fieldDef.type === 'singleSelect') {
    switch (operator) {
      case 'is':
        return fieldValue === value;
      case 'isNot':
        return fieldValue !== value;
      default:
        return true;
    }
  }

  if (fieldDef.type === 'multiSelect') {
    if (!Array.isArray(fieldValue)) return false;
    
    const selectedValues = Array.isArray(value) ? value : [value];
    
    switch (operator) {
      case 'in':
        return selectedValues.some(val => fieldValue.includes(val));
      case 'notIn':
        return !selectedValues.some(val => fieldValue.includes(val));
      default:
        return true;
    }
  }

  return true;
};

export const applyFilters = (
  employees: Employee[],
  conditions: FilterCondition[]
): Employee[] => {
  if (conditions.length === 0) {
    return employees;
  }

  return employees.filter(employee => {
    return conditions.every(condition => matchesCondition(employee, condition));
  });
};

export const validateCondition = (condition: FilterCondition): { valid: boolean; error?: string } => {
  if (!condition.field) {
    return { valid: false, error: 'Please select a field' };
  }

  if (!condition.operator) {
    return { valid: false, error: 'Please select an operator' };
  }

  const fieldDef = getFieldDefinition(condition.field);
  if (!fieldDef) {
    return { valid: false, error: 'Invalid field selected' };
  }

  if (condition.value === null || condition.value === undefined || condition.value === '') {
    return { valid: false, error: 'Please enter a value' };
  }

  if ((condition.operator === 'between') && 
      (condition.value2 === null || condition.value2 === undefined || condition.value2 === '')) {
    return { valid: false, error: 'Please enter both values for range' };
  }

  if ((fieldDef.type === 'number' || fieldDef.type === 'amount')) {
    if (isNaN(Number(condition.value))) {
      return { valid: false, error: 'Please enter a valid number' };
    }
    if (condition.operator === 'between' && isNaN(Number(condition.value2))) {
      return { valid: false, error: 'Please enter valid numbers for range' };
    }
  }

  if (fieldDef.type === 'date') {
    if (isNaN(new Date(condition.value).getTime())) {
      return { valid: false, error: 'Please enter a valid date' };
    }
    if (condition.operator === 'between' && isNaN(new Date(condition.value2).getTime())) {
      return { valid: false, error: 'Please enter valid dates for range' };
    }
  }

  return { valid: true };
};

export const exportToCSV = (data: Employee[]): void => {
  if (data.length === 0) return;

  const headers = [
    'ID', 'Name', 'Email', 'Department', 'Role', 'Salary', 
    'Join Date', 'Active', 'Skills', 'City', 'State', 
    'Projects', 'Performance Rating'
  ];

  const rows = data.map(emp => [
    emp.id,
    emp.name,
    emp.email,
    emp.department,
    emp.role,
    emp.salary,
    emp.joinDate,
    emp.isActive ? 'Yes' : 'No',
    emp.skills.join('; '),
    emp.address.city,
    emp.address.state,
    emp.projects,
    emp.performanceRating,
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `employee-data-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToJSON = (data: Employee[]): void => {
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `employee-data-${new Date().toISOString().split('T')[0]}.json`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
