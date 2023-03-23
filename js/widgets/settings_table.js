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
            let new_row = this._elements.table.append("tr"),
                color = this.colors[this.rows_added % this.colors.length];
            $(new_row.node()).settings_row({idx: this._elements.rows.length, name: "Composite " + this.rows_added, color: color, ids: ids, separate_color: this.separate_color});
            this._elements.rows.push(new_row);

            // Add a new composite to the plot
            $("#main-plot").main_plot("add_composite", "Composite " + this.rows_added++, color)
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
                $("#main-plot").main_plot("scale_axes", scale_axes.xmin, scale_axes.xmax, scale_axes.ymax, allow_shrink || this._elements.rows.reduce(function(sum, row) {
                    let inst = $(row.node()).settings_row("instance");
                    return sum + (inst.files_loaded && !inst.hide)
                }, 0) === 1, true)
            };

            for (let row of this._elements.rows) {
                $(row.node()).settings_row("plot_composite")
            }
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
                    ymax = -Infinity;
                this._elements.rows.forEach(function(row) {
                    let inst = $(row.node()).settings_row("instance");
                    if (inst.files_loaded && !inst.hide) {
                        xmin = Math.min(xmin, inst.xmin);
                        xmax = Math.max(xmax, inst.xmax);
                        ymax = Math.max(ymax, Math.max(...inst.sense, ...inst.anti) * inst.scale)
                    }
                });

                $("#main-plot").main_plot("scale_axes", xmin, xmax, ymax, true, true);
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
            this._create()
        }
    });

    // Settings row widget
    $.widget("composite_plot.settings_row", {
        xmin: Infinity,
        xmax: -Infinity,
        sense: null,
        anti: null,
        composites: null,
        scale: 1,
        opacity: false,
        smoothing: false,
        bp_shift: false,
        hide: false,
        files_loaded: 0,
        secondary_color: "#000000",

        options: {
            idx: null,
            name: null,
            color: null,
            ids: [],
            separate_color: false
        },

        // Create a new row
        _create: function() {
            if (this.options.ids.length > 0) {
                this.xmin = Math.min(...this.options.ids.map(id => individual_composites[id].xmin));
                this.xmax = Math.max(...this.options.ids.map(id => individual_composites[id].xmax));
                this.load_data(this.options.ids, plot=false)
            };

            // Add event listeners
            let row = d3.select(this.element.context)
                .classed("added-row", true)
                .attr("draggable", true)
                .on("mouseover", function(e) {$(row.node()).settings_row("highlight_row", e, "mouse-highlight")})
                .on("mouseleave", function(e) {$(row.node()).settings_row("unhighlight_row", e, "mouse-highlight")})
                .on("dragstart", function(e) {e.dataTransfer.setData("text/plain", $(row.node()).settings_row("option", "idx"))})
                .on("dragover", function(e) {$(row.node()).settings_row("highlight_row", e, "drag-highlight")})
                .on("dragleave", function(e) {$(row.node()).settings_row("unhighlight_row", e, "drag-highlight")})
                .on("drop", function(e) {
                    $(row.node()).settings_row("unhighlight_row", e, "drag-highlight");
                    $(row.node()).settings_row("direct_drop_event", e)
                }),

            // Add sliders and buttons
                drag_col = row.append("td")
                .classed("drag-col", true)
                .style("width", "48px"),
                name_col = row.append("td")
                .classed("name-col", true),
                color_col = row.append("td")
                .classed("color-col", true),
                scale_col = row.append("td")
                .classed("scale-col", true),
                opacity_col = row.append("td")
                .classed("opacity-col", true),
                smoothing_col = row.append("td")
                .classed("smoothing-col", true),
                shift_col = row.append("td")
                .classed("shift-col", true),
                hide_col = row.append("td")
                .classed("hide-col", true),
                upload_col = row.append("td")
                .classed("upload-col", true),
                id_col = row.append("td")
                .classed("id-col", true),
                reset_col = row.append("td")
                .classed("reset-col", true);

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
            if (this.options.separate_color) {
                color_col.append("input")
                    .attr("type", "color")
                    .classed("color-2", true)
                    .attr("value", this.secondary_color)
                    .on("change", function() {$(row.node()).settings_row("change_secondary_color", this.value)});
            };

            // Add scale input
            scale_col.append("label")
                .text("Scale:");
            scale_col.append("input")
                .attr("type", "text")
                .classed("setting-text", true)
                .attr("value", 1)
                .on("change", function() {$(row.node()).settings_row("change_scale", this.value)})
                .on("mousedown", function() {$(row.node()).settings_row("toggle_draggable", false)})
                .on("mouseup", function() {$(row.node()).settings_row("toggle_draggable", true)})
                .on("mouseleave", function() {$(row.node()).settings_row("toggle_draggable", true)});

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
            reset_col.append("input")
                .attr("type", "button")
                .attr("value", "Reset")
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
            d3.select(this.element.context).classed(hl_class, true);
            $("#metadata-table").metadata_table("highlight_row", this.options.idx)
        },

        // Unhighlight the row
        unhighlight_row: function(ev, hl_class) {
            ev.preventDefault();
            d3.select(this.element.context).classed(hl_class, false);
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
                        widg.xmin = Math.min(widg.xmin, individual_composites[id].xmin);
                        widg.xmax = Math.max(widg.xmax, individual_composites[id].xmax);
                        resolve()
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
                $("#settings-table").settings_table("plot_all_composites", {xmin: this.xmin, xmax: this.xmax, ymax: Math.max(...this.sense, ...this.anti)});
                $("#main-plot").main_plot("update_legend")
            }
        },

        // Plot composite data
        plot_composite: function() {
            if (this.files_loaded) {
                $("#main-plot").main_plot("plot_composite", this.xmin, this.xmax, this.sense, this.anti, this.scale, this.options.color, this.options.separate_color && this.secondary_color, this.options.idx, this.opacity, this.smoothing, this.bp_shift, this.hide)
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
            d3.select(this.element.context).attr("draggable", val)
        },

        change_name: function(new_name, change_text=false) {
            this.options.name = new_name;
            $("#main-plot").main_plot("change_name", this.options.idx, new_name);

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
                d3.select(this.element.context).select("td.scale-col input").node().value = this.scale
            } else {
                new_scale = new_scale !== "" ? parseFloat(new_scale) : 1;
                this.scale = new_scale;
                d3.select(this.element.context).select("td.scale-col input").node().value = new_scale;
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

            if (plot && this.files_loaded) {
                $("#main-plot").main_plot("toggle_hide", this.options.idx, hide)
            }
        },

        add_id: function(id) {
            this.options.ids.push(id);
            let id_list = d3.select(this.element.context).select(".id-col .id-list"),
                id_list_text = id_list.text();
            id_list.text(id_list_text ? (id_list_text + ", " + id) : id)
        },

        update_ids: function(new_ids) {
            this.options.ids = new_ids;
            d3.select(this.element.context).select(".id-col .id-list").text(new_ids.join(", "))
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

        reset: function() {
            this.files_loaded = 0;
            this.xmin = Infinity;
            this.xmax = -Infinity;
            this.sense = null;
            this.anti = null;
            this.options.name = "Composite " + this.options.idx;
            this.scale = 1;
            this.opacity = false;
            this.smoothing = false;
            this.bp_shift = false;
            this.hide = false;
            this.options.ids = [];
            d3.select(this.element.context).select("td.name-col div").text(this.options.name);
            d3.select(this.element.context).select("td.scale-col input").node().value = "";
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
                color: this.options.color,
                secondary_color: this.secondary_color,
                scale: this.scale,
                opacity: this.opacity,
                smoothing: this.smoothing,
                bp_shift: this.bp_shift,
                hide: this.hide,
                files_loaded: this.files_loaded,
                ids: this.options.ids
            }
        },

        import: function(data) {
            if (data.name !== undefined) {
                this.change_name(data.name, true)
            };
            if (data.color !== undefined) {
                this.change_color(data.color)
            };
            if (data.secondary_color !== undefined) {
                this.change_secondary_color(data.secondary_color)
            };
            if (data.scale !== undefined) {
                this.change_scale(data.scale, false)
            };
            if (data.opacity !== undefined) {
                this.change_opacity(data.opacity, false)
            };
            if (data.smoothing !== undefined) {
                this.change_smoothing(data.smoothing, false)
            };
            if (data.bp_shift !== undefined) {
                this.change_bp_shift(data.bp_shift, false)
            };
            if (data.hide !== undefined) {
                this.toggle_hide(data.hide, false)
            };
            if (data.files_loaded !== undefined) {
                this.files_loaded = data.files_loaded
            };
            if (data.ids !== undefined) {
                this.update_ids(data.ids)
            };
            if (data.xmin !== undefined && data.xmin !== null) {
                this.xmin = data.xmin
            };
            if (data.xmax !== undefined && data.xmax !== null) {
                this.xmax = data.xmax
            };
            if (data.sense !== undefined) {
                this.sense = data.sense
            };
            if (data.anti !== undefined) {
                this.anti = data.anti
            };

            d3.select(this.element.context).select("td.upload-col label")
                .text(this.files_loaded === 1 ? this.files_loaded + " file loaded" : this.files_loaded + " files loaded");
            this.plot_composite()
        }
    });

    $("#settings-table").settings_table()
})