import React, { Component } from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import axios from "axios";

// Material ui styling
import { withStyles } from "@material-ui/core/styles";
import { MuiThemeProvider, createMuiTheme } from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";
import LinearProgress from "@material-ui/core/LinearProgress";

// SubComponents
import Plotter from "./Components/Plotter";

// Configuration
import Config from "./Config";

// React contextAPI for common app data
import { DataProvider } from "./Components/DataContext";

// creating a themes with default fontfamily
const theme1 = createMuiTheme({
  typography: {
    fontFamily: [
      '"Roboto Slab"',
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "Roboto",
      '"Helvetica Neue"',
      "Arial",
      "sans-serif",
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"'
    ],
    useNextVariants: true
  }
});

const theme2 = createMuiTheme({
  palette: {
    primary: {
      light: "#60ad5e",
      main: "#2e7d32",
      dark: "#005005",
      contrastText: "#fff"
    },
    secondary: {
      light: "#ff7961",
      main: "#f44336",
      dark: "#ba000d",
      contrastText: "#fff"
    }
  },
  typography: {
    fontFamily: [
      '"Bree Serif"',
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "Roboto",
      '"Helvetica Neue"',
      "Arial",
      "sans-serif",
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"'
    ],
    useNextVariants: true
  }
});

// styles for the app page.
const styles = theme => ({
  borderLine: {
    borderBottom: `1px solid ${theme.palette.divider}`
  }
});

class App extends Component {
  state = {
    isThemeLight: true,
    refs: [],
    categories: [],
    selectedCategory: ""
  };

  async componentDidMount() {
    // Retrieve categories
    // https://www.storyblok.com/tp/how-to-send-multiple-requests-using-axios
    // https://blog.logrocket.com/how-to-make-http-requests-like-a-pro-with-axios/
    // https://stackoverflow.com/a/44185591

    let requestOne = Config.settings.categories;
    const responseOne = await axios.get(requestOne);

    let requestTwo =
      Config.settings.refs + "?category=" + responseOne.data.categories[0];
    const responseTwo = await axios.get(requestTwo);

    // console.log(responseOne, responseTwo);

    this.setState({
      categories: responseOne.data.categories,
      selectedCategory: responseOne.data.categories[0],
      refs: responseTwo.data.referencePoints
    });
  }

  render() {
    const { isThemeLight } = this.state;
    // const { classes } = this.props;

    const appData = this.state;

    const background = isThemeLight
      ? "linear-gradient(to bottom,#e8eaf6,#e8eaf6)"
      : "linear-gradient(to bottom,#e8f5e9,#e8f5e9)";

    // set the body color to the theme.
    document.body.style.background = background;

    return (
      <MuiThemeProvider theme={isThemeLight ? theme1 : theme2}>
        <CssBaseline />
        <div>
          <BrowserRouter>
            {this.state.refs.length > 0 ? (
              <DataProvider value={appData}>
                <Switch>
                  <Route exact path="/" component={Plotter} />
                </Switch>
              </DataProvider>
            ) : (
              <LinearProgress />
            )}
          </BrowserRouter>
        </div>
      </MuiThemeProvider>
    );
  }
}

export default withStyles(styles)(App);
