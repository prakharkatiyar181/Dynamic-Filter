import { useState } from 'react';
import { Plus } from 'lucide-react';
import { FilterCondition } from '../types';
import { FilterRow } from './FilterRow';
import { Button } from './ui/button';
import { validateCondition } from '../utils/filterUtils';
import { fieldDefinitions } from '../config/fieldDefinitions';
import { Box, Typography } from '@mui/material';

interface FilterBuilderProps {
  conditions: FilterCondition[];
  onConditionsChange: (conditions: FilterCondition[]) => void;
  onClearAll?: () => void;
}

export function FilterBuilder({ conditions, onConditionsChange, onClearAll }: FilterBuilderProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const addFilter = () => {
    const firstField = fieldDefinitions[0];
    const fieldKey = firstField?.key || '';
    const operator = (firstField?.operators?.[0] as any) || ('equals' as any);
    let value: any = '';
    if (firstField?.type === 'singleSelect' && firstField.options?.length) {
      value = firstField.options[0];
    } else if (firstField?.type === 'multiSelect') {
      value = [];
    } else if (firstField?.type === 'boolean') {
      value = false;
    }

    const newCondition: FilterCondition = {
      id: `filter-${Date.now()}-${Math.random()}`,
      field: fieldKey,
      operator,
      value,
    };
    onConditionsChange([...conditions, newCondition]);
  };

  const updateFilter = (index: number, updatedCondition: FilterCondition) => {
    const newConditions = [...conditions];
    newConditions[index] = updatedCondition;
    onConditionsChange(newConditions);

    if (errors[updatedCondition.id]) {
      const newErrors = { ...errors };
      delete newErrors[updatedCondition.id];
      setErrors(newErrors);
    }
  };

  const removeFilter = (index: number) => {
    const removedId = conditions[index].id;
    const newConditions = conditions.filter((_, i) => i !== index);
    onConditionsChange(newConditions);

    if (errors[removedId]) {
      const newErrors = { ...errors };
      delete newErrors[removedId];
      setErrors(newErrors);
    }
  };

  const clearAllFilters = () => {
    setErrors({});
    if (typeof onClearAll === 'function') {
      onClearAll();
    } else {
      onConditionsChange([]);
    }
  };

  const validateAllConditions = () => {
    const newErrors: Record<string, string> = {};
    let hasErrors = false;

    conditions.forEach(condition => {
      const validation = validateCondition(condition);
      if (!validation.valid && validation.error) {
        newErrors[condition.id] = validation.error;
        hasErrors = true;
      }
    });

    setErrors(newErrors);
    return !hasErrors;
  };

  const handleApplyFilters = () => {
    validateAllConditions();
  };

  return (
    <Box sx={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e0e0e0', padding: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Button
          variant="contained"
          onClick={addFilter}
          sx={{ gap: 1, width: 'fit-content' }}
        >
          <Plus size={16} />
          Add Filter
        </Button>

        {conditions.length > 0 && (
          <Button
            variant="outlined"
            onClick={clearAllFilters}
          >
            Clear All
          </Button>
        )}
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {conditions.map((condition, index) => (
          <FilterRow
            key={condition.id}
            condition={condition}
            onUpdate={(updated) => updateFilter(index, updated)}
            onRemove={() => removeFilter(index)}
            canRemove={conditions.length > 1}
            error={errors[condition.id]}
          />
        ))}
      </Box>
    </Box>
  );
}
