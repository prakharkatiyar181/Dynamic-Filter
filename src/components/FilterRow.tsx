import { FilterCondition, FieldDefinition } from '../types';
import { fieldDefinitions, operatorLabels, getFieldDefinition } from '../config/fieldDefinitions';
import { Trash } from 'lucide-react';
import { Button } from './ui/button';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Switch,
  FormControlLabel,
  Checkbox,
  Typography,
} from '@mui/material';

interface FilterRowProps {
  condition: FilterCondition;
  onUpdate: (condition: FilterCondition) => void;
  onRemove: () => void;
  error?: string;
  canRemove?: boolean;
}

export function FilterRow({ condition, onUpdate, onRemove, error, canRemove = true }: FilterRowProps) {
  const fieldDef = condition.field ? getFieldDefinition(condition.field) : undefined;

  const handleFieldChange = (event: any) => {
    const fieldKey = event.target.value;
    const newFieldDef = getFieldDefinition(fieldKey);
    onUpdate({
      ...condition,
      field: fieldKey,
      operator: newFieldDef?.operators[0] || condition.operator,
      value: '',
      value2: undefined,
    });
  };

  const handleOperatorChange = (event: any) => {
    const operator = event.target.value;
    onUpdate({
      ...condition,
      operator: operator as any,
      value: condition.value,
      value2: operator === 'between' ? condition.value2 : undefined,
    });
  };

  const handleValueChange = (value: any) => {
    onUpdate({
      ...condition,
      value,
    });
  };

  const handleValue2Change = (value2: any) => {
    onUpdate({
      ...condition,
      value2,
    });
  };

  const renderValueInput = () => {
    if (!fieldDef) return null;

    const isBetween = condition.operator === 'between';

    switch (fieldDef.type) {
      case 'text':
        return (
          <TextField
            type="text"
            label="Enter value..."
            value={condition.value || ''}
            onChange={(e) => handleValueChange(e.target.value)}
            sx={{ flex: 1, minWidth: '200px' }}
            size="small"
          />
        );
      case 'number':
        if (isBetween) {
          return (
            <Box sx={{ display: 'flex', gap: 1, flex: 1, minWidth: '200px' }}>
              <TextField
                type="number"
                label="Min"
                value={condition.value || ''}
                onChange={(e) => handleValueChange(e.target.value)}
                sx={{ flex: 1 }}
                size="small"
              />
              <Typography sx={{ alignSelf: 'center' }}>-</Typography>
              <TextField
                type="number"
                label="Max"
                value={condition.value2 || ''}
                onChange={(e) => handleValue2Change(e.target.value)}
                sx={{ flex: 1 }}
                size="small"
              />
            </Box>
          );
        }
        return (
          <TextField
            type="number"
            label="Enter value..."
            value={condition.value || ''}
            onChange={(e) => handleValueChange(e.target.value)}
            sx={{ flex: 1, minWidth: '200px' }}
            size="small"
          />
        );
      case 'amount':
        if (isBetween) {
          return (
            <Box sx={{ display: 'flex', gap: 1, flex: 1, minWidth: '200px' }}>
              <TextField
                type="number"
                label="Min amount"
                value={condition.value || ''}
                onChange={(e) => handleValueChange(e.target.value)}
                sx={{ flex: 1 }}
                size="small"
              />
              <Typography sx={{ alignSelf: 'center' }}>-</Typography>
              <TextField
                type="number"
                label="Max amount"
                value={condition.value2 || ''}
                onChange={(e) => handleValue2Change(e.target.value)}
                sx={{ flex: 1 }}
                size="small"
              />
            </Box>
          );
        }
        return (
          <TextField
            type="number"
            label="Enter amount..."
            value={condition.value || ''}
            onChange={(e) => handleValueChange(e.target.value)}
            sx={{ flex: 1, minWidth: '200px' }}
            size="small"
          />
        );
      case 'date':
        return (
          <Box sx={{ display: 'flex', gap: 1, flex: 1, minWidth: '200px' }}>
            <TextField
              type="date"
              value={condition.value || ''}
              onChange={(e) => handleValueChange(e.target.value)}
              sx={{ flex: 1 }}
              InputLabelProps={{ shrink: true }}
              size="small"
            />
            {isBetween && (
              <>
                <Typography sx={{ alignSelf: 'center' }}>-</Typography>
                <TextField
                  type="date"
                  value={condition.value2 || ''}
                  onChange={(e) => handleValue2Change(e.target.value)}
                  sx={{ flex: 1 }}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                />
              </>
            )}
          </Box>
        );
      case 'boolean':
        return (
          <FormControlLabel
            control={
              <Switch
                size="small"
                checked={condition.value === true}
                onChange={(e) => handleValueChange(e.target.checked)}
              />
            }
            label={condition.value ? 'True' : 'False'}
            sx={{ m: 0, minWidth: 'auto', alignSelf: 'center' }}
          />
        );
      case 'singleSelect':
        if (fieldDef.options) {
          return (
            <FormControl sx={{ flex: 1, minWidth: '200px' }} size="small">
              <InputLabel>Select value...</InputLabel>
              <Select
                value={condition.value || ''}
                label="Select value..."
                onChange={(e) => handleValueChange((e as any).target.value)}
              >
                {fieldDef.options.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          );
        }
        return null;
      case 'multiSelect': {
        if (fieldDef.options) {
          const selectedValues = Array.isArray(condition.value) ? condition.value : [];

          const toggleValue = (option: string) => {
            const newValues = selectedValues.includes(option)
              ? selectedValues.filter(v => v !== option)
              : [...selectedValues, option];
            handleValueChange(newValues);
          };

          return (
            <Box sx={{ flex: 1, minWidth: '200px', border: '1px solid #e0e0e0', borderRadius: '8px', padding: 1.5, maxHeight: '200px', overflowY: 'auto' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {fieldDef.options.map((option) => (
                  <FormControlLabel
                    key={option}
                    control={
                      <Checkbox
                        checked={selectedValues.includes(option)}
                        onChange={() => toggleValue(option)}
                      />
                    }
                    label={option}
                  />
                ))}
              </Box>
            </Box>
          );
        }
        return null;
      }
      default:
        return null;
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start', flexWrap: 'wrap', flex: 1 }}>
          <FormControl sx={{ width: '200px' }} size="small">
            <InputLabel>Select field...</InputLabel>
            <Select
              value={condition.field || ''}
              label="Select field..."
              onChange={handleFieldChange}
            >
              {fieldDefinitions.map((field) => (
                <MenuItem key={field.key} value={field.key}>
                  {field.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {fieldDef && (
            <FormControl sx={{ width: '180px' }} size="small">
              <InputLabel>Select operator...</InputLabel>
              <Select
                value={condition.operator || ''}
                label="Select operator..."
                onChange={handleOperatorChange}
              >
                {fieldDef.operators.map((op) => (
                  <MenuItem key={op} value={op}>
                    {operatorLabels[op]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {fieldDef && renderValueInput()}
        </Box>

        {canRemove && (
          <Button
            variant="text"
            onClick={onRemove}
            sx={{ ml: 'auto', color: 'error.main', '&:hover': { color: 'error.dark', backgroundColor: 'transparent' } }}
          >
            <Trash size={16} />
          </Button>
        )}
      </Box>

      {error && (
        <Typography variant="body2" color="error" sx={{ marginLeft: 0.5 }}>{error}</Typography>
      )}
    </Box>
  );
}
