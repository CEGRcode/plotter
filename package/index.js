// Sliding window function
let sliding_window = function(arr, window) {
    let val = arr.slice(0, window).reduce((a, c) => a + c, 0) / window,
        new_arr = Array(arr.length - window + 1);
    new_arr[0] = val;
    for (let i = 0; i < arr.length - window; i++) {
        val += (arr[i + window] - arr[i]) / window;
        new_arr[i + 1] = val
    }
    return new_arr
};

// Main plot widget
$.widget("locus-plotter.composite_plot", {
    xscale: null,
    yscale: null,

    composite_data: [],

    options: {
        labels: {
            title: "Composite plot",
            xlabel: "Position (bp)",
            ylabel: "Occupancy (AU)"
        },
        axis_limits: {
            xmin: -500,
            xmax: 500,
            ymin: -1,
            ymax: 1
        },
        dimensions: {
            width: 450,
            height: 300,
            legend_width: 150
        },
        margins: {
            top: 30,
            right: 20,
            bottom: 35,
            left: 40
        },
        default_colors: [
            "#808080",
            "#A61181",
            "#278C18",
            "#67C8F3",
            "#F88B10",
            "#103129",
            "#5D77FE",
            "#98161A",
            "#68ECAC",
            "#F98E87",
            "#371230",
            "#535216",
            "#F72424",
            "#004F72",
            "#F34184",
            "#3CB9B3",
            "#B9B1F3",
            "#8B2243",
            "#B229BA",
            "#3A92E7"
        ],
        settings: {
            smoothing: 5,
            bp_shift: 0,
            combined: true
        }
    },

    _elements: {
        main_plot: null,
        midaxis: null,
        refline: null,
        labels: {
            title: null,
            xlabel: null,
            ylabel: null,
            xmin: null,
            xmax: null,
            ymin: null,
            ymax: null
        },
        composite_group: null,
        composites: [],
        legend: null,
        legend_items: []
    },

    _create: function() {
        // Create scales for raw values to svg coordinates
        let xscale = d3.scaleLinear()
            .domain([this.options.axis_limits.xmin, this.options.axis_limits.xmax])
            .range([this.options.margins.left, this.options.dimensions.width - this.options.margins.right]);
        this.xscale = xscale;
        let yscale = d3.scaleLinear()
            .domain(this.options.settings.combined ? [0, this.options.axis_limits.ymax - this.options.axis_limits.ymin] : [this.options.axis_limits.ymin, this.options.axis_limits.ymax])
            .range([this.options.dimensions.height - this.options.margins.bottom, this.options.margins.top]);
        this.yscale = yscale;
        
        // Create main plot
        let main_plot = d3.select(this.element.context)
            .attr("viewBox", "0 0 " + (this.options.dimensions.width + this.options.dimensions.legend_width) + " " + this.options.dimensions.height);
        this._elements.main_plot = main_plot;
        
        // Create axes
        main_plot.append("g")
            .attr("transform", "translate(0 " + (this.options.dimensions.height - this.options.margins.bottom) + ")")
            .call(d3.axisTop(xscale).tickFormat(""));
        main_plot.append("g")
            .attr("transform", "translate(0 " + this.options.margins.top + ")")
            .call(d3.axisBottom(xscale).tickFormat(""));
        main_plot.append("g")
            .attr("transform", "translate(" + this.options.margins.left + " 0)")
            .call(d3.axisRight(yscale).tickFormat(""));
        main_plot.append("g")
            .attr("transform", "translate(" + (this.options.dimensions.width - this.options.margins.right) + " 0)")
            .call(d3.axisLeft(yscale).tickFormat(""));
        this._elements.midaxis = main_plot.append("g")
            .attr("transform", "translate(0 " + yscale(0) + ")")
            .style("display", this.options.settings.combined ? null : "none");
        this._elements.midaxis.append("g")
            .call(d3.axisBottom(xscale).tickFormat(""));
        this._elements.midaxis.append("g")
            .call(d3.axisTop(xscale).tickFormat(""));
            
        // Create vertical line at reference point
        this._elements.refline = main_plot.append("line")
            .attr("x1", xscale(0))
            .attr("x2", xscale(0))
            .attr("y1", this.options.margins.top)
            .attr("y2", this.options.dimensions.height - this.options.margins.bottom)
            .attr("stroke", "gray")
            .attr("stroke-width", 1)
            .attr("stroke-dasharray", "5,5")
            .attr("opacity", .5);
            
        // Create labels
        this._elements.labels.title = main_plot.append("text")
            .attr("x", (this.options.dimensions.width + this.options.margins.left - this.options.margins.right) / 2)
            .attr("y", 20)
            .attr("font-size", 16)
            .style("text-anchor", "middle")
            .text(this.options.labels.title);
        this._elements.labels.xlabel = main_plot.append("text")
            .attr("x", (this.options.dimensions.width + this.options.margins.left - this.options.margins.right) / 2)
            .attr("y", this.options.dimensions.height - 5)
            .attr("font-size", 16)
            .style("text-anchor", "middle")
            .text(this.options.labels.xlabel);
        this._elements.labels.ylabel = main_plot.append("text")
            .attr("x", 12)
            .attr("y", (this.options.dimensions.height + this.options.margins.top - this.options.margins.bottom) / 2)
            .attr("transform", "rotate(-90 12 " + ((this.options.dimensions.height + this.options.margins.top - this.options.margins.bottom) / 2) + ")")
            .attr("font-size", 16)
            .style("text-anchor", "middle")
            .text(this.options.labels.ylabel);
        
        // Create axis bound labels
        this._elements.labels.xmin = main_plot.append("text")
            .attr("x", this.options.margins.left)
            .attr("y", this.options.dimensions.height - this.options.margins.bottom + 18)
            .style("text-anchor", "middle")
            .attr("font-size", "14px")
            .text(this.options.axis_limits.xmin);
        this._elements.labels.xmax = main_plot.append("text")
            .attr("x", this.options.dimensions.width - this.options.margins.right)
            .attr("y", this.options.dimensions.height - this.options.margins.bottom + 18)
            .style("text-anchor", "middle")
            .attr("font-size", "14px")
            .text(this.options.axis_limits.xmax);
        this._elements.labels.ymin = main_plot.append("text")
            .attr("x", 35)
            .attr("y", this.options.dimensions.height - this.options.margins.bottom)
            .style("text-anchor", "end")
            .attr("font-size", "14px")
            .text(this.options.settings.combined ? "" : this.options.axis_limits.ymin);
        this._elements.labels.ymax = main_plot.append("text")
            .attr("x", 35)
            .attr("y", this.options.margins.top + 10)
            .style("text-anchor", "end")
            .attr("font-size", "14px")
            .text(this.options.settings.combined ? this.options.axis_limits.ymax - this.options.axis_limits.ymin : this.options.axis_limits.ymax);

        // Create container for composites
        this._elements.composite_group = main_plot.append("g");

        // Create legend
        this._elements.legend = main_plot.append("g")
            .attr("transform", "translate(" + (this.options.dimensions.width - this.options.margins.right + 25) + " " + this.options.margins.top + ")")
    },

    change_title: function(title) {
        this.options.labels.title = title;
        this._elements.labels.title.text(title)
    },

    change_xlabel: function(xlabel) {
        this.options.labels.xlabel = xlabel;
        this._elements.labels.xlabel.text(xlabel)
    },

    change_ylabel: function(ylabel) {
        this.options.labels.ylabel = ylabel;
        this._elements.labels.ylabel.text(ylabel)
    },

    change_xaxis_limits: function(xmin, xmax) {
        this.options.axis_limits.xmin = xmin;
        this.options.axis_limits.xmax = xmax;
        this.xscale.domain([xmin, xmax]);

        this._elements.labels.xmin.text(xmin);
        this._elements.labels.xmax.text(xmax);

        this._elements.refline.attr("x1", this.xscale(0)).attr("x2", this.xscale(0))
    },

    change_yaxis_limits: function(ymin, ymax) {
        this.options.axis_limits.ymin = ymin;
        this.options.axis_limits.ymax = ymax;

        if (this.options.settings.combined) {
            this.yscale.domain([0, ymax - ymin]);

            this._elements.labels.ymax.text(ymax - ymin)
        } else {
            this.yscale.domain([ymin, ymax]);

            this._elements.labels.ymin.text(ymin);
            this._elements.labels.ymax.text(ymax);

            this._elements.midaxis.attr("transform", "translate(0 " + this.yscale(0) + ")")
        }
    },

    change_smoothing: function(smoothing) {
        this.options.settings.smoothing = smoothing
    },

    change_bp_shift: function(bp_shift) {
        this.options.settings.bp_shift = bp_shift
    },

    combine_strands: function() {
        this.options.settings.combined = true;
        this._elements.labels.ymin.style("display", "none");
        this._elements.midaxis.style("display", "none");
        this.change_yaxis_limits(this.options.axis_limits.ymin, this.options.axis_limits.ymax)
    },

    separate_strands: function() {
        this.options.settings.combined = false;
        this._elements.labels.ymin.style("display", null);
        this._elements.midaxis.style("display", null);
        this.change_yaxis_limits(this.options.axis_limits.ymin, this.options.axis_limits.ymax)
    },

    plot_composites: function() {
        let axis_limits = this.options.axis_limits,
            settings = this.options.settings,
            xscale = this.xscale,
            yscale = this.yscale;

        if (settings.combined) {
            this._elements.composites
                .attr("d", function(d) {
                    let len = d.xdomain.length,
                        // Shift the xdomain and occupancy arrays by the bp_shift
                        shifted_xdomain = d.xdomain.slice(settings.bp_shift, len - settings.bp_shift),
                        shifted_forward = d.forward.slice(0, len - 2 * settings.bp_shift),
                        shifted_reverse = d.reverse.slice(2 * settings.bp_shift, len),
                        // Combine the shifted forward and reverse occupancy arrays
                        combined_occupancy = shifted_forward.map((y, i) => y + shifted_reverse[i]),
                        // Smooth the xdomain and occupancy arrays
                        new_xdomain = sliding_window(shifted_xdomain, settings.smoothing),
                        new_occupancy = sliding_window(combined_occupancy, settings.smoothing),
                        // Truncate the xdomain and occupancy arrays to the axis limits
                        truncated_xdomain = new_xdomain.filter(x => x >= axis_limits.xmin && x <= axis_limits.xmax),
                        truncated_occupancy = new_occupancy.filter((_, i) => new_xdomain[i] >= axis_limits.xmin && new_xdomain[i] <= axis_limits.xmax);

                    return "M " + truncated_xdomain.map((x, i) => xscale(x) + " " + yscale(truncated_occupancy[i])).join(" L ")
                })
        } else {
            this._elements.composites
                .attr("d", function(d) {
                    // Smooth the xdomain and occupancy arrays
                    let smoothed_xdomain = sliding_window(d.xdomain, settings.smoothing),
                        smoothed_forward = sliding_window(d.forward, settings.smoothing),
                        smoothed_reverse = sliding_window(d.reverse, settings.smoothing),
                        // Truncate the xdomain and occupancy arrays to the axis limits
                        forward_xdomain = smoothed_xdomain.map(x => x + settings.bp_shift).filter(x => x >= axis_limits.xmin && x <= axis_limits.xmax),
                        reverse_xdomain = smoothed_xdomain.map(x => x - settings.bp_shift).filter(x => x >= axis_limits.xmin && x <= axis_limits.xmax),
                        forward_occupancy = smoothed_forward.filter((_, i) => smoothed_xdomain[i] + settings.bp_shift >= axis_limits.xmin &&
                            smoothed_xdomain[i] + settings.bp_shift <= axis_limits.xmax),
                        reverse_occupancy = smoothed_reverse.filter((_, i) => smoothed_xdomain[i] - settings.bp_shift >= axis_limits.xmin &&
                            smoothed_xdomain[i] - settings.bp_shift <= axis_limits.xmax);

                    return "M " + forward_xdomain.map((x, i) => xscale(x) + " " + yscale(forward_occupancy[i])).join(" L ") + " M " +
                        reverse_xdomain.map((x, i) => xscale(x) + " " + yscale(-reverse_occupancy[i])).join(" L ")
                })
        }
    },

    load_composites: function(composites) {
        this.composite_data = composites;

        let colors = this.options.default_colors;

        // Create composites
        this._elements.composites = this._elements.composite_group.selectAll("path")
            .data(composites)
            .join("path")
                .classed("composite-line", true)
                .attr("fill", "none")
                .attr("stroke-width", 1)
                .attr("stroke", (_, i) => colors[i])
                .attr("d", "");

        // Update axis limits and plot
        let xmin = Infinity, xmax = -Infinity, ymin = 0, ymax = 0;
        for (let composite of composites) {
            xmin = Math.min(xmin, composite.xdomain[0]);
            xmax = Math.max(xmax, composite.xdomain[composite.xdomain.length - 1]);
            ymax = Math.max(ymax, Math.max(...composite.forward));
            ymin = Math.min(ymin, -Math.max(...composite.reverse));
        };
        this.change_xaxis_limits(Math.floor(xmin), Math.ceil(xmax));
        this.change_yaxis_limits(Math.floor(ymin), Math.ceil(ymax));
        this.plot_composites();

        // Create legend items
        this._elements.legend_items = this._elements.legend.selectAll("g")
            .data(composites)
            .join("g")
                .classed("legend-element", true)
                .attr("transform", (_, i) => "translate(0 " + (i * 24) + ")");

        // Add legend color
        this._elements.legend_items.selectAll("rect")
            .data((_, i) => [i])
            .join("rect")
                .classed("legend-color", true)
                .attr("width", 15)
                .attr("height", 15)
                .attr("stroke", "#000000")
                .attr("stroke-width", 1)
                .attr("fill", (_, i) => colors[i]);

        // Add text
        this._elements.legend_items.selectAll("text")
            .data(d => [d])
            .join("text")
                .attr("x", 20)
                .attr("y", 10)
                .attr("font-size", "10px")
                .text(d => d.name)
    }
})