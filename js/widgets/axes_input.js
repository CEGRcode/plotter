$(function() {
    // Axes input widget
    $.widget("composite_plot.axes_input", {
        // Default axis limits
        xmin: -500,
        xmax: 500,
        ymin: -1,
        ymax: 1,

        // Flag to indicate whether axes are locked
        locked: false,

        // Flag to indicate whether the strands are combined
        combined: false,

        _elements: {
            xmin_text: null,
            xmax_text: null,
            ymin_text: null,
            ymax_text: null
        },

        _create: function() {
            // Create container for axis controls
            let container = d3.select(this.element.context),
                xaxis = container.append("div")
                    .attr("class", "row")
                    .append("div")
                        .attr("class", "col"),
                yaxis = container.append("div")
                    .attr("class", "row")
                    .append("div")
                        .attr("class", "col");

            // Create x axis controls
            xaxis.append("label")
                .attr("for", "xmin-text")
                .text("x axis limits:");

            this._elements.xmin_text = xaxis.append("input")
                .attr("id", "xmin-text")
                .attr("type", "text")
                .attr("value", this.xmin)
                .style("width", "50px")
                .on("change", function() {$("#axes-input").axes_input("change_axis_limits", this.value, null, null, null)});

            this._elements.xmax_text = xaxis.append("input")
                .attr("id", "xmax-text")
                .attr("type", "text")
                .attr("value", this.xmax)
                .style("width", "50px")
                .style("margin-left", "5px")
                .on("change", function() {$("#axes-input").axes_input("change_axis_limits", null, this.value, null, null)});

            // Create y axis controls
            yaxis.append("label")
                .attr("for", "ymin-text")
                .text("y axis limits:");

            this._elements.ymin_text = yaxis.append("input")
                .attr("id", "ymin-text")
                .attr("type", "text")
                .attr("value", this.ymin)
                .style("width", "50px")
                .on("change", function() {$("#axes-input").axes_input("change_axis_limits", null, null, this.value, null)});

            this._elements.ymax_text = yaxis.append("input")
                .attr("id", "ymax-text")
                .attr("type", "text")
                .attr("value", this.ymax)
                .style("width", "50px")
                .style("margin-left", "5px")
                .on("change", function() {$("#axes-input").axes_input("change_axis_limits", null, null, null, this.value)})
        },

        change_axis_limits: function(xmin, xmax, ymin, ymax, change_plot=true) {
            // Change x axis limits
            if (xmin !== null) {
                this.xmin = xmin;
            };
            if (xmax !== null) {
                this.xmax = xmax;
            };
            // Change y axis limits
            if (this.combined && change_plot) {
                // If the strands are combined, the y axis limits are scaled relative to the difference
                if (ymax !== null) {
                    let factor = ymax / (this.ymax - this.ymin);
                    this.ymin = (this.ymin * factor).toPrecision(2);
                    this.ymax = (this.ymax * factor).toPrecision(2)
                }
            } else {
                if (ymin !== null) {
                    this.ymin = ymin;
                };
                if (ymax !== null) {
                    this.ymax = ymax;
                }
            };

            // Change the text boxes
            this._elements.xmin_text.node().value = this.xmin;
            this._elements.xmax_text.node().value = this.xmax;
            // If the strands are combined, the y axis limit text boxes show 0 for the lower limit and the difference for the upper limit
            this._elements.ymin_text.node().value = this.combined ? 0 : this.ymin;
            this._elements.ymax_text.node().value = this.combined ? this.ymax - this.ymin : this.ymax;

            // Change the plot, if requested
            if (change_plot) {
                $("#main-plot").main_plot("scale_axes", this.xmin, this.xmax, this.ymin, this.ymax);
                $("#settings-table").settings_table("plot_all_composites")
            }
        },

        toggle_combined: function(combined) {
            this.combined = combined;
            // If the strands are combined, the y axis limit text boxes show 0 for the lower limit and the difference for the upper limit
            this._elements.ymin_text.node().value = combined ? 0 : this.ymin;
            this._elements.ymax_text.node().value = combined ? this.ymax - this.ymin : this.ymax;

            // Disable the y axis lower limit text box if the strands are combined
            this._elements.ymin_text
                .property("disabled", combined || this.locked)
                .style("background-color", combined || this.locked ? "#DDDDDD" : "white")
        },

        toggle_locked: function(locked) {
            this.locked = locked;

            // Disable the text boxes if the axes are locked
            this._elements.xmin_text
                .property("disabled", locked)
                .style("background-color", locked ? "#DDDDDD" : "white");
            this._elements.xmax_text
                .property("disabled", locked)
                .style("background-color", locked ? "#DDDDDD" : "white");
            this._elements.ymin_text
                .property("disabled", locked || this.combined)
                .style("background-color", locked || this.combined ? "#DDDDDD" : "white");
            this._elements.ymax_text
                .property("disabled", locked)
                .style("background-color", locked ? "#DDDDDD" : "white")
        }
    });

    $("#axes-input").axes_input()
})