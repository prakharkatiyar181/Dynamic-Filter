import { useState, useMemo, useEffect } from 'react';
import { Employee, FilterCondition } from '../types';
import {
  Table as MuiTable,
  TableBody as MuiTableBody,
  TableCell as MuiTableCell,
  TableHead as MuiTableHead,
  TableRow as MuiTableRow,
  Box,
  Typography,
  Button as MuiButton,
  Menu,
  MenuItem,
  Popover,
  Badge,
} from '@mui/material';
import { CheckIcon, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, CrossIcon, Download, Filter, XIcon } from 'lucide-react';
import { exportToCSV, exportToJSON } from '../utils/filterUtils';
import { fieldDefinitions } from '../config/fieldDefinitions';
import { Button } from './ui/button';
import { FilterBuilder } from './FilterBuilder';

interface DataTableProps {
  data: Employee[];
  totalRecords: number;
  conditions: FilterCondition[];
  onApplyFilters: (conditions: FilterCondition[]) => void;
}

type SortField = keyof Employee | 'address.city' | 'address.state';
type SortDirection = 'asc' | 'desc';

export function DataTable({ data, totalRecords, conditions, onApplyFilters }: DataTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>('id');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const pageSize = 10;

  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const filterOpen = Boolean(filterAnchorEl);
  const [draftConditions, setDraftConditions] = useState<FilterCondition[]>([]);

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleFilterClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setFilterAnchorEl(event.currentTarget);
    if (conditions.length === 0) {
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

      setDraftConditions([
        {
          id: `filter-${Date.now()}-${Math.random()}`,
          field: fieldKey,
          operator,
          value,
        },
      ]);
    } else {
      setDraftConditions(conditions.map(c => ({ ...c })));
    }
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleFilterApply = () => {
    onApplyFilters(draftConditions);
    handleFilterClose();
  };

  const handleClearAll = () => {
    onApplyFilters([]);
    setDraftConditions([]);
    handleFilterClose();
  };

  const sortedData = useMemo(() => {
    const sorted = [...data].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      if (sortField === 'address.city') {
        aValue = a.address.city;
        bValue = b.address.city;
      } else if (sortField === 'address.state') {
        aValue = a.address.state;
        bValue = b.address.state;
      } else {
        aValue = a[sortField as keyof Employee];
        bValue = b[sortField as keyof Employee];
      }

      if (Array.isArray(aValue)) {
        aValue = aValue.join(', ');
      }
      if (Array.isArray(bValue)) {
        bValue = bValue.join(', ');
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [data, sortField, sortDirection]);

  const totalPages = Math.ceil(sortedData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = sortedData.slice(startIndex, endIndex);

  useMemo(() => {
    setCurrentPage(1);
  }, [data]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIndicator = (field: SortField) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? ' ↑' : ' ↓';
  };

  const getSortIndicatorIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />;
  };

  const renderSortHeader = (label: string, field: SortField, align: 'left' | 'center' | 'right' = 'left') => (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.5,
        maxWidth: '100%',
        justifyContent: align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start',
        verticalAlign: 'middle',
      }}
    >
      <Box component="span" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>
        {label}
      </Box>
      <Box component="span" sx={{ flex: '0 0 auto', lineHeight: 0 }}>{getSortIndicatorIcon(field)}</Box>
    </Box>
  );

  return (
    <Box sx={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
      
      <Box sx={{ padding: 3, borderBottom: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h6" component="h2" sx={{ marginBottom: 0.5 }}>
            Employee Records
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Total: {totalRecords} | Showing: {data.length}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Badge
            badgeContent={conditions.length}
            color="error"
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <MuiButton
              aria-label="Filter"
              aria-haspopup="true"
              aria-expanded={filterOpen ? 'true' : undefined}
              variant="contained"
              onClick={handleFilterClick}
              startIcon={<Filter size={16} />}
              sx={{
                backgroundColor: '#000',
                color: '#fff',
                '&:hover': { backgroundColor: '#000' },
                textTransform: 'none',
              }}
            >
              Filter
            </MuiButton>
          </Badge>
          <MuiButton
            id="export-button"
            aria-controls={open ? 'export-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
            variant="outlined"
            onClick={handleMenuClick}
            startIcon={<Download size={16} />}
          >
            Export
          </MuiButton>
        </Box>
        <Menu
          id="export-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleMenuClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          MenuListProps={{
            'aria-labelledby': 'export-button',
          }}
          // sx={{mt: 1}}
          PaperProps={{ sx: { mt: 1 } }}
        >
          <MenuItem onClick={() => { exportToCSV(data); handleMenuClose(); }}>Export to CSV</MenuItem>
          <MenuItem onClick={() => { exportToJSON(data); handleMenuClose(); }}>Export to JSON</MenuItem>
        </Menu>
      </Box>

      
      <Popover
        open={filterOpen}
        anchorEl={filterAnchorEl}
        onClose={handleFilterClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{ sx: { p: 2, maxWidth: 900, minWidth: 800, mt: 1 } }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FilterBuilder
            conditions={draftConditions}
            onConditionsChange={setDraftConditions}
            onClearAll={handleClearAll}
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button variant="outlined" onClick={handleFilterClose}>Cancel</Button>
            <Button variant="contained" onClick={handleFilterApply}>Apply Filters</Button>
          </Box>
        </Box>
      </Popover>

      
      {data.length === 0 ? (
        <Box sx={{ padding: 6, textAlign: 'center', color: 'text.secondary' }}>
          <Typography variant="body1">No results found</Typography>
          <Typography variant="body2" sx={{ marginTop: 0.5 }}>Try adjusting your filters</Typography>
        </Box>
      ) : (
        <>
          <Box sx={{ overflowX: 'auto' }}>
            <MuiTable>
              <MuiTableHead>
                <MuiTableRow>
                  <MuiTableCell
                    sx={{ cursor: 'pointer', '&:hover': { backgroundColor: '#f5f5f5' } }}
                    onClick={() => handleSort('id')}
                  >
                    {renderSortHeader('ID', 'id')}
                  </MuiTableCell>
                  <MuiTableCell
                    sx={{ cursor: 'pointer', '&:hover': { backgroundColor: '#f5f5f5' } }}
                    onClick={() => handleSort('name')}
                  >
                    {renderSortHeader('Name', 'name')}
                  </MuiTableCell>
                  <MuiTableCell
                    sx={{ cursor: 'pointer', '&:hover': { backgroundColor: '#f5f5f5' } }}
                    onClick={() => handleSort('email')}
                  >
                    {renderSortHeader('Email', 'email')}
                  </MuiTableCell>
                  <MuiTableCell
                    sx={{ cursor: 'pointer', '&:hover': { backgroundColor: '#f5f5f5' } }}
                    onClick={() => handleSort('department')}
                  >
                    {renderSortHeader('Department', 'department')}
                  </MuiTableCell>
                  <MuiTableCell
                    sx={{ cursor: 'pointer', '&:hover': { backgroundColor: '#f5f5f5' } }}
                    onClick={() => handleSort('role')}
                  >
                    {renderSortHeader('Role', 'role')}
                  </MuiTableCell>
                  <MuiTableCell
                    sx={{ cursor: 'pointer', '&:hover': { backgroundColor: '#f5f5f5' } }}
                    onClick={() => handleSort('salary')}
                  >
                    {renderSortHeader('Salary', 'salary')}
                  </MuiTableCell>
                  <MuiTableCell
                    sx={{ cursor: 'pointer', '&:hover': { backgroundColor: '#f5f5f5' } }}
                    onClick={() => handleSort('joinDate')}
                  >
                    {renderSortHeader('Join Date', 'joinDate')}
                  </MuiTableCell>
                  <MuiTableCell
                    sx={{ cursor: 'pointer', '&:hover': { backgroundColor: '#f5f5f5' }, textAlign: 'center' }}
                    onClick={() => handleSort('isActive')}
                  >
                    {renderSortHeader('Active', 'isActive', 'center')}
                  </MuiTableCell>
                  <MuiTableCell>Skills</MuiTableCell>
                  <MuiTableCell
                    sx={{ cursor: 'pointer', '&:hover': { backgroundColor: '#f5f5f5' } }}
                    onClick={() => handleSort('address.city')}
                  >
                    {renderSortHeader('Location', 'address.city')}
                  </MuiTableCell>
                  <MuiTableCell
                    sx={{ cursor: 'pointer', '&:hover': { backgroundColor: '#f5f5f5' } }}
                    onClick={() => handleSort('projects')}
                  >
                    {renderSortHeader('Projects', 'projects')}
                  </MuiTableCell>
                  <MuiTableCell
                    sx={{ cursor: 'pointer', '&:hover': { backgroundColor: '#f5f5f5' } }}
                    onClick={() => handleSort('performanceRating')}
                  >
                    {renderSortHeader('Rating', 'performanceRating')}
                  </MuiTableCell>
                </MuiTableRow>
              </MuiTableHead>
              <MuiTableBody>
                {paginatedData.map((employee) => (
                  <MuiTableRow key={employee.id}>
                    <MuiTableCell>{employee.id}</MuiTableCell>
                    <MuiTableCell sx={{ whiteSpace: 'nowrap' }}>{employee.name}</MuiTableCell>
                    <MuiTableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>{employee.email}</MuiTableCell>
                    <MuiTableCell>{employee.department}</MuiTableCell>
                    <MuiTableCell sx={{ whiteSpace: 'nowrap' }}>{employee.role}</MuiTableCell>
                    <MuiTableCell sx={{ whiteSpace: 'nowrap' }}>
                      ${employee.salary.toLocaleString()}
                    </MuiTableCell>
                    <MuiTableCell sx={{ whiteSpace: 'nowrap' }}>{employee.joinDate}</MuiTableCell>
                    <MuiTableCell sx={{ textAlign: 'center' }}>
                      {employee.isActive ? (
                        <CheckIcon color="green" size={16} />
                      ) : (
                        <XIcon color="red" size={16} />
                      )}
                    </MuiTableCell>
                    <MuiTableCell sx={{ maxWidth: 200 }}>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {employee.skills.slice(0, 3).map((skill, idx) => (
                          <Box
                            key={idx}
                            component="span"
                            sx={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              px: 1,
                              py: 0.25,
                              borderRadius: '8px',
                              backgroundColor: 'primary.light',
                              fontSize: '0.75rem',
                              color: 'primary.contrastText',
                            }}
                          >
                            {skill}
                          </Box>
                        ))}
                        {employee.skills.length > 3 && (
                          <Typography variant="caption" color="textSecondary" sx={{ marginLeft: 0.5 }}>
                            +{employee.skills.length - 3}
                          </Typography>
                        )}
                      </Box>
                    </MuiTableCell>
                    <MuiTableCell sx={{ whiteSpace: 'nowrap' }}>
                      {employee.address.city}, {employee.address.state}, {employee.address.country}
                    </MuiTableCell>
                    <MuiTableCell sx={{ textAlign: 'center' }}>{employee.projects}</MuiTableCell>
                    <MuiTableCell>{employee.performanceRating.toFixed(1)}</MuiTableCell>
                  </MuiTableRow>
                ))}
              </MuiTableBody>
            </MuiTable>
          </Box>

          
          {totalPages > 1 && (
            <Box sx={{ padding: 2, borderTop: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
              <Button
                variant="outlined"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft size={20} />
              </Button>

              <Box sx={{ display: 'flex', gap: 0.5 }}>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? 'contained' : 'outlined'}
                    size="small"
                    onClick={() => setCurrentPage(page)}
                    sx={{ minWidth: '2.5rem' }}
                  >
                    {page}
                  </Button>
                ))}
              </Box>

              <Button
                variant="outlined"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight size={20} />
              </Button>
            </Box>
          )}
        </>
      )}
    </Box>
  );
}
