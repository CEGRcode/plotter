$(function() {
    // Main plot widget
    $.widget("composite_plot.main_plot", {
        title: "Composite plot",
        xmin: -500,
        xmax: 500,
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
        locked: false,

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
                .domain([-this.ymax, this.ymax])
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
                .attr("y1", yscale(-this.ymax))
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
                .text(-this.ymax);
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
                y: this.height - 15,
                font_size: 16
            });
            this._elements.ylabel = main_plot.append("g");
            $(this._elements.ylabel.node()).editable_svg_text({
                label: "ylabel",
                text: this.ylabel,
                x: 25,
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
                let data = $("#settings-table").settings_table("export").filter(d => d.files_loaded > 0 && !d.hide);
                $("#main-plot").main_plot("move_tooltip", e, data)
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

            composite.append("defs")
                .append("linearGradient")
                    .attr("id", "composite-gradient-" + this._elements.composites.length)
                    .classed("composite-gradient", true)
                    .attr("x1", "0%")
                    .attr("x2", "0%");

            composite.append("path")
                .classed("white-line", true)
                .attr("fill", "none")
                .attr("stroke", "#FFFFFF")
                .attr("stroke-width", 1)
                .attr("d", "");

            composite.append("path")
                .classed("composite-line", true)
                .attr("fill", "none")
                .attr("stroke", "#000000")
                .attr("stroke-width", 0.5)
                .attr("d", "");

            composite.append("polygon")
                .classed("composite-fill", true)
                .attr("fill", "url(#composite-gradient-" + this._elements.composites.length + ")")
                .attr("stroke", "none");

            this._elements.composites.push(composite);

            let legend_element = this._elements.legend.append("g")
                .classed("legend-element", true)
                .style("display", "none");

            legend_element.append("rect")
                .attr("width", 15)
                .attr("height", 15)
                .attr("stroke", "#000000")
                .attr("stroke-width", 1)
                .attr("fill", color);
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
            composite.select("polygon")
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

                composite.select(".composite-gradient")
                    .attr("y1", "0%")
                    .attr("y2", "100%")
                    .selectAll("stop")
                        .data([0, 1])
                        .join("stop")
                            .attr("offset", d => d)
                            .attr("stop-color", color)
                            .attr("stop-opacity", d => (1 - d) * opacity);

                composite.select(".white-line")
                    .datum(truncated_xdomain)
                    .attr("d", d3.line()
                        .x(d => this.xscale(d))
                        .y((_, j) => this.yscale(scaled_occupancy[j]))
                    );

                composite.select(".composite-line")
                    .datum(truncated_xdomain)
                    .attr("d", d3.line()
                        .x(d => this.xscale(d))
                        .y((_, j) => this.yscale(scaled_occupancy[j]))
                    );

                composite.select(".composite-fill")
                    .attr("points", truncated_xdomain.map((d, j) => this.xscale(d) + "," + this.yscale(scaled_occupancy[j])).join(" ") + " "
                        + this.xscale(truncated_xdomain[truncated_xdomain.length - 1]) + "," + this.yscale(0) + " "
                        + this.xscale(truncated_xdomain[0]) + "," + this.yscale(0))
            } else {
                let sensemax = Math.max(...sense),
                    antimax = Math.max(...anti),
                    ymax = Math.max(sensemax, antimax),
                    {new_xdomain, new_occupancy: smoothed_sense} = sliding_window(xdomain, sense, smoothing),
                    {new_occupancy: smoothed_anti} = sliding_window(xdomain, anti, smoothing),
                    truncated_sense_domain = new_xdomain.map(x => x + bp_shift).filter(x => x >= this.xmin && x <= this.xmax),
                    truncated_anti_domain = new_xdomain.map(x => x - bp_shift).filter(x => x >= this.xmin && x <= this.xmax),
                    scaled_sense = smoothed_sense.filter((_, j) => new_xdomain[j] + bp_shift >= this.xmin
                        && new_xdomain[j] + bp_shift <= this.xmax).map(d => d * scale),
                    scaled_anti = smoothed_anti.filter((_, j) => new_xdomain[j] - bp_shift >= this.xmin
                        && new_xdomain[j] - bp_shift <= this.xmax).map(d => d * scale);

                composite.select(".composite-gradient")
                    .attr("y1", (ymax - antimax) / (2 * ymax))
                    .attr("y2", (ymax + sensemax) / (2 * ymax))
                    .selectAll("stop")
                        .data([
                            {offset: 0, color: color, opacity: opacity},
                            {offset: .5, color: color, opacity: 0},
                            {offset: .5, color: "#FFFFFF", opacity: 0},
                            {offset: .5, color: secondary_color, opacity: 0},
                            {offset: 1, color: secondary_color, opacity: opacity}])
                        .join("stop")
                            .attr("offset", d => d.offset)
                            .attr("stop-color", d => d.color)
                            .attr("stop-opacity", d => d.opacity);

                composite.select(".white-line")
                    .attr("d", "M" + truncated_sense_domain.map((d, j) => this.xscale(d) + " " + this.yscale(scaled_sense[j])).join("L")
                        + "M" + truncated_anti_domain.map((d, j) => this.xscale(d) + " " + this.yscale(-scaled_anti[j])).join("L"));

                composite.select(".composite-line")
                    .attr("d", "M" + truncated_sense_domain.map((d, j) => this.xscale(d) + " " + this.yscale(scaled_sense[j])).join("L")
                        + "M" + truncated_anti_domain.map((d, j) => this.xscale(d) + " " + this.yscale(-scaled_anti[j])).join("L"));

                composite.select(".composite-fill")
                    .attr("points", this.xscale(truncated_sense_domain[0]) + "," + this.yscale(0) + " "
                        + truncated_sense_domain.map((d, j) => this.xscale(d) + "," + this.yscale(scaled_sense[j])).join(" ") + " "
                        + this.xscale(truncated_sense_domain[truncated_sense_domain.length - 1]) + "," + this.yscale(0) + " "
                        + this.xscale(truncated_anti_domain[truncated_anti_domain.length - 1]) + "," + this.yscale(0) + " "
                        + truncated_anti_domain.map((d, j) => this.xscale(d) + "," + this.yscale(-scaled_anti[j])).reverse().join(" ") + " "
                        + this.xscale(truncated_anti_domain[0]) + "," + this.yscale(0))
            }
        },

        scale_axes: function(xmin, xmax, ymax, allow_shrink=true, change_input=false) {
            if (this.locked) {
                return
            };

            if (xmin !== undefined && xmax !== undefined && ymax !== undefined) {
                if (allow_shrink) {
                    this.xmin = xmin;
                    this.xmax = xmax;
                    this.ymax = change_input ? ymax : ymax / (this.combined + 1)
                } else {
                    this.xmin = Math.min(this.xmin, xmin);
                    this.xmax = Math.max(this.xmax, xmax);
                    this.ymax = Math.max(this.ymax, ymax) / (change_input ? 1 : this.combined + 1)
                }
            };

            this._elements.xmin.text(this.xmin);
            this._elements.xmax.text(this.xmax);
            let round_exp = 1 - Math.floor(Math.log10(this.ymax)),
                round_factor = 10 ** round_exp,
                ymax_factor = this.combined ? 2 : 1;
            if (round_exp > -2 && round_exp < 2) {
                this._elements.ylabel_suffix = ""
                this._elements.ymin.text(this.combined ? "" : Math.round(-this.ymax * round_factor) / round_factor);
                this._elements.ymax.text(Math.round(this.ymax * round_factor * ymax_factor) / round_factor)
            } else {
                this._elements.ylabel_suffix = " x10 <tspan font-size=\"8px\" baseline-shift=\"super\">" + (round_exp - 1) + "</tspan>";
                this._elements.ymin.text(this.combined ? "" : Math.round(-this.ymax * round_factor) / 10);
                this._elements.ymax.text(Math.round(this.ymax * round_factor * ymax_factor) / 10)
            };

            this.xscale = d3.scaleLinear()
                .domain([this.xmin, this.xmax])
                .range([this.margins.left, this.width - this.margins.right]);
            this.yscale = d3.scaleLinear()
                .domain([-this.ymax * !this.combined, this.ymax * ymax_factor])
                .range([this.height - this.margins.bottom, this.margins.top]);

            this._elements.refline
                .attr("x1", this.xscale(0))
                .attr("x2", this.xscale(0))
                .attr("y1", this.yscale(this.combined ? 0 : -this.ymax))
                .attr("y2", this.yscale(this.ymax * ymax_factor))
                .style("display", this.xmin < 0 && this.xmax > 0 ? null : "none");

            this._elements.ylabel.select("text").html(this.ylabel + this._elements.ylabel_suffix);

            if (change_input) {
                $("#axes-input").axes_input("change_axis_limits", this.xmin, this.xmax, this.ymax * ymax_factor)
            }
        },

        update_legend: function() {
            this._elements.legend.selectAll("g")
                .data(this._elements.composites.map((y => comp => [y += comp.classed("plotted") * 24, comp.classed("plotted") ? null : "none"])(-24)))
                .join("g")
                    .attr("transform", d => "translate(0," + d[0] + ")")
                    .style("display", d => d[1])
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
            if (this.combined || !sense_only) {
                composite.select(".composite-gradient")
                    .selectAll("stop")
                        .attr("stop-color", color);
                this._elements.legend_items[i].select("rect")
                    .attr("fill", color);
            } else {
                composite.select(".composite-gradient")
                    .selectAll("stop")
                    .each(function(d, i) {if (i < 2) {d3.select(this).attr("stop-color", color)}})
            }
        },

        change_secondary_color: function(i, color) {
            let composite = this._elements.composites[i];
            composite.select(".composite-gradient")
                .selectAll("stop")
                .each(function(d, i) {if (i > 2) {d3.select(this).attr("stop-color", color)}})
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

        toggle_combined: function(combine) {
            this.combined = combine;

            this._elements.midaxis_top.style("display", combine ? "none" : null);
            this._elements.midaxis_bottom.style("display", combine ? "none" : null);

            this.scale_axes(undefined, undefined, undefined, true, true);

            $("#settings-table").settings_table("plot_all_composites")
        },

        toggle_locked: function(locked) {
            this.locked = locked
        },

        move_tooltip: function(ev, data) {
            let {x: plot_x, y: plot_y, width, height} = this._elements.main_plot.node().getBoundingClientRect(),
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

        export: function() {
            return {title: this.title, xlabel: this.xlabel, ylabel: this.ylabel, opacity: this.opacity,
                smoothing: this.smoothing, bp_shift: this.bp_shift, xmin: this.xmin, xmax: this.xmax,
                ymax: this.ymax, combined: this.combined, locked: this.locked}
        },

        import: function(data) {
            if (data.combined !== undefined) {
                this.combined = data.combined;
                d3.select("#combined-checkbox").property("checked", data.combined)
            };

            if (data.xmin !== undefined && data.xmax !== undefined && data.ymax !== undefined) {
                this.scale_axes(data.xmin, data.xmax, data.ymax, true, true)
            };

            if (data.opacity !== undefined) {
                $("#opacity-input").opacity_input("change_opacity", data.opacity)
            };
            if (data.smoothing !== undefined) {
                $("#smoothing-input").smoothing_input("change_smoothing", data.smoothing)
            };
            if (data.bp_shift !== undefined) {
                $("#shift-input").shift_input("change_shift", data.bp_shift)
            };

            if (data.title !== undefined) {
                $(this._elements.title.node()).editable_svg_text("change_label", data.title)
            };
            if (data.xlabel !== undefined) {
                $(this._elements.xlabel.node()).editable_svg_text("change_label", data.xlabel)
            };
            if (data.ylabel !== undefined) {
                $(this._elements.ylabel.node()).editable_svg_text("change_label", data.ylabel)
            };

            if (data.locked !== undefined) {
                this.locked = data.locked;
                d3.select("#lock-axes-checkbox").property("checked", data.locked);
                $("#axes-input").axes_input("toggle_locked", data.locked)
            }
        },

        reset: function() {
            this.combined = false;
            this.locked = false;
            this.title = "Composite Plot";
            this.xlabel = "Position (bp)";
            this.ylabel = "Occupancy (AU)";

            $("#axes-input").axes_input("change_axis_limits", -500, 500, 1);
            $("#opacity-input").opacity_input("change_opacity", 1);
            $("#smoothing-input").smoothing_input("change_smoothing", 7);
            $("#shift-input").shift_input("change_shift", 0);
            d3.select("#combined-checkbox").property("checked", false);
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
                .node().focus()
        },

        enter_input: function(ev) {
            if (ev.keyCode === 13) {
                this.foreign_object.remove();

                if (ev.target.value.trim().length !== 0) {
                    this.change_label(ev.target.value)
                } else {
                    this.text_label.style("display", null)
                }
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