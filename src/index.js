import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'

import { MuiThemeProvider, createMuiTheme } from 'material-ui/styles';

const theme = createMuiTheme({
  palette: {
    primary: {
      light: '#B3E5FC',
      main: '#01579B',
      dark: '#1A237E',
      contrastText: '#fff',
    },
    secondary: {
      light: '#FFE57F',
      main: '#FFC107',
      dark: '#FF6F00',
      contrastText: '#000',
    },
  },
});

const Container = () => (
  <MuiThemeProvider theme={theme}>
    <App />
  </MuiThemeProvider>
);

ReactDOM.render(
  <Container />,
  document.getElementById('root')
);
