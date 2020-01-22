import React from "react";
import ReactDOMServer from "react-dom/server";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import CardContent from "@material-ui/core/CardContent";
import ImportIcon from "@material-ui/icons/GetApp";
import IconButton from "@material-ui/core/IconButton";
import { ResponsiveLine, Line } from "@nivo/line";
import Tooltip from "@material-ui/core/Tooltip";

// component styles
const styles = {
  card: {
    minWidth: 275
  },
  chartContainer: {
    height: 700
  },
  exportButton: {
    // marginLeft: 10
  },
  textfield: {
    width: 130
  },
  selectStyle: {
    marginTop: 8
  }
};

class FeatureCompositePlot extends React.Component {
  render() {
    const { classes } = this.props;
    const { xWidth, yWidth, plotStyle, areaEnabled, areaOpacity } = this.props;

    const plotData = this.props.data;

    const plotOptions = {
      curve: plotStyle,
      enableArea: areaEnabled,
      margin: { top: 5, right: 50, bottom: 80, left: 60 },
      xScale: {
        type: "linear",
        stacked: false,
        min: -parseInt(xWidth),
        max: parseInt(xWidth)
      },
      yScale: {
        type: "linear",
        stacked: false,
        min: parseFloat(yWidth) > 1 ? -parseFloat(yWidth) : "auto",
        max: parseFloat(yWidth) > 1 ? parseFloat(yWidth) : "auto"
      },
      markers: [
        {
          axis: "x",
          value: 0,
          lineStyle: {
            stroke: "#000",
            strokeWidth: 2,
            strokeDasharray: (10, 8)
          },
          legend: ""
        },
        {
          axis: "y",
          value: 0,
          lineStyle: {
            stroke: "#000",
            strokeWidth: 2,
            strokeDasharray: (10, 8)
          }
        }
      ],
      axisBottom: {},
      axisLeft: {
        orient: "left",
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: "Tags",
        legendOffset: -50,
        legendPosition: "middle"
      },
      theme: {
        fontSize: 14,
        fontFamily: "Roboto Slab",
        markers: {
          textColor: "black",
          fontSize: 12
        }
      },
      colors: { datum: "color" },
      areaOpacity: areaOpacity,
      enablePoints: false,
      legends: []
    };

    // Function to export the plot as svg
    let svgString = "";
    const handleExport = () => {
      svgString = ReactDOMServer.renderToStaticMarkup(
        React.createElement(Line, {
          animate: false,
          isInteractive: false,
          renderWrapper: false,

          data: plotData,

          width: 1200,
          height: 500,

          ...plotOptions
        })
      );

      // creating an svg file and triggering download
      const element = document.createElement("a");
      const file = new Blob([svgString]);
      element.href = URL.createObjectURL(file);
      element.download = "compositePlot.svg";
      // Required for this to work in FireFox
      document.body.appendChild(element);
      element.click();
    };

    return (
      <div className={classes.card}>
        <Tooltip title="Composite SVG">
          <IconButton color="primary" onClick={handleExport}>
            <ImportIcon className={classes.exportButton} />
          </IconButton>
        </Tooltip>

        <CardContent className={classes.chartContainer}>
          <ResponsiveLine
            data={plotData}
            axisTop={null}
            axisRight={null}
            {...plotOptions}
            enablePoints={false}
            enableSlices={"x"}
          />
        </CardContent>
      </div>
    );
  }
}

FeatureCompositePlot.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(FeatureCompositePlot);
