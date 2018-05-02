import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'

const Container = () => (
  <MuiThemeProvider>
    <App />
  </MuiThemeProvider>
);

ReactDOM.render(
  <Container />,
  document.getElementById('root')
);
