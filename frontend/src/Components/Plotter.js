import React, { Component } from "react";
import axios from "axios";

// material-ui imports
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Divider from "@material-ui/core/Divider";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import Paper from "@material-ui/core/Paper";
import Checkbox from "@material-ui/core/Checkbox";
import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Slider from "@material-ui/core/Slider";
import LinearProgress from "@material-ui/core/LinearProgress";

import {
  TextField,
  CardActions,
  Select,
  MenuItem,
  FormHelperText,
  CardContent,
  Tooltip
} from "@material-ui/core";

import CompositePlot from "./FeatureCompositePlot";
import FastaComposite from "./FastaComposite";
import { SketchPicker } from "react-color";

// ContextAPI
import DataContext from "./DataContext";

// Configuration
import Config from "../Config";

// component styles.
const styles = theme => ({
  container: {
    padding: 20
  },
  selectStyle: {
    width: 120
  },
  bars: {
    // marginTop: -300,
    border: "2px solid green"
  },
  exportButton: {
    // marginLeft: 10
  },
  textfield: {
    width: 130
  }
});

function ValueLabelComponent(props) {
  const { children, open, value } = props;

  return (
    <Tooltip open={open} enterTouchDelay={0} placement="top" title={value}>
      {children}
    </Tooltip>
  );
}

ValueLabelComponent.propTypes = {
  children: PropTypes.element.isRequired,
  open: PropTypes.bool.isRequired,
  value: PropTypes.number.isRequired
};

class Plotter extends Component {
  static contextType = DataContext;

  state = {
    categories: this.context.categories,
    selectedCategory: this.context.selectedCategory,
    referencePoints: this.context.refs,
    selectedRef: this.context.refs[0],
    datasets: [],
    plotData: [],
    data: [],
    plotted: [],
    plotColor: "",
    fastaData: [],
    xWidth: 250,
    yWidth: 1,
    plotStyle: "monotoneX",
    areaEnabled: true,
    areaOpacity: 0.2,
    enableFasta: true,
    enableScaling: true
  };

  async componentDidMount() {
    let requestOne =
      Config.settings.datasets +
      "?category=" +
      this.context.selectedCategory +
      "&ref=" +
      this.context.refs[0];
    const responseOne = await axios.get(requestOne);

    const items = responseOne.data.datasets.map(item => {
      return item.proteinName;
    });

    const sortedItems = items.sort();

    let requestTwo =
      Config.settings.fasta +
      "?category=" +
      this.context.selectedCategory +
      "&ref=" +
      this.context.refs[0];
    const responseTwo = await axios.get(requestTwo);

    // console.log(responseOne, responseTwo.data.data[0].plotData);

    this.setState({
      datasets: sortedItems,
      plotData: responseOne.data.datasets,
      fastaData: responseTwo.data.data[0].plotData
    });
  }

  fetchDataset = async () => {
    let requestOne =
      Config.settings.datasets +
      "?category=" +
      this.state.selectedCategory +
      "&ref=" +
      this.state.selectedRef;
    const responseOne = await axios.get(requestOne);

    const items = responseOne.data.datasets.map(item => {
      return item.proteinName;
    });

    const sortedItems = items.sort();

    let requestTwo =
      Config.settings.fasta +
      "?category=" +
      this.state.selectedCategory +
      "&ref=" +
      this.state.selectedRef;
    const responseTwo = await axios.get(requestTwo);

    // console.log(responseOne, responseTwo.data.data[0].plotData);

    this.setState({
      datasets: sortedItems,
      plotData: responseOne.data.datasets,
      fastaData: responseTwo.data.data[0].plotData
    });
  };

  fetchRefs = async () => {
    axios
      .get(Config.settings.refs + "?category=" + this.state.selectedCategory)
      .then(res => {
        // set state for refs
        this.setState({
          referencePoints: res.data.referencePoints,
          selectedRef: res.data.referencePoints[0]
        });
      })
      .then(() => {
        this.fetchDataset();
      })
      .catch(error => {
        console.log(error);
      });
  };

  // Plot settings
  handleXWidth = event => {
    let winValue = event.target.value > 0 ? event.target.value : 250;
    this.setState({ xWidth: winValue });
  };

  handleYWidth = event => {
    let winValue = event.target.value > 0 ? event.target.value : 1;
    this.setState({ yWidth: winValue });
  };

  handlePlotStyle = event => {
    this.setState({ plotStyle: event.target.value });
  };

  handleArea = event => {
    // let value = event.target.checked ? true : false;
    this.setState({ areaEnabled: event.target.checked });
  };

  handleScaling = event => {
    // let value = event.target.checked ? true : false;
    this.setState({ enableScaling: event.target.checked });
  };

  handleFasta = event => {
    this.setState({ enableFasta: event.target.checked });
  };

  // Handle data loading
  handleCheckboxClick = event => {
    // console.log(event.target.name);
    let temp = event.target.name.split("-");
    let senseName = event.target.name + "-Sense";
    let antiName = event.target.name + "-Anti";
    // console.log(temp);

    const tem = this.state.plotData.filter(d => {
      return d.proteinName === temp[2];
    });

    let checkedItems = this.state.plotted;
    checkedItems.push(event.target.name);

    let plot = tem[0].plotData.map(line => {
      // console.log(line.color);
      line.color = this.state.plotColor;
      return line;
    });

    if (this.state.enableScaling) {
      // To generate the data after multplying with a scaling factor.
      plot = plot.map(t => {
        let modifiedData = t.data.map(b => {
          // console.log(b.y, parseFloat(b.y) * tem[0].totalTagScaling);
          return { x: b.x, y: parseFloat(b.y) * tem[0].totalTagScaling };
        });
        return { _id: t._id, color: t.color, data: modifiedData, id: t.id };
      });
    }

    // https://stackoverflow.com/questions/31673587/error-unable-to-verify-the-first-certificate-in-nodejs
    // https://www.npmjs.com/package/ssl-root-cas

    if (event.target.checked) {
      this.setState({
        data: [...this.state.data, ...plot],
        plotted: checkedItems
      });
    } else {
      console.log(
        event.target.name +
          " is already plotted, Removing it from the data list"
      );

      let filteredData = this.state.data.filter(item => {
        return item.id !== senseName && item.id !== antiName;
      });
      let uncheckedItems = this.state.plotted.filter(item => {
        return item !== event.target.name;
      });
      this.setState({ data: filteredData, plotted: uncheckedItems });
    }
  };

  handleCategory = async event => {
    // When category changes, fetch references -> datasets -> fasta
    await this.setState({
      selectedCategory: event.target.value,
      referencePoints: [],
      selectedRef: "",
      datasets: [],
      fastaData: [],
      data: [],
      plotted: []
    });

    // add references
    this.fetchRefs();
  };

  handleRefChange = async event => {
    // https://github.com/facebook/react/issues/6179
    await this.setState({
      selectedRef: event.target.value,
      datasets: [],
      data: [],
      plotData: [],
      plotted: [],
      fastaData: []
    });

    // add datasets
    this.fetchDataset();
    // add fasta
  };

  handleReset = async () => {
    await this.setState({
      categories: this.context.categories,
      selectedCategory: this.context.selectedCategory,
      referencePoints: this.context.refs,
      selectedRef: this.context.refs[0],
      datasets: [],
      plotData: [],
      data: [],
      plotted: [],
      plotColor: "",
      fastaData: []
    });

    // fetchDataset
    this.fetchDataset();
  };

  // Color picker for the plot
  handleSketchChange = color => {
    this.setState({ plotColor: color.hex });
    // console.log(color);
  };

  handleSliderChange = (event, value) => {
    this.setState({ areaOpacity: value });
  };

  render() {
    const { classes } = this.props;
    const {
      categories,
      selectedCategory,
      referencePoints,
      selectedRef,
      datasets,
      plotted,
      plotColor
    } = this.state;

    const {
      xWidth,
      yWidth,
      plotStyle,
      areaEnabled,
      fastaData,
      areaOpacity,
      enableFasta,
      enableScaling
    } = this.state;

    return (
      <Paper className={classes.container}>
        <h1>Plotter</h1>

        {/* Plot controls */}
        <CardActions>
          <Grid container direction="row" spacing={2}>
            <Grid item>
              <TextField
                id="xWidth-textfield"
                label="X-axis (Max)"
                variant="outlined"
                margin="dense"
                className={classes.textfield}
                onChange={this.handleXWidth}
              />
            </Grid>
            <Grid item>
              <TextField
                id="yWidth-textfield"
                label="Y-axis (Max)"
                variant="outlined"
                margin="dense"
                className={classes.textfield}
                onChange={this.handleYWidth}
              />
            </Grid>
            <Grid item>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={plotStyle}
                margin="dense"
                className={classes.selectStyle}
                onChange={this.handlePlotStyle}
              >
                <MenuItem value={"linear"}>Linear</MenuItem>
                <MenuItem value={"monotoneX"}>MonotoneX</MenuItem>
              </Select>
              <FormHelperText>Choose plot style</FormHelperText>
            </Grid>
            <Grid item>
              <FormGroup row>
                <FormControlLabel
                  control={
                    <Checkbox
                      color="primary"
                      name="enableArea"
                      checked={areaEnabled}
                      onClick={this.handleArea}
                    />
                  }
                  label="Enable Area"
                />
              </FormGroup>
            </Grid>
            <Grid item>
              <Typography gutterBottom>Area Opacity</Typography>
              <Slider
                ValueLabelComponent={ValueLabelComponent}
                aria-label="custom thumb label"
                defaultValue={areaOpacity}
                max={1}
                step={0.1}
                style={{ width: 100 }}
                onChangeCommitted={this.handleSliderChange}
              />
            </Grid>
            <Grid item>
              <FormGroup row>
                <FormControlLabel
                  control={
                    <Checkbox
                      color="primary"
                      name="enableFasta"
                      checked={enableFasta}
                      onClick={this.handleFasta}
                    />
                  }
                  label="Show Fasta Sequence"
                />
              </FormGroup>
            </Grid>
            <Grid item>
              <FormGroup row>
                <FormControlLabel
                  control={
                    <Checkbox
                      color="primary"
                      name="enableScaling"
                      checked={enableScaling}
                      onClick={this.handleScaling}
                    />
                  }
                  label="Enable Scaling (Total Tag)"
                />
              </FormGroup>
            </Grid>
          </Grid>
        </CardActions>

        {/* Plots */}
        <CompositePlot
          data={this.state.data}
          xWidth={xWidth}
          yWidth={yWidth}
          plotStyle={plotStyle}
          areaEnabled={areaEnabled}
          areaOpacity={areaOpacity}
        />
        {enableFasta ? <FastaComposite data={fastaData} xWidth={xWidth} /> : ""}
        <br />
        <Typography gutterBottom>
          No.of Datasets plotted : {plotted.length}
          <Button
            color="secondary"
            variant="outlined"
            onClick={this.handleReset}
            size="small"
            style={{ marginLeft: 20 }}
          >
            Reset plot
          </Button>
        </Typography>
        <Divider />
        <br />

        <Grid container spacing={4}>
          <Grid item>
            <Select
              labelId="category-select"
              id="category-select"
              value={selectedCategory}
              margin="dense"
              className={classes.selectStyle}
              onChange={this.handleCategory}
            >
              {categories.map(item => {
                return (
                  <MenuItem value={item} key={item}>
                    {item}
                  </MenuItem>
                );
              })}
            </Select>
            <FormHelperText>Select Gene Category</FormHelperText>
          </Grid>
          <Grid item>
            <Select
              labelId="referencePoint-select"
              id="referencePoint-select"
              value={selectedRef}
              margin="dense"
              className={classes.selectStyle}
              onChange={this.handleRefChange}
            >
              {referencePoints.map(item => {
                return (
                  <MenuItem value={item} key={selectedCategory + "-" + item}>
                    {item}
                  </MenuItem>
                );
              })}
            </Select>
            <FormHelperText>Select Reference Point</FormHelperText>
          </Grid>
          <Grid item>
            <SketchPicker
              color={plotColor}
              onChange={this.handleSketchChange}
              disableAlpha={false}
            />
            <h4 style={{ textAlign: "center" }}>Pick Plot Color</h4>
          </Grid>

          <Grid item style={{ width: 900 }}>
            <CardContent>
              {datasets.length > 0 ? (
                <FormGroup row>
                  {datasets.map(dat => {
                    return (
                      <FormControlLabel
                        key={selectedCategory + "-" + selectedRef + "-" + dat}
                        control={
                          <Checkbox
                            color="primary"
                            name={
                              selectedCategory + "-" + selectedRef + "-" + dat
                            }
                            onClick={this.handleCheckboxClick}
                            checked={plotted.includes(
                              selectedCategory + "-" + selectedRef + "-" + dat
                            )}
                          />
                        }
                        style={{ borderLeft: "1px solid gray", width: 130 }}
                        label={dat}
                      />
                    );
                  })}
                </FormGroup>
              ) : (
                <Typography component="div" gutterBottom>
                  Loading datasets
                  <LinearProgress />
                </Typography>
              )}
            </CardContent>
          </Grid>
        </Grid>
      </Paper>
    );
  }
}

Plotter.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Plotter);
