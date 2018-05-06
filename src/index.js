import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'

import { MuiThemeProvider, createMuiTheme } from 'material-ui/styles';

const theme = createMuiTheme();
const Container = () => (
  <MuiThemeProvider theme={theme}>
    <App />
  </MuiThemeProvider>
);

ReactDOM.render(
  <Container />,
  document.getElementById('root')
);
