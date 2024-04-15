$(function() {
    // Settings table widget
    $.widget("composite_plot.settings_table", {
        // Default colors
        colors: [
            "#BFBFBF",
            "#000000",
            "#FF0000",
            "#FF9100",
            "#D7D700",
            "#07E200",
            "#00B0F0",
            "#0007FF",
            "#A700FF",
            "#FF00D0"
        ],
        separate_color: false,

        // Counter for the number of rows added
        rows_added: 0,

        _elements: {
            table: null,
            rows: []
        },

        _create: function() {
            this._elements.table = d3.select(this.element.context)
        },

        // Add a new row to the table
        add_row: function(ids=[]) {
            let new_row = this._elements.table.append("row"),
                color = this.colors[this.rows_added % this.colors.length];
            $(new_row.node()).settings_row({idx: this._elements.rows.length, name: "Composite " + this.rows_added, color: color, ids: ids, separate_color: this.separate_color});
            this._elements.rows.push(new_row);

            // Add a new composite to the plot
            $("#main-plot").main_plot("add_composite", "Composite " + this.rows_added++, color);
            $(new_row.node()).settings_row("change_name", this.rows_added, true);
        },

        // Remove a row from the table
        remove_row: function(i) {
            $(this._elements.rows[i].node()).settings_row("destroy");
            this._elements.rows.splice(i, 1);

            // Update the indices of the remaining rows
            for (let j in this._elements.rows) {
                $(this._elements.rows[j].node()).settings_row("set_index", j)
            }
        },

        plot_all_composites: function(scale_axes=false, allow_shrink=false) {
            if (scale_axes) {
                $("#main-plot").main_plot("scale_axes", scale_axes.xmin, scale_axes.xmax, parseFloat(scale_axes.ymin.toPrecision(2)), parseFloat(scale_axes.ymax.toPrecision(2)), allow_shrink || this._elements.rows.reduce(function(sum, row) {
                    let inst = $(row.node()).settings_row("instance");
                    return sum + (inst.files_loaded && !inst.hide)
                }, 0) === 1, true)
            };

            for (let row of this._elements.rows) {
                $(row.node()).settings_row("plot_composite")
            }
            $("#nucleosome-slider").nucleosome_slider("update_all");
        },

        insert_row: function(drag_idx, drop_idx, insert_after) {
            if (drag_idx !== drop_idx) {
                let drag_row = this._elements.rows[drag_idx],
                    drop_row = this._elements.rows[drop_idx];
                if (insert_after) {
                    $(drag_row.node()).insertAfter(drop_row.node());
                } else {
                    $(drag_row.node()).insertBefore(drop_row.node());
                };

                this._elements.rows.splice(drag_idx, 1);
                this._elements.rows.splice(drop_idx + insert_after - (drop_idx > drag_idx), 0, drag_row);

                // Update the indices of the remaining rows
                for (let i in this._elements.rows) {
                    $(this._elements.rows[i].node()).settings_row("set_index", i)
                }
            }
        },

        autoscale_axes: function() {
            if (!this._elements.rows.some(function(row) {let inst = $(row.node()).settings_row("instance"); return inst.files_loaded && !inst.hide})) {
                $("#main-plot").main_plot("scale_axes", -500, 500, 1)
            } else {
                let xmin = Infinity,
                    xmax = -Infinity,
                    ymin = -Infinity,
                    ymax = -Infinity;
                this._elements.rows.forEach(function(row) {
                    let inst = $(row.node()).settings_row("instance");
                    if (inst.files_loaded && !inst.hide) {
                        xmin = Math.min(xmin, inst.xmin);
                        xmax = Math.max(xmax, inst.xmax);
                        ymin = Math.max(ymin, Math.max(...inst.anti) * inst.scale);
                        ymax = Math.max(ymax, Math.max(...inst.sense) * inst.scale)
                    }
                });

                $("#main-plot").main_plot("scale_axes", xmin, xmax, parseFloat(-ymin.toPrecision(2)), parseFloat(ymax.toPrecision(2)), true, true);
                this.plot_all_composites()
            }
        },

        update_ids: function(i, new_ids) {
            $(this._elements.rows[i].node()).settings_row("update_ids", new_ids)
        },

        toggle_color_separated_strands: function(separate) {
            this.separate_color = separate;

            for (let row of this._elements.rows) {
                $(row.node()).settings_row("toggle_color_separated_strands", separate)
            }
        },

        update_rows: function(rows) {
            for (let i in rows) {
                if (i >= this._elements.rows.length) {
                    this.add_row();
                    $("#metadata-table").metadata_table("add_row")
                };
                if ("name" in rows[i]) {
                    $(this._elements.rows[i].node()).settings_row("change_name", rows[i].name, true)
                };
                if ("color" in rows[i]) {
                    $(this._elements.rows[i].node()).settings_row("change_color", rows[i].color)
                };
                if ("secondary_color" in rows[i]) {
                    $(this._elements.rows[i].node()).settings_row("change_secondary_color", rows[i].secondary_color)
                }
            }
        },

        autoscale_composites: function() {
            for (let row of this._elements.rows) {
                $(row.node()).settings_row("autoscale_composite")
            };

            this.autoscale_axes();
            this.plot_all_composites()
        },

        export: function() {
            return this._elements.rows.map(row => $(row.node()).settings_row("export"));
        },

        import: function(data) {
            for (let i in data) {
                this.add_row();
                $(this._elements.rows[i].node()).settings_row("import", data[i])
            }
        },

        reset: function() {
            this.rows_added = 0;
            this._elements.table.selectAll("*").remove();
            this._elements.rows = [];

            this.separate_color = false;
            d3.select("#separate-color-checkbox").property("checked", false)
                .property("disabled", false);

            this._create()
        }
    });

    // Settings row widget
    $.widget("composite_plot.settings_row", {
        xmin: Infinity,
        xmax: -Infinity,
        sense: null,
        anti: null,
        swapped: false,
        composites: null,
        scale: 1,
        baseline: 0,
        opacity: false,
        smoothing: false,
        bp_shift: false,
        hide: false,
        hide_forward: false,
        hide_reverse: false,
        files_loaded: 0,
        secondary_color: null,

        options: {
            idx: null,
            name: null,
            color: null,
            ids: [],
            separate_color: false
        },

        // Create a new row
        _create: function() {
            let self = this;
            if (this.options.ids.length > 0) {
                this.xmin = Math.min(...this.options.ids.map(id => individual_composites[id].xmin));
                this.xmax = Math.max(...this.options.ids.map(id => individual_composites[id].xmax));
                this.load_data(this.options.ids, plot=false)
            };

            // Add event listeners
            let row = d3.select(this.element.context)  

            //Create table for each row of the settings table
            options_table = row.append("table")
                .attr("draggable", true)
                .classed("added-table", true)
                .on("mouseover", function(e) {$(row.node()).settings_row("highlight_row", e, "mouse-highlight")})
                .on("mouseleave", function(e) {$(row.node()).settings_row("unhighlight_row", e, "mouse-highlight")})
                .on("dragstart", function(e) {e.dataTransfer.setData("text/plain", self.options.idx)})
                .on("dragover", function(e) {$(row.node()).settings_row("highlight_row", e, "drag-highlight")})
                .on("dragleave", function(e) {$(row.node()).settings_row("unhighlight_row", e, "drag-highlight")})
                .on("drop", function(e) {
                    $(row.node()).settings_row("unhighlight_row", e, "drag-highlight");
                    $(row.node()).settings_row("direct_drop_event", e)
                }),

            // Add sliders and buttons to first row
                primary_row = options_table.append("tr")
                    .classed("settings-row", true);
                drag_col = primary_row.append("td")
                .classed("drag-col", true)
                .style("width", "48px"),
                name_col = primary_row.append("td")
                .classed("name-col", true),
                color_col = primary_row.append("td")
                .classed("color-col", true),
                scale_col = primary_row.append("td")
                .classed("scale-col", true)
                .classed("slider-col", true),
                opacity_col = primary_row.append("td")
                .classed("opacity-col", true),
                smoothing_col = primary_row.append("td")
                .classed("smoothing-col", true),
                shift_col = primary_row.append("td")
                .classed("shift-col", true),
                hide_col = primary_row.append("td")
                .classed("hide-col", true),
                upload_col = primary_row.append("td")
                .classed("upload-col", true),
                id_col = primary_row.append("td")
                .style("white-space", "normal")
                .classed("id-col", true),
                more_options_col = primary_row.append("td")
                .classed("more-options-col", true);

            // Add drag handle
            drag_col.append("div")
                .attr("title", "Drag to reorder")
                .append("svg")
                    .attr("baseProfile", "full")
                    .attr("width", "24px")
                    .attr("viewBox", "0 0 16 16")
                    .attr("version", "1.1")
                    .attr("xmlns", "http://www.w3.org/2000/svg")
                    .append("g")
                        .selectAll("line")
                        .data([4, 8, 12])
                        .join("line")
                            .attr("x1", 0)
                            .attr("y1", d => d)
                            .attr("x2", 16)
                            .attr("y2", d => d)
                            .attr("stroke", "gray")
                            .attr("stroke-width", 2);

            // Add name input
            name_col.append("div")
                .attr("contenteditable", true)
                .text(this.options.name)
                .style("min-width", "5px")
                .on("input", function() {$(row.node()).settings_row("change_name", this.textContent)})
                .on("mousedown", function() {$(row.node()).settings_row("toggle_draggable", false)})
                .on("mouseup", function() {$(row.node()).settings_row("toggle_draggable", true)})
                .on("mouseleave", function() {$(row.node()).settings_row("toggle_draggable", true)});

            // Add color input
            color_col.append("input")
                .attr("type", "color")
                .classed("color-1", true)
                .attr("value", this.options.color)
                .on("change", function() {$(row.node()).settings_row("change_color", this.value)});
            this.secondary_color = this.options.color;
            if (this.options.separate_color) {
                color_col.append("input")
                    .attr("type", "color")
                    .classed("color-2", true)
                    .attr("value", this.secondary_color)
                    .on("change", function() {$(row.node()).settings_row("change_secondary_color", this.value)});
            };

            //Creates scale input
            scale_div = scale_col.append("div")
                .classed("slider-div", true)
            scale_div.append("label")
                .text("Scale:");
            scale_div.append("input")
                .attr("type", "text")
                .classed("setting-text", true)
                .attr("value", 1)
                .on("change", function() {$(row.node()).settings_row("change_scale", this.value)})
                .on("mousedown", function() {$(row.node()).settings_row("toggle_draggable", false)})
                .on("mouseup", function() {$(row.node()).settings_row("toggle_draggable", true)})
                .on("mouseleave", function() {$(row.node()).settings_row("toggle_draggable", true)});
            scale_div.append("input")
                .attr("type", "range")
                .classed("scale-slider", true)
                .attr("value", 50)
                .attr("min", 1)
                .attr("max", 100)
                .on("input", function() {$(row.node()).settings_row("change_scale", 10 ** ((this.value - 50)/50))})
                .on("mouseup", function() {$(row.node()).settings_row("toggle_draggable", true)})
                .on("mousedown", function() {$(row.node()).settings_row("toggle_draggable", false)})

            // Add opacity input
            opacity_col.append("label")
                .text("Opacity:");
            opacity_col.append("input")
                .attr("type", "text")
                .classed("setting-text", true)
                .on("change", function() {$(row.node()).settings_row("change_opacity", this.value)})
                .on("mousedown", function() {$(row.node()).settings_row("toggle_draggable", false)})
                .on("mouseup", function() {$(row.node()).settings_row("toggle_draggable", true)})
                .on("mouseleave", function() {$(row.node()).settings_row("toggle_draggable", true)});

            // Add smoothing input
            smoothing_col.append("label")
                .text("Smoothing:");
            smoothing_col.append("input")
                .attr("type", "text")
                .classed("setting-text", true)
                .on("change", function() {$(row.node()).settings_row("change_smoothing", this.value)})
                .on("mousedown", function() {$(row.node()).settings_row("toggle_draggable", false)})
                .on("mouseup", function() {$(row.node()).settings_row("toggle_draggable", true)})
                .on("mouseleave", function() {$(row.node()).settings_row("toggle_draggable", true)});

            // Add bp shift input
            shift_col.append("label")
                .text("BP shift:");
            shift_col.append("input")
                .attr("type", "text")
                .classed("setting-text", true)
                .on("change", function() {$(row.node()).settings_row("change_bp_shift", this.value)})
                .on("mousedown", function() {$(row.node()).settings_row("toggle_draggable", false)})
                .on("mouseup", function() {$(row.node()).settings_row("toggle_draggable", true)})
                .on("mouseleave", function() {$(row.node()).settings_row("toggle_draggable", true)});

            // Add hide icon
            let eye_open_icon = hide_col.append("div")
                .attr("title", "Hide")
                .append("svg")
                    .classed("hide-icon", true)
                    .classed("eye-open", true)
                    .attr("baseProfile", "full")
                    .attr("viewBox", "-100 -100 200 200")
                    .attr("version", "1.1")
                    .attr("xmlns", "http://www.w3.org/2000/svg")
                    .on("click", function() {$(row.node()).settings_row("toggle_hide", true)})
                    .append("g");
            eye_open_icon.append("path")
                .attr("d", "M-100 0C-50 60 50 60 100 0C50 -60 -50 -60 -100 0")
                .attr("fill", "none")
                .attr("stroke", "black")
                .attr("stroke-width", 3);
            eye_open_icon.append("circle")
                .attr("cx", 0)
                .attr("cy", 0)
                .attr("r", 30)
                .attr("fill", "black")
                .attr("stroke", "none");
            let eye_closed_icon = hide_col.append("div")
                .attr("title", "Show")
                .append("svg")
                    .classed("hide-icon", true)
                    .classed("eye-closed", true)
                    .attr("title", "Show")
                    .attr("baseProfile", "full")
                    .attr("viewBox", "-100 -100 200 200")
                    .attr("version", "1.1")
                    .attr("xmlns", "http://www.w3.org/2000/svg")
                    .style("display", "none")
                    .on("click", function() {$(row.node()).settings_row("toggle_hide", false)})
                    .append("g");
            eye_closed_icon.append("path")
                .attr("d", "M-100 0C-50 60 50 60 100 0M-66.77 27.7L-74.21 40.78M-24.62 42.82L-27.26 57.58M24.62 42.82L27.26 57.58M66.77 27.7L74.21 40.78")
                .attr("fill", "none")
                .attr("stroke", "black")
                .attr("stroke-width", 3);

            // Add file upload button
            let file_input = upload_col.append("input")
                .attr("type", "file")
                .property("multiple", true)
                .style("display", "none")
                .on("change", function(ev) {$(row.node()).settings_row("load_files", ev.target.files)});
            upload_col.append("button")
                .attr("title", "Upload file(s)")
                .style("width", "35px")
                .style("height", "30px")
                .style("position", "relative")
                .style("text-align", "center")
                .on("click", function() {$(file_input.node()).click()})
                .append("svg")
                    .classed("upload-icon", true)
                    .attr("baseProfile", "full")
                    .attr("viewBox", "0 0 24 24")
                    .attr("version", "1.1")
                    .attr("xmlns", "http://www.w3.org/2000/svg")
                    .append("g")
                        .append("path")
                            .attr("d", "M9 10L12 7L15 10M12 7V21M20 7V4A1 1 0 0 0 19 3H5A1 1 0 0 0 4 4V7")
                            .attr("stroke", "#000000")
                            .attr("stroke-width", 2)
                            .attr("stroke-linejoin", "round")
                            .attr("fill", "none");
            this.files_loaded = this.options.ids.length;
            upload_col.append("label")
                .style("padding-left", "10px")
                .text(this.files_loaded === 1 ? this.files_loaded + " file loaded" : this.files_loaded + " files loaded");

            // Show IDs
            id_col.append("div")
                .style("display", "inline-block")
                .style("vertical-align", "top")
                .text("IDs:");
            id_col.append("div")
                .style("display", "inline-block")
                .style("vertical-align", "top")
                .style("padding-left", "5px")
                .classed("id-list", true)
                .text(this.options.ids.join(", "));

            // Add reset button
            more_options_col.append("input")
                .attr("type", "button")
                .attr("value", "More Options")
                .style("float", "right")
                .on("click", function() {$(row.node()).settings_row("toggle_second_row")});
            
            //Creates second row for additional options
            let secondary_row = options_table.append("tr")
                .classed("settings-row", true)
                .classed("second-row", true)
                .style("margin-right", "0px")
                .style("display", "none");

            //Adds options to secondary row, with cells for features which may be added in the future
            secondary_row.append("td"),
            baseline_col = secondary_row.append("td")
                .classed("baseline-col", true)
                .classed("slider-col", true)
                .attr("colspan", "3"),
            secondary_row.append("td"),
            secondary_row.append("td"),
            hide_strand_col = secondary_row.append("td")
                .classed("hide-strand-col", true)
                .attr("colspan", "3")
            swap_senses_col = secondary_row.append("td")
            reset_col = secondary_row.append("td")
                .classed("reset-col", true);

            //Creates input for shifting baseline
            baseline_div = baseline_col.append("div")
                .classed("slider-div", true)
            baseline_div.append("label")
                .text("Shift occupancy:")
                .style("float", "right");
            baseline_div.append("input")
                .attr("type", "text")
                .classed("setting-text", true)
                .attr("value", 0)
                .style("float", "right")
                .style("width", "50px")
                .on("change", function() {$(row.node()).settings_row("change_baseline", this.value)})
                .on("mousedown", function() {$(row.node()).settings_row("toggle_draggable", false)})
                .on("mouseup", function() {$(row.node()).settings_row("toggle_draggable", true)})
                .on("mouseleave", function() {$(row.node()).settings_row("toggle_draggable", true)});
            baseline_div.append("input")
                .attr("type", "range")
                .classed("shift-slider", true)
                .attr("value", 50)
                .attr("min", 1)
                .attr("max", 100)
                .on("input", function() {$(row.node()).settings_row("change_baseline", (this.value - 50) * (1 / $("#main-plot").main_plot("export").ymax))})
                .on("mouseup", function() {$(row.node()).settings_row("toggle_draggable", true)})
                .on("mousedown", function() {$(row.node()).settings_row("toggle_draggable", false)})

            //Creates hide-strand input
            forward = hide_strand_col.append("div")
                .attr("title", "forward")
                .style("float", "left")
                .style("margin-right", "15px")
            forward.append("label")
                .text("Show forward:")
            forward.append("input")
                .attr("type", "checkbox")
                .property("checked", true)
                .classed("direction_checkbox", true)
                .classed("forward_checkbox", true)
                .style("transform", "scale(1.2)")
                .on("input", function() {
                    self.toggle_forward(!d3.select(this).property("checked"));
                })
            reverse = hide_strand_col.append("div")
                .attr("title", "reverse")
                .style("width", "initial")
            reverse.append("label")
                .text("Show reverse:")
                .style("display", "inline")
                .style("white-space", "nowrap")
            reverse.append("input")
                .attr("type", "checkbox")
                .property("checked", true)
                .classed("direction_checkbox", true)
                .classed("reverse_checkbox", true)
                .style("transform", "scale(1.2)")
                .on("input", function() {
                    self.toggle_reverse(!d3.select(this).property("checked"));
                })

            swap_senses_col.append("label")
                .attr("for", "swap_senses_checkbox")
                .text("Swap sense and antisense")
            swap_senses_col.append("input")
                .attr("type", "checkbox")
                .attr("id", "swap-senses-checkbox")
                .property("checked", false)
                .style("transform", "scale(1.2)")
                .on("input", function() {
                    self.swap_senses(d3.select(this).property("checked"));
                });

            //Add reset button
            reset_col.append("input")
                .attr("type", "button")
                .attr("value", "Reset")
                .style("float", "right")
                .style("color", "red")
                .on("click", function() {$(row.node()).settings_row("reset")});
        },

        // Remove the row
        _destroy: function() {
            d3.select(this.element.context).remove()
        },

        // Set the row index
        set_index: function(i) {
            this.options.idx = i
        },

        // Highlight the row
        highlight_row: function(ev, hl_class) {
            ev.preventDefault();
            d3.select(this.element.context).select("table").classed(hl_class, true);
            $("#metadata-table").metadata_table("highlight_row", this.options.idx)
        },

        // Unhighlight the row
        unhighlight_row: function(ev, hl_class) {
            ev.preventDefault();
            d3.select(this.element.context).select("table").classed(hl_class, false);
            $("#metadata-table").metadata_table("unhighlight_row", this.options.idx)
        },

        // Handle drop event
        direct_drop_event: function(ev) {
            ev.preventDefault();
            if (ev.dataTransfer.items[0].kind === "file") {
                let file_list = [];
                for (let i = 0; i < ev.dataTransfer.items.length; i++) {
                    file_list.push(ev.dataTransfer.items[i].getAsFile())
                };
                this.load_files(file_list)
            } else {
                this.insert_row(parseInt(ev.dataTransfer.getData("text/plain")), event.clientY)
            }
        },

        // Load composite files
        load_files: async function(file_list) {
            let widg = this,
                n = file_list.length,
                xmin_curr = this.xmin,
                xmax_curr = this.xmax,
                promise_arr = Array(n),
                ids = [];

            // Read files
            for (let i = 0; i < n; i++) {
                await new Promise(function(resolve, reject) {
                    let file = file_list[i],
                        reader = new FileReader(),
                        id = file.name.split(/[_.]/)[0];
                    ids.push(id);

                    if (id in individual_composites) {
                        if (!confirm("Composite " + id + " already exists. Overwrite?")) {
                            reject("Composite " + id + " already exists")
                        }
//                        widg.xmin = Math.min(widg.xmin, individual_composites[id].xmin);
//                        widg.xmax = Math.max(widg.xmax, individual_composites[id].xmax);
//                        resolve()
                    };

                    $("#metadata-table").metadata_table("add_id", widg.options.idx, id);
                    widg.add_id(id);

                    reader.onload = function() {
                        let {xmin, xmax, sense, anti} = parse_composite(reader.result),
                            promise = () => new Promise(function(resolve_) {

                            // Update xdomain
                            widg.xmin = Math.min(widg.xmin, xmin);
                            widg.xmax = Math.max(widg.xmax, xmax);

                            resolve_()
                        });
                        promise_arr[i] = i === 0 ? promise() : promise_arr[i - 1].then(promise);

                        // Update composites object
                        individual_composites[id] = {xmin: xmin, xmax: xmax, sense: sense, anti: anti};

                        resolve()
                    };

                    reader.onerror = function() {
                        alert("Error loading file!!");
                        reject("Error loading file")
                    };

                    reader.readAsText(file)
                })
            };

            // Wait for xdomain and composite arrays to be updated
            await promise_arr[n - 1];

            this.load_data(ids, xmin_curr, xmax_curr)
        },

        load_data: function(ids, plot=true) {
            // If no files, initialize sense and anti arrays; otherwise, pad sense and anti arrays to new xdomain
            if (this.files_loaded === 0) {
                this.sense = Array(this.xmax - this.xmin + 1).fill(0);
                this.anti = Array(this.xmax - this.xmin + 1).fill(0);
            } else {
                let xmin = Math.min(...ids.map(id => individual_composites[id].xmin)),
                    xmax = Math.max(...ids.map(id => individual_composites[id].xmax)),
                    prefix = Array(xmin - this.xmin).fill(0),
                    suffix = Array(this.xmax - xmax).fill(0);
                this.sense.unshift(...prefix);
                this.sense.push(...suffix);
                this.anti.unshift(...prefix);
                this.anti.push(...suffix)
            };

            // Update sense and anti arrays
            for (let id of ids) {
                let {xmin, xmax, sense, anti} = individual_composites[id];
                for (let j = xmin - this.xmin; j <= xmax - xmin; j++) {
                    let idx = xmin - this.xmin + j;
                    this.sense[idx] += sense[j];
                    this.anti[idx] += anti[j]
                }
            };

            // Update files loaded
            this.files_loaded += ids.length;
            d3.select(this.element.context).select("td.upload-col label")
                .text(this.files_loaded === 1 ? this.files_loaded + " file loaded" : this.files_loaded + " files loaded");

            // Update composite plot
            if (plot) {
                $("#settings-table").settings_table("plot_all_composites", {xmin: this.xmin, xmax: this.xmax, ymin: -Math.max(...this.anti), ymax: Math.max(...this.sense)});
                $("#main-plot").main_plot("update_legend")
            }
        },

        // Plot composite data
        plot_composite: function() {
            if (this.files_loaded) {
                $("#main-plot").main_plot("plot_composite", this.xmin, this.xmax, this.sense, this.anti, this.scale, this.options.color, this.options.separate_color && this.secondary_color, this.options.idx, this.opacity, this.smoothing, this.bp_shift, this.hide, this.hide_forward, this.hide_reverse, this.baseline)
            }
        },

        insert_row: function(idx, drop_y) {
            let {y, height} = this.element.context.getBoundingClientRect(),
                this_idx = parseInt(this.options.idx),
                insert_after = drop_y > y + (height / 2);
            $("#metadata-table").metadata_table("insert_row", idx, this_idx, insert_after);
            $("#main-plot").main_plot("change_order", idx, this_idx, insert_after);
            $("#settings-table").settings_table("insert_row", idx, this_idx, insert_after)
        },

        toggle_draggable: function(val) {
            d3.select(this.element.context).select("table").attr("draggable", val)
        },

        change_name: function(new_name, change_text=false) {
            this.options.name = new_name;
            $("#main-plot").main_plot("change_name", this.options.idx, new_name);

            //Manually adjust width of name divs
            let largestWidth = 0;
            d3.selectAll('.name-col').each(function() {
                let box = d3.select(this);
                box.style("min-width", "0px");
                let width = parseFloat(box.style('width'));
                largestWidth = Math.max(largestWidth, width);
            });

            d3.selectAll(".name-col")
                .style("min-width", largestWidth + "px");

            if (change_text) {
                d3.select(this.element.context).select("td.name-col div").text(new_name)
            }
        },

        change_color: function(new_color, plot=true) {
            this.options.color = new_color;
            d3.select(this.element.context).select("td.color-col input.color-1").attr("value", new_color);

            if (plot) {
                $("#main-plot").main_plot("change_color", this.options.idx, new_color, this.options.separate_color)
            }
        },

        change_secondary_color: function(new_color, plot=true) {
            this.secondary_color = new_color;
            d3.select(this.element.context).select("td.color-col input.color-2").attr("value", new_color);

            if (plot) {
                $("#main-plot").main_plot("change_secondary_color", this.options.idx, new_color)
            }
        },

        change_scale: function(new_scale, plot=true) {
            if (isNaN(new_scale)) {
                d3.select(this.element.context).select("td.scale-col input").node().value = this.scale;
                d3.select(this.element.context).select("td.scale-slider-col input.scale-slider").node().value = Math.log10(this.scale) * 50 + 50
            } else {
                new_scale = new_scale !== "" ? parseFloat(new_scale) : 1;
                this.scale = new_scale;
                d3.select(this.element.context).select("td.scale-col input.setting-text").node().value = Math.round(new_scale * 100) / 100;
                d3.select(this.element.context).select("td.scale-col input.scale-slider").node().value = Math.log10(new_scale) * 50 + 50;
                if (plot) {
                    this.plot_composite()
                }
            }
        },

        change_opacity: function(new_opacity, plot=true) {
            if (new_opacity === "" || new_opacity === false) {
                this.opacity = false;
                d3.select(this.element.context).select("td.opacity-col input").node().value = "";
                if (plot) {
                    $("#main-plot").main_plot("change_opacity", this.options.idx, false)
                }
            } else if (isNaN(new_opacity)) {
                d3.select(this.element.context).select("td.opacity-col input").node().value = this.opacity === false ? "" : this.opacity
            } else {
                new_opacity = Math.min(Math.max(parseFloat(new_opacity), 0), 1);
                this.opacity = new_opacity;
                d3.select(this.element.context).select("td.opacity-col input").node().value = new_opacity;
                if (plot) {
                    $("#main-plot").main_plot("change_opacity", this.options.idx, new_opacity)
                }
            }
        },

        change_smoothing: function(new_smoothing, plot=true) {
            if (new_smoothing === "" || new_smoothing === false) {
                this.smoothing = false;
                d3.select(this.element.context).select("td.smoothing-col input").node().value = "";
                if (plot) {
                    this.plot_composite()
                }
            } else if (isNaN(new_smoothing)) {
                d3.select(this.element.context).select("td.smoothing-col input").node().value = this.smoothing === false ? "" : this.smoothing
            } else {
                new_smoothing = Math.max(parseInt(new_smoothing), 1);
                this.smoothing = new_smoothing;
                d3.select(this.element.context).select("td.smoothing-col input").node().value = new_smoothing;
                if (plot) {
                    this.plot_composite()
                }
            }
        },

        change_bp_shift: function(new_bp_shift, plot=true) {
            if (new_bp_shift === "" || new_bp_shift === false) {
                this.bp_shift = false;
                d3.select(this.element.context).select("td.shift-col input").node().value = "";
                if (plot) {
                    this.plot_composite()
                }
            } else if (isNaN(new_bp_shift)) {
                d3.select(this.element.context).select("td.shift-col input").node().value = this.bp_shift === false ? "" : this.bp_shift
            } else {
                new_bp_shift = parseInt(new_bp_shift);
                this.bp_shift = new_bp_shift;
                d3.select(this.element.context).select("td.shift-col input").node().value = new_bp_shift;
                if (plot) {
                    this.plot_composite()
                }
            }
        },

        toggle_hide: function(hide, plot=true) {
            this.hide = hide;
            let hide_col = d3.select(this.element.context).select("td.hide-col");
            hide_col.select(".eye-open")
                .style("display", hide ? "none" : null);
            hide_col.select(".eye-closed")
                .style("display", hide ? null : "none");
            this.disable_direction_checkboxes(hide)

            if (plot && this.files_loaded) {
                $("#main-plot").main_plot("toggle_hide", this.options.idx, hide)
            }
        },

        //Disables direction checkboxes if composite is hidden
        disable_direction_checkboxes: function(disable, plot=true){
            this.hide_forward = disable;
            this.hide_reverse = disable;
            if (disable){
                d3.select(this.element.context).selectAll("input.direction_checkbox")
                    .attr("disabled", true)
                    .property('checked', false);
                d3.select(this.element.context).selectAll("td.hide-strand-col")
                    .style("opacity", ".5");
            } else {
                d3.select(this.element.context).selectAll("input.direction_checkbox")
                    .attr("disabled", null)
                    .property('checked', true);
                d3.select(this.element.context).selectAll("td.hide-strand-col")
                    .style("opacity", "1");
            }
            if (plot){
                this.plot_composite();
            }
        },

        //Hides forward strand
        toggle_forward: function(hide){
            this.hide_forward = hide;
            d3.select(this.element.context).select("input.forward_checkbox").property("checked", !hide);
            this.plot_composite();
        },

        //Hides reverse strand
        toggle_reverse: function(hide){
            this.hide_reverse = hide;
            d3.select(this.element.context).select("div.forward input").property("checked", !hide);
            this.plot_composite()
        },

        swap_senses: function(swapped){
            this.swapped = swapped;
            let temp = this.sense;
            this.sense = this.anti;
            this.anti = temp;
            d3.select(swap_senses_col.node()).select("#swap-senses-checkbox").property("checked", swapped);
            this.plot_composite()
        },

        //Changes baseline occupancy, adjusting slider for plot scale
        change_baseline: function(new_baseline, plot=true){
            if (isNaN(new_baseline)) {
                d3.select(this.element.context).select("td.baseline-col input.setting-text").node().value = this.baseline;
                d3.select(this.element.context).select("td.baseline-col input.shift-slider").node().value = (this.baseline) * $("#main-plot").main_plot("export").ymax + 50;

            } else {
                new_baseline = new_baseline !== "" ? parseFloat(new_baseline) : 0;
                this.baseline = new_baseline;
                d3.select(this.element.context).select("td.baseline-col input.setting-text").node().value = (new_baseline > 0? "+": "") + Math.round(new_baseline * 100) / 100;
                d3.select(this.element.context).select("td.baseline-col input.shift-slider").node().value = (new_baseline) * $("#main-plot").main_plot("export").ymax + 50;
                if (plot) {
                    this.plot_composite()
                }
            }
        },

        add_id: function(id) {
            this.options.ids.push(id);
            let id_list = d3.select(this.element.context).select(".id-col .id-list"),
                id_list_text = id_list.text();
            id_list.text(id_list_text ? (id_list_text + ", " + id) : id)
        },

        update_ids: function(new_ids) {
            if (new_ids != null){
                this.options.ids = new_ids;
                d3.select(this.element.context).select(".id-col .id-list").text(new_ids.join(", "))
            }

            //Manually adjust width of id-list divs
            let largestWidth = 0;
            d3.selectAll('td.id-col').each(function() {
                let box = d3.select(this);
                box.style("min-width", "0px")
                let width = box.node().getBoundingClientRect().width;
                largestWidth = Math.max(largestWidth, width);
            });
            console.log(largestWidth);

            //Largest width usually falls short by a few pixels
            d3.selectAll('td.id-col')
                .style("min-width", (largestWidth + 10) + "px");
        },

        toggle_color_separated_strands: function(separate) {
            this.options.separate_color = separate;

            if (separate) {
                let color_col = d3.select(this.element.context).select("td.color-col"),
                    row = d3.select(this.element.context);
                color_col.append("input")
                    .attr("type", "color")
                    .classed("color-2", true)
                    .attr("value", this.secondary_color)
                    .on("change", function() {$(row.node()).settings_row("change_secondary_color", this.value)});
                this.change_secondary_color(this.secondary_color)
            } else {
                this.change_color(this.options.color);
                d3.select(this.element.context).select("td.color-col input.color-2").remove()
            }
        },

        autoscale_composite: function() {
            if (this.options.ids.length > 0) {
                this.change_scale(1 / parseFloat(this.options.ids.length), false);
            }
        },

        toggle_second_row: function(){
            let button = d3.select(this.element.context).select("td.more-options-col input");
            if (button.attr("value") === "More Options"){
                button.attr("value", "Less Options");
                d3.select(this.element.context).select("tr.second-row").style("display", "revert");
            } else {
                button.attr("value", "More Options");
                d3.select(this.element.context).select("tr.second-row").style("display", "none");
            }
        },

        reset: function() {
            this.files_loaded = 0;
            this.xmin = Infinity;
            this.xmax = -Infinity;
            this.sense = null;
            this.anti = null;
            this.swapped = false;
            this.options.name = "Composite " + this.options.idx;
            this.scale = 1;
            this.baseline = 0;
            this.opacity = false;
            this.smoothing = false;
            this.bp_shift = false;
            this.hide = false;
            this.hide_forward = false;
            this.hide_reverse = false;
            this.options.ids = [];
            d3.select(this.element.context).select("td.name-col div").text(this.options.name);
            d3.select(this.element.context).select("td.scale-col input").node().value = 1;
            d3.select(this.element.context).select("td.opacity-col input").node().value = "";
            d3.select(this.element.context).select("td.smoothing-col input").node().value = "";
            d3.select(this.element.context).select("td.shift-col input").node().value = "";
            d3.select(this.element.context).select("td.upload-col label").text("No files loaded");
            this.update_ids([]);
            $("#metadata-table").metadata_table("reset_row", this.options.idx);
            $("#main-plot").main_plot("reset_composite", this.options.idx)
        },

        export: function() {
            return {
                name: this.options.name,
                xmin: this.xmin,
                xmax: this.xmax,
                sense: this.sense,
                anti: this.anti,
                swapped: this.swapped,
                color: this.options.color,
                secondary_color: this.secondary_color,
                scale: this.scale,
                baseline: this.baseline,
                opacity: this.opacity,
                smoothing: this.smoothing,
                bp_shift: this.bp_shift,
                hide: this.hide,
                hide_forward: this.hide_forward,
                hide_reverse: this.hide_reverse,
                files_loaded: this.files_loaded,
                ids: this.options.ids
            }
        },

        import: function(data) {
            if ("name" in data) {
                this.change_name(data.name, true)
            };
            if ("color" in data) {
                this.change_color(data.color)
            };
            if ("secondary_color" in data) {
                this.change_secondary_color(data.secondary_color, this.options.separate_color)
            } else {
                this.change_secondary_color(this.options.color)
            };
            if ("scale" in data) {
                this.change_scale(data.scale, false)
            };
            if ("opacity" in data) {
                this.change_opacity(data.opacity, false)
            };
            if ("smoothing" in data) {
                this.change_smoothing(data.smoothing, false)
            };
            if ("bp_shift" in data) {
                this.change_bp_shift(data.bp_shift, false)
            };
            if ("hide" in data) {
                this.toggle_hide(data.hide, false)
            };
            if ("files_loaded" in data) {
                this.files_loaded = data.files_loaded
            };
            if ("ids" in data) {
                this.update_ids(data.ids)
            };
            if ("xmin" in data && data.xmin !== null) {
                this.xmin = data.xmin
            };
            if ("xmax" in data && data.xmax !== null) {
                this.xmax = data.xmax
            };
            if ("sense" in data) {
                this.sense = data.sense
            };
            if ("anti" in data) {
                this.anti = data.anti
            };
            if ("swapped" in data) {
                this.swap_senses(data.swapped)
            };
            if ("baseline" in data) {
                this.baseline = data.baseline
            };
            if ("hide_forward" in data) {
                this.toggle_forward(data.hide_forward);
            };
            if ("hide_reverse" in data) {
                this.toggle_forward(data.hide_reverse);
            };

            d3.select(this.element.context).select("td.upload-col label")
                .text(this.files_loaded === 1 ? this.files_loaded + " file loaded" : this.files_loaded + " files loaded");
            this.plot_composite()
        }
    });

    $("#settings-table").settings_table()
})

$(window).resize(function() {
    $("#settings-table").settings_table("update_ids", 0, null);
});