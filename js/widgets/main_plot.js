$(function() {
    // Main plot widget
    $.widget("composite_plot.main_plot", {
        title: "Composite plot",
        xmin: -500,
        xmax: 500,
        ymin: -1,
        ymax: 1,
        xlabel: "Position (bp)",
        ylabel: "Occupancy (AU)",
        width: 460,
        height: 300,
        margins: {top: 30, right: 170, bottom: 35, left: 40},
        xscale: null,
        yscale: null,
        opacity: 1,
        smoothing: 7,
        bp_shift: 0,
        combined: false,
        color_trace: false,
        locked: false,
        enable_tooltip: true,
        show_legend: true,

        _elements: {
            main_plot: null,
            xmin: null,
            xmax: null,
            ymin: null,
            ymax: null,
            title: null,
            xlabel: null,
            ylabel: null,
            ylabel_suffix: "",
            midaxis_top: null,
            midaxis_bottom: null,
            refline: null,
            reflabel: null,
            tooltip: null,
            composite_group: null,
            composites: [],
            legend: null,
            legend_items: []
        },

        _create: function() {
            let xscale = d3.scaleLinear()
                .domain([this.xmin, this.xmax])
                .range([this.margins.left, this.width - this.margins.right]);
            this.xscale = xscale;
            let yscale = d3.scaleLinear()
                .domain([this.ymin, this.ymax])
                .range([this.height - this.margins.bottom, this.margins.top]);
            this.yscale = yscale;

            let main_plot = d3.select(this.element.context)
                .attr("viewBox", "0 0 " + this.width + " " + this.height);
            this._elements.main_plot = main_plot;
            main_plot.append("g")
                .attr("transform", "translate(0 " + (this.height - this.margins.bottom) + ")")
                .call(d3.axisTop(xscale).tickFormat(""))
            main_plot.append("g")
                .attr("transform", "translate(0 " + this.margins.top + ")")
                .call(d3.axisBottom(xscale).tickFormat(""))
            main_plot.append("g")
                .attr("transform", "translate(" + this.margins.left + " 0)")
                .call(d3.axisRight(yscale).tickFormat(""));
            main_plot.append("g")
                .attr("transform", "translate(" + (this.width - this.margins.right) + " 0)")
                .call(d3.axisLeft(yscale).tickFormat(""));
            this._elements.midaxis_bottom = main_plot.append("g")
                .attr("transform", "translate(0 " + ((this.margins.top + this.height - this.margins.bottom) / 2) + ")")
                .call(d3.axisBottom(xscale).tickFormat(""));
            this._elements.midaxis_top = main_plot.append("g")
                .attr("transform", "translate(0 " + ((this.margins.top + this.height - this.margins.bottom) / 2) + ")")
                .call(d3.axisTop(xscale).tickFormat(""));
            this._elements.refline = main_plot.append("line")
                .attr("x1", xscale(0))
                .attr("x2", xscale(0))
                .attr("y1", yscale(this.ymin))
                .attr("y2", yscale(this.ymax))
                .attr("stroke", "gray")
                .attr("stroke-width", 1)
                .attr("stroke-dasharray", "5,5")
                .attr("opacity", .5);
            this._elements.xmin = main_plot.append("text")
                .attr("x", this.margins.left)
                .attr("y", this.height - this.margins.bottom + 15)
                .style("text-anchor", "middle")
                .attr("font-size", "14px")
                .text(this.xmin);
            this._elements.xmax = main_plot.append("text")
                .attr("x", this.width - this.margins.right)
                .attr("y", this.height - this.margins.bottom + 15)
                .style("text-anchor", "middle")
                .attr("font-size", "14px")
                .text(this.xmax);
            this._elements.ymin = main_plot.append("text")
                .attr("x", 30)
                .attr("y", this.height - this.margins.bottom)
                .style("text-anchor", "end")
                .attr("font-size", "14px")
                .text(this.ymin);
            this._elements.ymax = main_plot.append("text")
                .attr("x", 30)
                .attr("y", this.margins.top + 10)
                .style("text-anchor", "end")
                .attr("font-size", "14px")
                .text(this.ymax);
            this._elements.title = main_plot.append("g");
            $(this._elements.title.node()).editable_svg_text({
                label: "title",
                text: this.title,
                x: (this.width + this.margins.left - this.margins.right) / 2,
                y: 20,
                font_size: 16
            });
            this._elements.xlabel = main_plot.append("g");
            $(this._elements.xlabel.node()).editable_svg_text({
                label: "xlabel",
                text: this.xlabel,
                x: (this.width + this.margins.left - this.margins.right) / 2,
                y: this.height - 5,
                font_size: 16
            });
            this._elements.ylabel = main_plot.append("g");
            $(this._elements.ylabel.node()).editable_svg_text({
                label: "ylabel",
                text: this.ylabel,
                x: 12,
                y: (this.height + this.margins.top - this.margins.bottom) / 2,
                font_size: 16,
                rotation: "vertical"
            });

            this._elements.composite_group = main_plot.append("g");

            this._elements.legend = main_plot.append("g")
                .attr("transform", "translate(" + (this.width - this.margins.right + 25) + " " + this.margins.top + ")");

            this._elements.tooltip = main_plot.append("g")
                .attr("id", "composite-plot-tooltip");

            main_plot.on("mousemove", function(e) {
                $("#main-plot").main_plot("move_tooltip", e)
            });
            main_plot.on("mouseleave", function() {
                $("#main-plot").main_plot("hide_tooltip")
            });
        },

        _destroy: function() {
            this._elements.main_plot.remove()
        },

        add_composite: function(name, color) {
            let composite = this._elements.composite_group.insert("g", "g.composite")
                .classed("composite", true);

            composite.append("path")
                .classed("white-line", true)
                .attr("fill", "none")
                .attr("stroke", "#FFFFFF")
                .attr("stroke-width", 1)
                .attr("d", "")
                .style("display", this.color_trace ? "none" : null);

            composite.append("path")
                .classed("black-line", true)
                .attr("fill", "none")
                .attr("stroke", "#000000")
                .attr("stroke-width", 0.5)
                .attr("d", "")
                .style("display", this.color_trace ? "none" : null);

            composite.append("path")
                .classed("color-line-top", true)
                .attr("fill", "none")
                .attr("stroke-width", 1)
                .attr("d", "")
                .style("display", this.color_trace ? null : "none");

            composite.append("path")
                .classed("color-line-bottom", true)
                .attr("fill", "none")
                .attr("stroke-width", 1)
                .attr("d", "")
                .style("display", this.color_trace ? null : "none");

            composite.append("defs")
                .append("linearGradient")
                    .attr("id", "composite-gradient-top-" + this._elements.composites.length)
                    .classed("composite-gradient-top", true)
                    .attr("x1", "0%")
                    .attr("x2", "0%")
                    .attr("y1", "0%")
                    .attr("y2", "100%");

            composite.append("defs")
                .append("linearGradient")
                    .attr("id", "composite-gradient-bottom-" + this._elements.composites.length)
                    .classed("composite-gradient-bottom", true)
                    .attr("x1", "0%")
                    .attr("x2", "0%")
                    .attr("y1", "100%")
                    .attr("y2", "0%");

            composite.append("polygon")
                .classed("composite-fill-top", true)
                .attr("fill", "url(#composite-gradient-top-" + this._elements.composites.length + ")")
                .attr("stroke", "none");

            composite.append("polygon")
                .classed("composite-fill-bottom", true)
                .attr("fill", "url(#composite-gradient-bottom-" + this._elements.composites.length + ")")
                .attr("stroke", "none");

            this._elements.composites.push(composite);

            let legend_element = this._elements.legend.append("g")
                .classed("legend-element", true)
                .style("display", "none");

            legend_element.append("polygon")
                .classed("legend-color-sense", true)
                .attr("points", "0,0 15,0 15,15 0,15")
                .attr("fill", color);
            legend_element.append("polygon")
                .classed("legend-color-anti", true)
                .attr("points", "15,0 15,15 0,15")
                .attr("fill", color);
            legend_element.append("rect")
                .attr("width", 15)
                .attr("height", 15)
                .attr("stroke", "#000000")
                .attr("stroke-width", 1)
                .attr("fill", "none");
            legend_element.append("text")
                .attr("x", 20)
                .attr("y", 10)
                .attr("font-size", "10px")
                .text(name);

            this._elements.legend_items.push(legend_element)
        },

        remove_composite: function(i) {
            this._elements.composites[i].remove();
            this._elements.composites.splice(i, 1);

            this._elements.legend_items[i].remove();
            this._elements.legend_items.splice(i, 1);

            this.update_legend()
        },

        reset_composite: function(i) {
            let composite = this._elements.composites[i]
                .classed("plotted", false)
                .style("display", "none");

            composite.selectAll("path")
                .attr("d", "");
            composite.selectAll("polygon")
                .attr("points", "");

            this.change_name(i, "Composite " + i);
            this.update_legend()
        },

        plot_composite: function(xmin, xmax, sense, anti, scale, color, secondary_color, i, opacity, smoothing, bp_shift, hide) {
            let composite = this._elements.composites[i]
                .classed("plotted", !hide)
                .style("display", hide ? "none" : null),
                xdomain = Array.from({length: xmax - xmin + 1}, (d, j) => j + xmin);

            opacity = opacity === false ? this.opacity : opacity;
            smoothing = smoothing === false ? this.smoothing : smoothing;
            bp_shift = bp_shift === false ? this.bp_shift : bp_shift;

            if (this.combined) {
                let shifted_xdomain = xdomain.filter(x => x - bp_shift >= xdomain[0] && x - bp_shift <= xdomain[xdomain.length - 1]
                        && x + bp_shift >= xdomain[0] && x + bp_shift <= xdomain[xdomain.length - 1]),
                    shifted_sense = sense.filter((_, j) => xdomain[j] + bp_shift >= shifted_xdomain[0]
                        && xdomain[j] + bp_shift <= shifted_xdomain[shifted_xdomain.length - 1]),
                    shifted_anti = anti.filter((_, j) => xdomain[j] - bp_shift >= shifted_xdomain[0]
                        && xdomain[j] - bp_shift <= shifted_xdomain[shifted_xdomain.length - 1]),
                    combined_occupancy = shifted_sense.map((d, j) => d + shifted_anti[j]),
                    {new_xdomain, new_occupancy: smoothed_occupancy} = sliding_window(shifted_xdomain, combined_occupancy, smoothing),
                    truncated_xdomain = new_xdomain.filter(x => x >= this.xmin && x <= this.xmax),
                    scaled_occupancy = smoothed_occupancy.filter((_, j) => new_xdomain[j] >= this.xmin && new_xdomain[j] <= this.xmax)
                        .map(d => d * scale);

                composite.select(".composite-gradient-top")
                    .selectAll("stop")
                        .data([0, 1])
                        .join("stop")
                            .attr("offset", d => d)
                            .attr("stop-color", color)
                            .attr("stop-opacity", d => (1 - d) * opacity);

                if (this.color_trace) {
                    composite.select(".white-line")
                        .style("display", "none")
                        .datum(truncated_xdomain)
                        .attr("d", d3.line()
                            .x(d => this.xscale(d))
                            .y((_, j) => this.yscale(scaled_occupancy[j]))
                        );

                    composite.select(".black-line")
                        .style("display", "none")
                        .datum(truncated_xdomain)
                        .attr("d", d3.line()
                            .x(d => this.xscale(d))
                            .y((_, j) => this.yscale(scaled_occupancy[j]))
                        );

                    composite.select(".color-line-top")
                        .attr("stroke", color)
                        .style("display", null)
                        .datum(truncated_xdomain)
                        .attr("d", d3.line()
                            .x(d => this.xscale(d))
                            .y((_, j) => this.yscale(scaled_occupancy[j]))
                        )
                } else {
                    composite.select(".color-line-top")
                        .attr("stroke", color)
                        .style("display", "none")
                        .datum(truncated_xdomain)
                        .attr("d", d3.line()
                            .x(d => this.xscale(d))
                            .y((_, j) => this.yscale(scaled_occupancy[j]))
                        );

                    composite.select(".white-line")
                        .style("display", null)
                        .datum(truncated_xdomain)
                        .attr("d", d3.line()
                            .x(d => this.xscale(d))
                            .y((_, j) => this.yscale(scaled_occupancy[j]))
                        );

                    composite.select(".black-line")
                        .style("display", null)
                        .datum(truncated_xdomain)
                        .attr("d", d3.line()
                            .x(d => this.xscale(d))
                            .y((_, j) => this.yscale(scaled_occupancy[j]))
                        )
                };

                composite.select(".composite-fill-top")
                    .attr("points", truncated_xdomain.map((d, j) => this.xscale(d) + "," + this.yscale(scaled_occupancy[j])).join(" ") + " "
                        + this.xscale(truncated_xdomain[truncated_xdomain.length - 1]) + "," + this.yscale(0) + " "
                        + this.xscale(truncated_xdomain[0]) + "," + this.yscale(0))
            } else {
                let {new_xdomain, new_occupancy: smoothed_sense} = sliding_window(xdomain, sense, smoothing),
                    {new_occupancy: smoothed_anti} = sliding_window(xdomain, anti, smoothing),
                    truncated_sense_domain = new_xdomain.map(x => x + bp_shift).filter(x => x >= this.xmin && x <= this.xmax),
                    truncated_anti_domain = new_xdomain.map(x => x - bp_shift).filter(x => x >= this.xmin && x <= this.xmax),
                    scaled_sense = smoothed_sense.filter((_, j) => new_xdomain[j] + bp_shift >= this.xmin
                        && new_xdomain[j] + bp_shift <= this.xmax).map(d => d * scale),
                    scaled_anti = smoothed_anti.filter((_, j) => new_xdomain[j] - bp_shift >= this.xmin
                        && new_xdomain[j] - bp_shift <= this.xmax).map(d => d * scale);

                secondary_color = secondary_color || color;
                composite.select(".composite-gradient-top")
                    .selectAll("stop")
                        .data([0, 1])
                        .join("stop")
                            .attr("offset", d => d)
                            .attr("stop-color", color)
                            .attr("stop-opacity", d => (1 - d) * opacity);
                composite.select(".composite-gradient-bottom")
                    .selectAll("stop")
                        .data([0, 1])
                        .join("stop")
                            .attr("offset", d => d)
                            .attr("stop-color", secondary_color)
                            .attr("stop-opacity", d => (1 - d) * opacity);

                if (this.color_trace) {
                    composite.select(".white-line")
                        .style("display", "none")
                        .attr("d", "M" + truncated_sense_domain.map((d, j) => this.xscale(d) + " " + this.yscale(scaled_sense[j])).join("L")
                            + "M" + truncated_anti_domain.map((d, j) => this.xscale(d) + " " + this.yscale(-scaled_anti[j])).join("L"));

                    composite.select(".black-line")
                        .style("display", "none")
                        .attr("d", "M" + truncated_sense_domain.map((d, j) => this.xscale(d) + " " + this.yscale(scaled_sense[j])).join("L")
                            + "M" + truncated_anti_domain.map((d, j) => this.xscale(d) + " " + this.yscale(-scaled_anti[j])).join("L"));

                    composite.select(".color-line-top")
                        .attr("stroke", color)
                        .style("display", null)
                        .attr("d", "M" + truncated_sense_domain.map((d, j) => this.xscale(d) + " " + this.yscale(scaled_sense[j])).join("L")
                            + "M" + truncated_anti_domain.map((d, j) => this.xscale(d) + " " + this.yscale(-scaled_anti[j])).join("L"));

                    composite.select(".color-line-bottom")
                        .attr("stroke", secondary_color)
                        .style("display", null)
                        .attr("d", "M" + truncated_anti_domain.map((d, j) => this.xscale(d) + " " + this.yscale(-scaled_anti[j])).join("L"))
                } else {
                    composite.select(".color-line-top")
                        .attr("stroke", color)
                        .style("display", "none")
                        .attr("d", "M" + truncated_sense_domain.map((d, j) => this.xscale(d) + " " + this.yscale(scaled_sense[j])).join("L"));

                    composite.select(".color-line-bottom")
                        .attr("stroke", secondary_color)
                        .style("display", "none")
                        .attr("d", "M" + truncated_anti_domain.map((d, j) => this.xscale(d) + " " + this.yscale(-scaled_anti[j])).join("L"));

                    composite.select(".white-line")
                        .style("display", null)
                        .attr("d", "M" + truncated_sense_domain.map((d, j) => this.xscale(d) + " " + this.yscale(scaled_sense[j])).join("L")
                            + "M" + truncated_anti_domain.map((d, j) => this.xscale(d) + " " + this.yscale(-scaled_anti[j])).join("L"));

                    composite.select(".black-line")
                        .style("display", null)
                        .attr("d", "M" + truncated_sense_domain.map((d, j) => this.xscale(d) + " " + this.yscale(scaled_sense[j])).join("L")
                            + "M" + truncated_anti_domain.map((d, j) => this.xscale(d) + " " + this.yscale(-scaled_anti[j])).join("L"))
                };

                composite.select(".composite-fill-top")
                    .attr("points", truncated_sense_domain.map((d, j) => this.xscale(d) + "," + this.yscale(scaled_sense[j])).join(" ")
                        + " " + this.xscale(truncated_sense_domain[truncated_sense_domain.length - 1]) + "," + this.yscale(0)
                        + " " + this.xscale(truncated_sense_domain[0]) + "," + this.yscale(0));
                composite.select(".composite-fill-bottom")
                    .attr("points", truncated_anti_domain.map((d, j) => this.xscale(d) + "," + this.yscale(-scaled_anti[j])).join(" ")
                        + " " + this.xscale(truncated_anti_domain[truncated_anti_domain.length - 1]) + "," + this.yscale(0)
                        + " " + this.xscale(truncated_anti_domain[0]) + "," + this.yscale(0))
            }
        },

        scale_axes: function(xmin, xmax, ymin, ymax, allow_shrink=true, change_input=false) {
            if (this.locked) {
                return
            };

            if (xmin !== undefined && xmax !== undefined && ymax !== undefined) {
                if (allow_shrink) {
                    this.xmin = xmin;
                    this.xmax = xmax;
                    this.ymin = ymin;
                    this.ymax = ymax
                } else {
                    this.xmin = Math.min(this.xmin, xmin);
                    this.xmax = Math.max(this.xmax, xmax);
                    this.ymin = Math.min(this.ymin, ymin);
                    this.ymax = Math.max(this.ymax, ymax)
                }
            };

            this._elements.xmin.text(this.xmin);
            this._elements.xmax.text(this.xmax);
            let round_exp = 1 - Math.floor(Math.log10(this.ymax - this.ymin)),
                round_factor = 10 ** round_exp,
                exp_label = round_exp <= -2 || round_exp >= 2;
            this._elements.ylabel_suffix = exp_label ? " x10 <tspan font-size=\"8px\" baseline-shift=\"super\">" + (1 - round_exp) + "</tspan>" : "";
            if (this.combined) {
                this._elements.ymin.text("");
                this._elements.ymax.text(Math.round((this.ymax - this.ymin) * round_factor) / (exp_label ? 10 : round_factor))
            } else {
                this._elements.ymin.text(Math.round(this.ymin * round_factor) / (exp_label ? 10 : round_factor));
                this._elements.ymax.text(Math.round(this.ymax * round_factor) / (exp_label ? 10 : round_factor))
            };

            this.xscale = d3.scaleLinear()
                .domain([this.xmin, this.xmax])
                .range([this.margins.left, this.width - this.margins.right]);
            this.yscale = d3.scaleLinear()
                .domain(this.combined ? [0, this.ymax - this.ymin] : [this.ymin, this.ymax])
                .range([this.height - this.margins.bottom, this.margins.top]);

            this._elements.refline
                .attr("x1", this.xscale(0))
                .attr("x2", this.xscale(0))
                .attr("y1", this.yscale(this.combined ? 0 : this.ymin))
                .attr("y2", this.yscale(this.combined ? this.ymax - this.ymin : this.ymax))
                .style("display", this.xmin < 0 && this.xmax > 0 ? null : "none");

            this._elements.midaxis_top.attr("transform", "translate(0," + this.yscale(0) + ")");
            this._elements.midaxis_bottom.attr("transform", "translate(0," + this.yscale(0) + ")");

            this._elements.ylabel.select("text").html(this.ylabel + this._elements.ylabel_suffix);

            if (change_input) {
                $("#axes-input").axes_input("change_axis_limits", this.xmin, this.xmax, this.ymin, this.ymax, false)
            }
        },

        update_legend: function() {
            this._elements.legend.selectAll("g")
                .data(this._elements.composites.map((y => comp => [y += comp.classed("plotted") * 24, comp.classed("plotted") ? null : "none"])(-24)))
                .join("g")
                    .attr("transform", d => "translate(0," + d[0] + ")")
                    .style("display", d => d[1])
        },

        toggle_legend: function(show) {
            this.show_legend = show;
            this._elements.legend.style("display", show ? null : "none")
        },

        change_label: function(label, text) {
            this[label] = text
        },

        change_name: function(i, name) {
            this._elements.legend_items[i].select("text")
                .text(name)
        },

        change_color: function(i, color, sense_only=false) {
            let composite = this._elements.composites[i];
            composite.select(".composite-gradient-top")
                .selectAll("stop")
                    .attr("stop-color", color);
            composite.select(".color-line-top")
                .attr("stroke", color);
            this._elements.legend_items[i].selectAll("polygon")
                .attr("fill", color);

            if (!sense_only) {
                composite.select(".composite-gradient-bottom")
                    .selectAll("stop")
                        .attr("stop-color", color);
                composite.select(".color-line-bottom")
                    .attr("stroke", color);
            }
        },

        change_secondary_color: function(i, color) {
            let composite = this._elements.composites[i];
            composite.select(".composite-gradient-bottom")
                .selectAll("stop")
                    .attr("stop-color", color);
            composite.select(".color-line-bottom")
                .attr("stroke", color);
            this._elements.legend_items[i].select("polygon.legend-color-anti")
                .attr("fill", color)
        },

        change_opacity: function(i, opacity) {
            if (i === true) {
                this.opacity = opacity;
                $("#settings-table").settings_table("plot_all_composites")
            } else if (opacity === false) {
                this._elements.composites[i].select(".composite-gradient")
                    .selectAll("stop")
                        .attr("stop-opacity", (d, i) => (1 - i % 2) * this.opacity)
            } else {
                this._elements.composites[i].select(".composite-gradient")
                    .selectAll("stop")
                        .attr("stop-opacity", (d, i) => (1 - i % 2) * opacity)
            }
        },

        change_smoothing: function(smoothing) {
            this.smoothing = smoothing;

            $("#settings-table").settings_table("plot_all_composites")
        },

        change_bp_shift: function(bp_shift) {
            this.bp_shift = bp_shift;

            $("#settings-table").settings_table("plot_all_composites")
        },

        toggle_hide: function(i, hide) {
            this._elements.composites[i]
                .classed("plotted", !hide)
                .style("display", hide ? "none" : null);

            this.update_legend()
        },

        change_order: function(drag_idx, drop_idx, insert_after) {
            if (drag_idx !== drop_idx) {
                let drag_comp = this._elements.composites[drag_idx],
                    drop_comp = this._elements.composites[drop_idx],
                    drag_legend_item = this._elements.legend_items[drag_idx],
                    drop_legend_item = this._elements.legend_items[drop_idx];
                if (insert_after) {
                    $(drag_comp.node()).insertBefore(drop_comp.node());
                    $(drag_legend_item.node()).insertAfter(drop_legend_item.node())
                } else {
                    $(drag_comp.node()).insertAfter(drop_comp.node());
                    $(drag_legend_item.node()).insertBefore(drop_legend_item.node())
                };

                this._elements.composites.splice(drag_idx, 1);
                this._elements.composites.splice(drop_idx + insert_after - (drop_idx > drag_idx), 0, drag_comp);
                this._elements.legend_items.splice(drag_idx, 1);
                this._elements.legend_items.splice(drop_idx + insert_after - (drop_idx > drag_idx), 0, drag_legend_item);

                this.update_legend()
            }
        },

        toggle_combined: function(combine, plot=true) {
            this.combined = combine;

            this._elements.midaxis_top.style("display", combine ? "none" : null);
            this._elements.midaxis_bottom.style("display", combine ? "none" : null);

            this._elements.composites.forEach(function(comp) {
                comp.select(".color-line-bottom")
                    .style("display", combine ? "none" : null);
                comp.select(".composite-fill-bottom")
                    .style("display", combine ? "none" : null)
            })

            if (plot) {
                this.scale_axes(undefined, undefined, undefined, true, false);

                $("#settings-table").settings_table("plot_all_composites")
            }
        },

        toggle_color_trace: function(color_trace) {
            this.color_trace = color_trace;

            if (color_trace) {
                this._elements.composite_group.selectAll(".composite .color-line-top")
                    .style("display", null);
                this._elements.composite_group.selectAll(".composite .color-line-bottom")
                    .style("display", null);
                this._elements.composite_group.selectAll(".composite .white-line")
                    .style("display", "none");
                this._elements.composite_group.selectAll(".composite .black-line")
                    .style("display", "none")
            } else {
                this._elements.composite_group.selectAll(".composite .color-line-top")
                    .style("display", "none");
                this._elements.composite_group.selectAll(".composite .color-line-bottom")
                    .style("display", "none");
                this._elements.composite_group.selectAll(".composite .white-line")
                    .style("display", null);
                this._elements.composite_group.selectAll(".composite .black-line")
                    .style("display", null)
            }

        },

        toggle_locked: function(locked) {
            this.locked = locked
        },

        toggle_tooltip: function(enable) {
            this.enable_tooltip = enable
        },

        move_tooltip: function(ev) {
            if (this.enable_tooltip) {
                let data = $("#settings-table").settings_table("export").filter(d => d.files_loaded > 0 && !d.hide),
                    {x: plot_x, y: plot_y, width, height} = this._elements.main_plot.node().getBoundingClientRect(),
                    mouse_x = (ev.clientX - plot_x) * this.width / width,
                    mouse_y = (ev.clientY - plot_y) * this.height / height;

                if (mouse_x >= this.margins.left && mouse_x <= this.width - this.margins.right &&
                    mouse_y >= this.margins.top && mouse_y <= this.height - this.margins.bottom) {
                    let mouse_x_scaled = Math.round(this.xscale.invert(mouse_x));
                    data = data.filter(d => d.xmin <= mouse_x_scaled && d.xmax >= mouse_x_scaled);

                    this._elements.tooltip
                        .style("display", null)
                        .attr("transform", "translate(" + this.xscale(mouse_x_scaled) + " " + mouse_y + ")");

                    let tooltip_border = this._elements.tooltip.selectAll("path")
                        .data([null])
                        .join("path")
                            .attr("fill", "white")
                            .attr("stroke", "black"),
                        tooltip_text = this._elements.tooltip.selectAll("text")
                        .data([null])
                        .join("text")
                            .attr("font-size", "8px")
                            .attr("stroke", "black")
                            .attr("stroke-width", "0.15px");

                    tooltip_text.selectAll("tspan")
                        .data([mouse_x_scaled, ...data])
                        .join("tspan")
                            .attr("x", 0)
                            .attr("y", (_, i) => (i * 1.1) + "em")
                            .attr("font-weight", (_, i) => i === 0 ? "bold" : null)
                            .attr("fill", (d, i) => i === 0 ? "black" : d.color)
                            .text((d, i) => i === 0 ? this.xlabel + ": " + d : d.name + ": " + (this.combined ? parseFloat((d.sense[mouse_x_scaled - d.xmin] + d.anti[mouse_x_scaled - d.xmin]).toPrecision(2))
                                : parseFloat(d.sense[mouse_x_scaled - d.xmin].toPrecision(2)) + "; " + parseFloat(d.anti[mouse_x_scaled - d.xmin].toPrecision(2))));
                    let {y, width: w, height: h} = tooltip_text.node().getBBox();
                    tooltip_text.attr("transform", "translate(" + (-w / 2) + " " + (15 - y) + ")");
                    tooltip_border.attr("d", "M" + (-w / 2 - 10) + ",5H-5l5,-5l5,5H" + (w / 2 + 10) + "v" + (h + 20) + "h-" + (w + 20) + "z")
                } else {
                    this._elements.tooltip.style("display", "none")
                }
            }
        },

        hide_tooltip: function() {
            this._elements.tooltip.style("display", "none")
        },

        download_as_svg: function() {
            let b64doc = btoa(unescape(encodeURIComponent(this.element.context.outerHTML))),
                a = document.createElement("a"),
                e = new MouseEvent("click");
            a.download = "composite_plot.svg";
            a.href = "data:image/svg+xml;base64," + b64doc;
            a.dispatchEvent(e)
        },

        toggle_svg_button: function() {
            let disable = this._elements.main_plot.selectAll("foreignObject").size() > 0;
            d3.select("#download-svg-button")
                .property("disabled", disable)
                .attr("title", disable ? "Cannot download SVG while labels are being edited" : null)
        },

        export: function() {
            return {title: this.title, xlabel: this.xlabel, ylabel: this.ylabel, opacity: this.opacity,
                smoothing: this.smoothing, bp_shift: this.bp_shift, xmin: this.xmin, xmax: this.xmax, ymin: this.ymin,
                ymax: this.ymax, combined: this.combined, locked: this.locked, color_trace: this.color_trace,
                show_legend: this.show_legend}
        },

        import: function(data) {
            if ("combined" in data) {
                this.toggle_combined(data.combined, false);
                $("#axes-input").axes_input("toggle_combined", data.combined);
                d3.select("#combined-checkbox").property("checked", data.combined);
                d3.select("#separate-color-checkbox").property("disabled", data.combined)
            };

            if ("xmin" in data && "xmax" in data && "ymin" in data && "ymax" in data) {
                this.scale_axes(data.xmin, data.xmax, data.ymin, data.ymax, true, true)
            };

            if ("opacity" in data) {
                $("#opacity-input").opacity_input("change_opacity", data.opacity)
            };
            if ("smoothing" in data) {
                $("#smoothing-input").smoothing_input("change_smoothing", data.smoothing)
            };
            if ("bp_shift" in data) {
                $("#shift-input").shift_input("change_shift", data.bp_shift)
            };

            if ("title" in data) {
                $(this._elements.title.node()).editable_svg_text("change_label", data.title)
            };
            if ("xlabel" in data) {
                $(this._elements.xlabel.node()).editable_svg_text("change_label", data.xlabel)
            };
            if ("ylabel" in data) {
                $(this._elements.ylabel.node()).editable_svg_text("change_label", data.ylabel)
            };

            if ("locked" in data) {
                this.locked = data.locked;
                d3.select("#lock-axes-checkbox").property("checked", data.locked);
                $("#axes-input").axes_input("toggle_locked", data.locked)
            };

            if ("color_trace" in data) {
                this.toggle_color_trace(data.color_trace);
                d3.select("#color-trace-checkbox").property("checked", data.color_trace)
            };

            if ("show_legend") {
                this.toggle_legend(data.show_legend);
                d3.select("#show-legend-checkbox").property("checked", data.show_legend)
            }
        },

        reset: function() {
            this.combined = false;
            this.locked = false;
            this.title = "Composite Plot";
            this.xlabel = "Position (bp)";
            this.ylabel = "Occupancy (AU)";

            $("#axes-input").axes_input("toggle_combined", false);
            $("#axes-input").axes_input("change_axis_limits", -500, 500, -1, 1, true, true);
            $("#opacity-input").opacity_input("change_opacity", 1);
            $("#smoothing-input").smoothing_input("change_smoothing", 7);
            $("#shift-input").shift_input("change_shift", 0);
            d3.select("#combined-checkbox").property("checked", false)
                .property("disabled", false);
            $("#settings-dropdown").settings_dropdown("set_value", "none");

            this._elements.main_plot.selectAll("*").remove();
            this._elements.composites = [];
            this._elements.legend_items = [];
            this._create()
        }
    });

    $.widget("composite_plot.editable_svg_text", {
        text_label: null,
        foreign_object: null,

        options: {
            label: null,
            text: null,
            x: null,
            y: null,
            font_size: null,
            rotation: "horizontal"
        },

        _create: function() {
            let label_group = d3.select(this.element.context);
            this.text_label = label_group.append("text")
                .attr("x", this.options.x)
                .attr("y", this.options.y)
                .attr("font-size", this.options.font_size)
                .attr("transform", "rotate(" + (this.options.rotation === "horizontal" ? 0 : -90 + " " + this.options.x + " " + this.options.y) + ")")
                .style("text-anchor", "middle")
                .style("cursor", "pointer")
                .text(this.options.text)
                .on("click", function() {$(label_group.node()).editable_svg_text("toggle_input")})
                .on("mouseover", function() {d3.select(this).attr("fill", "#6D98E6")})
                .on("mouseleave", function() {d3.select(this).attr("fill", "#000000")});
        },

        toggle_input: function(ev) {
            let label_group = d3.select(this.element.context);
            this.text_label.style("display", "none");
            this.foreign_object = label_group.append("foreignObject")
                .attr("x", this.options.x - 200)
                .attr("y", this.options.y - 20)
                .attr("width", 400)
                .attr("height", 40)
                .attr("transform", "rotate(" + (this.options.rotation === "horizontal" ? 0 : -90 + " " + this.options.x + " " + this.options.y) + ")")
                .style("text-align", "center");

            let input = this.foreign_object.append("input")
                .attr("type", "text")
                .attr("value", this.options.text)
                .style("font-size", "10px");

            // This is a hack to make the input box appear
            input.node().outerHTML = input.node().outerHTML;

            this.foreign_object.select("input")
                .on("keypress", function(e) {$(label_group.node()).editable_svg_text("enter_input", e)})
                .attr("title", "Press enter to submit")
                .node().focus();

            $("#main-plot").main_plot("toggle_svg_button")
        },

        enter_input: function(ev) {
            if (ev.keyCode === 13) {
                this.foreign_object.remove();

                if (ev.target.value.trim().length !== 0) {
                    this.change_label(ev.target.value)
                } else {
                    this.text_label.style("display", null)
                };

                $("#main-plot").main_plot("toggle_svg_button")
            }
        },

        change_label: function(new_label) {
            this.options.text = new_label;
            this.text_label
                .style("display", null)
                .html(new_label + (this.options.label === "ylabel" ? $("#main-plot").main_plot("instance")._elements.ylabel_suffix : ""));

            $("#main-plot").main_plot("change_label", this.options.label, new_label)
        }
    });

    $("#main-plot").main_plot()
});