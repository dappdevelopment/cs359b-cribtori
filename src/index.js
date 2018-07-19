import React from 'react';
import ReactDOM from 'react-dom';
import { Switch, Route, HashRouter } from 'react-router-dom';

import App from './App';
import Tutorial from './Tutorial/TutorialWrapper.js';

import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';

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
/*
<Switch>
  <Route exact path='/' component={App} />
  <Route exact path='/tutorial' component={Tutorial} />
</Switch>
*/
const Container = () => (
  <HashRouter>
    <MuiThemeProvider theme={theme}>
      <App />
    </MuiThemeProvider>
  </HashRouter>
);

ReactDOM.render(
  <Container />,
  document.getElementById('root')
);
