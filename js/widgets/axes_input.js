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
                    .style("user-select","none")
                    .attr("class", "row")
                    .append("div")
                        .attr("class", "col"),
                yaxis = container.append("div")
                    .style("user-select","none")
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

            //Appends the "+" svg/button for the xaxis
            let x_plus = xaxis.append("div")
                .attr("title", "x_plus")
                .style("margin-left", "5px")
                .style("display", "inline-block")
                .style("cursor","pointer")
                .append("svg")
                    .attr("width", "24px")
                    .attr("height", "20px")
                    .attr("baseProfile", "full")
                    .attr("viewBox", "0 0 25 25")
                    .attr("version", "1.1")
                    .attr("xmlns", "http://www.w3.org/2000/svg")
                    .on("click", function() {
                        let value_change = 50;
                        let xmin = parseInt($("#axes-input").axes_input("get_axis_values", 1, value_change));
                        let xmax = parseInt($("#axes-input").axes_input("get_axis_values", 0, value_change));
                        $("#axes-input").axes_input("change_axis_limits", xmin - value_change, xmax + value_change, null, null)
                    })
            
                x_plus.append("path")
                    .attr("d", "m 1 1 l 24 0 l 0 24 l -24 0 l 0 -24 m 4 12 l 14 0 m -6 -8 l 0 16")
                    .attr("fill", "none")
                    .attr("stroke", "orange")
                    .attr("stroke-width", 2)
                    .node();

            //Appends the "-" svg/button for the xaxis
            let x_minus = xaxis.append("div")
                .attr("title", "x_minus")
                .style("margin-left", "5px")
                .style("display", "inline-block")
                .style("cursor","pointer")
                .append("svg")
                    .attr("width", "24px")
                    .attr("height", "20px")
                    .attr("baseProfile", "full")
                    .attr("viewBox", "0 0 25 25")
                    .attr("version", "1.1")
                    .attr("xmlns", "http://www.w3.org/2000/svg")
                    .on("click", function() {
                        let value_change = 50;
                        let xmin = parseInt($("#axes-input").axes_input("get_axis_values", 1, value_change));
                        let xmax = parseInt($("#axes-input").axes_input("get_axis_values", 0, value_change));
                        $("#axes-input").axes_input("change_axis_limits", xmin + value_change, xmax - value_change, null, null)
                    })
            
                x_minus.append("path")
                    .attr("d", "m 1 1 l 24 0 l 0 24 l -24 0 l 0 -24 m 4 12 l 14 0")
                    .attr("fill", "none")
                    .attr("stroke", "orange")
                    .attr("stroke-width", 2)
                    .node();
                

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

            //Appends the "+" svg/button for the yaxis
            let y_plus = yaxis.append("div")
                .attr("title", "y_plus")
                .style("margin-left", "5px")
                .style("display", "inline-block")
                .style("cursor","pointer")
                .append("svg")
                    .attr("width", "24px")
                    .attr("height", "20px")
                    .attr("baseProfile", "full")
                    .attr("viewBox", "0 0 25 25")
                    .attr("version", "1.1")
                    .attr("xmlns", "http://www.w3.org/2000/svg")
                    .on("click", function() {
                        let value_change = .1;
                        let ymin = parseFloat($("#axes-input").axes_input("get_axis_values", 3, value_change));
                        let ymax = parseFloat($("#axes-input").axes_input("get_axis_values", 2, value_change));
                        $("#axes-input").axes_input("change_axis_limits", null, null, ymin - value_change, ymax + value_change);
                    })
            
                y_plus.append("path")
                    .attr("d", "m 1 1 l 24 0 l 0 24 l -24 0 l 0 -24 m 4 12 l 14 0 m -6 -8 l 0 16")
                    .attr("fill", "none")
                    .attr("stroke", "orange")
                    .attr("stroke-width", 2)
                    .node();

            //Appends the "-" svg/button for the yaxis
            let y_minus = yaxis.append("div")
                .attr("title", "y_minus")
                .style("margin-left", "5px")
                .style("display", "inline-block")
                .style("cursor","pointer")
                .append("svg")
                    .attr("width", "24px")
                    .attr("height", "20px")
                    .attr("baseProfile", "full")
                    .attr("viewBox", "0 0 25 25")
                    .attr("version", "1.1")
                    .attr("xmlns", "http://www.w3.org/2000/svg")
                    .on("click", function() {
                        let value_change = .1;
                        let ymin = parseFloat($("#axes-input").axes_input("get_axis_values", 3, value_change));
                        let ymax = parseFloat($("#axes-input").axes_input("get_axis_values", 2, value_change));
                        $("#axes-input").axes_input("change_axis_limits", null, null, parseFloat(ymin + value_change), parseFloat(ymax - value_change));
                    })
            
                y_minus.append("path")
                    .attr("d", "m 1 1 l 24 0 l 0 24 l -24 0 l 0 -24 m 4 12 l 14 0")
                    .attr("fill", "none")
                    .attr("stroke", "orange")
                    .attr("stroke-width", 2)
                    .node();
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
            this._elements.xmin_text.node().value = Math.round(this.xmin * 100) / 100;
            this._elements.xmax_text.node().value = Math.round(this.xmax * 100) / 100;
            // If the strands are combined, the y axis limit text boxes show 0 for the lower limit and the difference for the upper limit
            this._elements.ymin_text.node().value = this.combined ? 0 : Math.round(this.ymin * 100) / 100;
            this._elements.ymax_text.node().value = this.combined ? Math.round((this.ymax - this.ymin) * 100)/100 : Math.round(this.ymax * 100) / 100;

            // Change the plot, if requested
            if (change_plot) {
                $("#main-plot").main_plot("scale_axes", this.xmin, this.xmax, this.ymin, this.ymax);
                $("#settings-table").settings_table("plot_all_composites")
            }
        },

        //Returns the current value an axis given an integer and a value the axis is being changed by (so the function calling it can default to zero)
        get_axis_values: function(axis, change_val) {
            if (parseInt(axis) == 0){
                return (this.xmax > change_val) ? this.xmax : change_val;
            }
            else if (parseInt(axis) == 1){
                return (this.xmin < -change_val) ? this.xmin : -change_val;
            }
            else if (parseInt(axis) == 2){
                return (this.ymax > change_val) ? this.ymax : change_val;
            }
            else if (parseInt(axis) == 3){
                return (this.ymin < -change_val) ? this.ymin : -change_val;
            }
            else{
                return null;
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