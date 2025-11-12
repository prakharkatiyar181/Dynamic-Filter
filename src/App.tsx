import { useState, useMemo, useEffect } from 'react';
import { FilterCondition, Employee } from './types';
import { DataTable } from './components/DataTable';
import { employeeData } from './data/mockData';
import { applyFilters } from './utils/filterUtils';
import { Box, Typography, Container } from '@mui/material';
export default function App() {
  const [filterConditions, setFilterConditions] = useState<FilterCondition[]>([]);
  const [allEmployees, setAllEmployees] = useState<Employee[]>(employeeData);

  const STORAGE_KEY = 'filterConditions';

  // Load filters from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as FilterCondition[];
        if (Array.isArray(parsed)) {
          setFilterConditions(parsed);
        }
      }
    } catch (e) {
      // ignore parse/storage errors
    }
  }, []);

  // Persist filters whenever they change
  useEffect(() => {
    try {
      if (filterConditions.length > 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filterConditions));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (e) {
      // ignore storage errors
    }
  }, [filterConditions]);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/employees`, { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((data) => {
        const list = Array.isArray(data) ? data : Array.isArray(data?.employees) ? data.employees : [];
        if (list.length) setAllEmployees(list);
      })
      .catch(() => {
        // fallback to bundled employeeData if mock server not running
      });
    return () => controller.abort();
  }, []);

  const filteredData = useMemo(() => {
    return applyFilters(allEmployees, filterConditions);
  }, [allEmployees, filterConditions]);

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f9fafb', padding: 4 }}>
      <Container maxWidth="xl" sx={{ margin: '0 auto', spacing: 3 }}>
        <Box sx={{ marginBottom: 4 }}>
          <Typography variant="h4" component="h1" sx={{ marginBottom: 1 }}>
            Dynamic Filter System
          </Typography>
        </Box>

        <DataTable
          data={filteredData}
          totalRecords={allEmployees.length}
          conditions={filterConditions}
          onApplyFilters={setFilterConditions}
        />
      </Container>
    </Box>
  );
}
