import React from "react";
import ReactDOMServer from "react-dom/server";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import CardContent from "@material-ui/core/CardContent";
import ImportIcon from "@material-ui/icons/GetApp";
import IconButton from "@material-ui/core/IconButton";
import Tooltip from "@material-ui/core/Tooltip";
import { ResponsiveLine, Line } from "@nivo/line";

// component styles
const styles = {
  card: {
    minWidth: 275,
    marginTop: -130
  },
  chartContainer: {
    height: 250
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

class FastaComposite extends React.Component {
  state = {
    xWidth: 250
  };

  handleXWidth = event => {
    let winValue = event.target.value > 0 ? event.target.value : 250;
    this.setState({ xWidth: winValue });
  };

  render() {
    const { classes } = this.props;

    const plotData = this.props.data;

    const plotOptions = {
      curve: "step",
      enableArea: true,
      margin: { top: 5, right: 50, bottom: 80, left: 60 },
      xScale: {
        type: "linear",
        stacked: false,
        min: -parseInt(this.props.xWidth),
        max: parseInt(this.props.xWidth)
      },
      yScale: {
        type: "linear",
        stacked: false,
        max: 1.5
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
      axisBottom: {
        orient: "bottom",
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: "Distance from Center (bp)",
        legendOffset: 46,
        legendPosition: "middle"
      },
      axisLeft: {},
      theme: {
        fontSize: 14,
        fontFamily: "Roboto Slab",
        markers: {
          textColor: "black",
          fontSize: 12
        }
      },
      colors: { datum: "color" },
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
          areaOpacity: 1,
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
      element.download = "fastaSVG.svg";
      // Required for this to work in FireFox
      document.body.appendChild(element);
      element.click();
    };

    return (
      <div className={classes.card}>
        <Tooltip title="Fasta SVG">
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
            areaOpacity={1}
          />
        </CardContent>
      </div>
    );
  }
}

FastaComposite.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(FastaComposite);
