$(function() {
    // Axes input widget
    $.widget("composite_plot.axes_input", {
        // Default axis limits
        xmin: -500,
        xmax: 500,
        ymax: 1,

        _elements: {
            xmin_text: null,
            xmax_text: null,
            ymax_text: null
        },

        _create: function() {
            let container = d3.select(this.element.context),
                xaxis = container.append("div")
                    .attr("class", "row")
                    .append("div")
                        .attr("class", "col"),
                yaxis = container.append("div")
                    .attr("class", "row")
                    .append("div")
                        .attr("class", "col");

            xaxis.append("label")
                .attr("for", "xmin-text")
                .text("x axis limits:");

            this._elements.xmin_text = xaxis.append("input")
                .attr("id", "xmin-text")
                .attr("type", "text")
                .attr("value", this.xmin)
                .style("width", "50px")
                .on("change", function() {$("#axes-input").axes_input("change_axis_limits", this.value, null, null)});

            this._elements.xmax_text = xaxis.append("input")
                .attr("id", "xmax-text")
                .attr("type", "text")
                .attr("value", this.xmax)
                .style("width", "50px")
                .style("margin-left", "5px")
                .on("change", function() {$("#axes-input").axes_input("change_axis_limits", null, this.value, null)});

            yaxis.append("label")
                .attr("for", "ymax-text")
                .text("y axis max:");

            this._elements.ymax_text = yaxis.append("input")
                .attr("id", "ymax-text")
                .attr("type", "text")
                .attr("value", this.ymax)
                .style("width", "40px")
                .on("change", function() {$("#axes-input").axes_input("change_axis_limits", null, null, this.value)})
        },

        change_axis_limits: function(xmin, xmax, ymax, change_plot=true) {
            if (xmin !== null) {
                this.xmin = xmin;
            };
            if (xmax !== null) {
                this.xmax = xmax;
            };
            if (ymax !== null) {
                this.ymax = ymax;
            };

            this._elements.xmin_text.node().value = this.xmin;
            this._elements.xmax_text.node().value = this.xmax;
            this._elements.ymax_text.node().value = this.ymax;

            if (change_plot) {
                $("#main-plot").main_plot("scale_axes", this.xmin, this.xmax, this.ymax);
                $("#settings-table").settings_table("plot_all_composites")
            }
        },

        toggle_locked: function(locked) {
            this._elements.xmin_text
                .property("disabled", locked)
                .style("background-color", locked ? "#DDDDDD" : "white");
            this._elements.xmax_text
                .property("disabled", locked)
                .style("background-color", locked ? "#DDDDDD" : "white");
            this._elements.ymax_text
                .property("disabled", locked)
                .style("background-color", locked ? "#DDDDDD" : "white")
        }
    });

    $("#axes-input").axes_input()
})