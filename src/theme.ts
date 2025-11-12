import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  shape: {
    borderRadius: 8,
  },
  palette: {
    primary: {
      main: '#030213', // --primary
      contrastText: '#ffffff', // --primary-foreground
    },
    secondary: {
      main: '#e9ebef', // Closest hex for oklch(0.95 0.0058 264.53) - muted light gray
      contrastText: '#030213', // --secondary-foreground
    },
    error: {
      main: '#d4183d', // --destructive
      contrastText: '#ffffff', // --destructive-foreground
    },
    background: {
      default: '#ffffff', // --background
      paper: '#ffffff', // --card
    },
    text: {
      primary: '#242424', // Closest hex for oklch(0.145 0 0) - very dark gray
      secondary: '#717182', // --muted-foreground
    },
  },
  typography: {
    fontFamily: 'ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
    h1: {
      fontSize: '1.5rem', // --text-2xl
      fontWeight: 500, // --font-weight-medium
      lineHeight: 1.5,
    },
    h2: {
      fontSize: '1.25rem', // --text-xl
      fontWeight: 500, // --font-weight-medium
      lineHeight: 1.5,
    },
    h3: {
      fontSize: '1.125rem', // --text-lg
      fontWeight: 500, // --font-weight-medium
      lineHeight: 1.5,
    },
    h4: {
      fontSize: '1rem', // --text-base
      fontWeight: 500, // --font-weight-medium
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem', // --text-base
      fontWeight: 400, // --font-weight-normal
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem', // --text-sm
      fontWeight: 400, // --font-weight-normal
      lineHeight: 1.5,
    },
    button: {
      fontWeight: 500, // --font-weight-medium
    },
    caption: {
      fontSize: '0.75rem', // --text-xs
      fontWeight: 400, // --font-weight-normal
      lineHeight: 1.5,
    },
  },
  components: {
    MuiTableCell: {
      styleOverrides: {
        head: {
          whiteSpace: 'nowrap',
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true, // Example: disable shadow on buttons
      },
      styleOverrides: {
        root: {
          textTransform: 'none', // Prevent uppercase text
          borderRadius: '8px', // --radius
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '8px', // --radius
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        size: 'small',
      },
    },
    MuiSelect: {
      defaultProps: {
        variant: 'outlined',
        size: 'small',
      },
    },
  },
});

export default theme;
