$(function() {
    // Metadata table widget
    $.widget("composite_plot.metadata_table", {
        // Base columns always present in the table
        basecols: [
            {name: "target", label: "Target", show: false},
            {name: "antibody", label: "Antibody", show: false},
            {name: "strain", label: "Strain", show: false},
            {name: "genetic-modification", label: "Genetic modification", show: false},
            {name: "growth-media", label: "Growth media", show: false},
            {name: "treatments", label: "Treatments", show: false},
            {name: "assay", label: "Assay", show: false},
            {name: "dedup-reads", label: "Dedup reads", show: false}
        ],
        customcols: [],

        // Counter for the number of fields added
        field_name_counter: 0,

        _elements: {
            header: null,
            fields: [],
            tbody: null,
            rows: []
        },

        // Create the table
        _create: function() {
            let table = d3.select(this.element.context),
                header = table.append("thead")
                    .append("tr");
            this._elements.header = header;

            // Add the ID column
            header.append("th")
                .attr("id", "header-ids")
                .append("div")
                    .text("IDs");

            // Add the base columns
            for (let col of this.basecols) {
                header.append("th")
                    .attr("id", "header-" + col.name)
                    .style("display", col.show ? null : "none")
                    .append("div")
                        .text(col.label);
            };

            // Add button to add a field
            let add_field = header.append("th")
                .attr("id", "add-field")
                .classed("text-center", true)
                .attr("title", "Add field"),
                add_field_icon = add_field.append("svg")
                    .classed("add-field-icon", true)
                    .attr("baseProfile", "full")
                    .attr("viewBox", "-200 -200 400 400")
                    .attr("version", "1.1")
                    .attr("xmlns", "http://www.w3.org/2000/svg")
                    .style("height", "20px")
                    .style("width", "20px")
                    .append("g");
            add_field_icon.append("circle")
                .attr("cx", 0)
                .attr("cy", 0)
                .attr("r", 200)
                .attr("fill", "#468C00");
            add_field_icon.append("polygon")
                .attr("points", "-130,30 -30,30 -30,130 30,130 30,30 130,30 130,-30 30,-30 30,-130 -30,-130 -30,-30 -130,-30")
                .attr("fill", "#FFFFFF");

            // Add dropdown menu
            let dropdown = add_field.append("div")
                .classed("dropdown", true);
            dropdown.selectAll("div")
                .data(this.basecols)
                .join("div")
                    .attr("id", d => "dropdown-" + d.name)
                    .classed("dropdown-element", true)
                    .classed("selected", d => d.show)
                    .text(d => d.label)
                    .each(function(d, i, e) {
                        d3.select(e[i]).on("click", function() {
                            d.show = !d.show;
                            $("#metadata-table").metadata_table("toggle_base_field", d.name, d.show)
                        })
                    });
            dropdown.append("div")
                .attr("id", "add-custom-field")
                .classed("dropdown-element", true)
                .text("+Custom field")
                .on("click", function() {$("#metadata-table").metadata_table("add_field")});

            let tbody = table.append("tbody");
            this._elements.tbody = tbody;

            // Add button to add a row
            let add_row = tbody.append("tr")
                .attr("id", "add-row")
                .on("click", function() {
                $("#metadata-table").metadata_table("add_row");
                // Link rows in settings table to metadata table
                $("#settings-table").settings_table("add_row")
            });
            add_row.append("td")
                .attr("colspan", 100)
                .text("Add entry")
        },

        // Toggle a base field
        toggle_base_field: function(name, show) {
            this._elements.header.select("#header-" + name)
                .style("display", show ? null : "none");
            d3.select("#dropdown-" + name)
                .classed("selected", show);

            // Toggle field in all rows
            for (let row of this._elements.rows) {
                $(row.node()).metadata_row("toggle_field", name, show)
            }
        },

        // Add a field to the table
        add_field: function() {
            let new_field = this._elements.header.insert("th", "#add-field"),
                field_idx = this._elements.fields.length;
            $(new_field.node()).metadata_field({idx: field_idx, name: "Field " + this.field_name_counter++});

            // Add new field to all rows
            for (let row of this._elements.rows) {
                $(row.node()).metadata_row("add_field", field_idx)
            };

            this.customcols.push(field_idx);
            this._elements.fields.push(new_field)
        },

        // Remove a field from the table
        remove_field: function(i) {
            // Remove field from all rows
            for (let row of this._elements.rows) {
                $(row.node()).metadata_row("remove_field", i)
            }

            this._elements.fields.splice(i, 1);

            // Rename all fields after the removed one
            this.customcols = [...Array.from(this._elements.fields, (d, i) => i)];
            for (let j in this._elements.fields) {
                $(this._elements.fields[j].node()).metadata_field("set_index", j)
            }
        },

        // Add a row to the table
        add_row: function(ids=[]) {
            let new_row = this._elements.tbody.insert("tr", "#add-row");
            $(new_row.node()).metadata_row({idx: this._elements.rows.length, basecols: this.basecols, customcols: this.customcols, ids: ids});
            this._elements.rows.push(new_row)
        },

        // Remove a row from the table
        remove_row: function(i) {
            this._elements.rows.splice(i, 1);

            // Rename all rows after the removed one
            for (let j in this._elements.rows) {
                $(this._elements.rows[j].node()).metadata_row("set_index", j)
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
                    $(this._elements.rows[i].node()).metadata_row("set_index", i)
                }
            }
        },

        add_id: function(i, id) {
            $(this._elements.rows[i].node()).metadata_row("add_id", id)
        },

        // Highlight a row
        highlight_row: function(i) {
            $(this._elements.rows[i].node()).metadata_row("highlight")
        },

        // Unhighlight a row
        unhighlight_row: function(i) {
            $(this._elements.rows[i].node()).metadata_row("unhighlight")
        },

        reset_row(i) {
            $(this._elements.rows[i].node()).metadata_row("reset")
        },

        import_metadata_from_pegr: async function(api_key, email) {
            let test = $.post(
                'https://thanos.vmhost.psu.edu/pegr/api/fetchSampleData?apiKey=' + api_key,
                {
                    userEmail: email,
                    id: 1
                }
            );
            try {
                await test;
                for (let row of this._elements.rows) {
                    $(row.node()).metadata_row("fetch_metadata_for_pegr_ids", api_key, email)
                }
            } catch {
                if (test.status === 401) {
                    alert("Invalid credentials")
                } else {
                    alert("Error fetching metadata from PEGR")
                }
            }
        },

        export: function() {
            let data = {
                basecols: this.basecols,
                customcols: this._elements.fields.map(d => d.select("div").text()),
                rows: this._elements.rows.map(d => $(d.node()).metadata_row("export"))
            };

            return data
        },

        import: function(data) {
            // Add the base fields
            for (let i in data.basecols) {
                let col = data.basecols[i];
                this.toggle_base_field(col.name, col.show);
                this.basecols[i].show = col.show
            };

            // Add the custom fields
            for (let i in data.customcols) {
                this.add_field();
                $(this._elements.fields[i].node()).metadata_field("set_name", data.customcols[i])
            };

            // Add the rows
            for (let i in data.rows) {
                this.add_row();
                $(this._elements.rows[i].node()).metadata_row("import", data.rows[i])
            }
        },

        reset: function() {
            d3.select(this.element.context).selectAll("*").remove();
            this.field_name_counter = 0;
            this.basecols = [
                {name: "target", label: "Target", show: false},
                {name: "antibody", label: "Antibody", show: false},
                {name: "strain", label: "Strain", show: false},
                {name: "genetic-modification", label: "Genetic modification", show: false},
                {name: "growth-media", label: "Growth media", show: false},
                {name: "treatments", label: "Treatments", show: false},
                {name: "assay", label: "Assay", show: false},
                {name: "dedup-reads", label: "Dedup reads", show: false}
            ];
            this.customcols = [];
            this._elements.fields = [];
            this._elements.rows = [];
            this._create()
        }
    });

    // Metadata field widget
    $.widget("composite_plot.metadata_field", {
        options: {
            idx: null,
            name: null
        },

        // Create the field
        _create: function() {
            let field = d3.select(this.element.context)
                .style("position", "relative");
            field.append("div")
                .attr("contenteditable", true)
                .text(this.options.name);

            // Add button to remove the field
            let remove_field = field.append("svg")
                .classed("remove-field-icon", true)
                .attr("baseProfile", "full")
                .attr("viewBox", "-200 -200 400 400")
                .attr("version", "1.1")
                .attr("xmlns", "http://www.w3.org/2000/svg")
                .on("click", function() {$(field.node()).metadata_field("destroy")});
            remove_field.append("g")
                    .append("polygon")
                        .attr("points", "-130,30 -30,30 -30,130 30,130 30,30 130,30 130,-30 30,-30 30,-130 -30,-130 -30,-30 -130,-30")
                        .attr("fill", "#000000")
                        .attr("transform", "rotate(45)");
        },

        // Remove the field
        _destroy: function() {
            $("#metadata-table").metadata_table("remove_field", this.options.idx);
            d3.select(this.element.context).remove()
        },

        // Set the field index
        set_index: function(i) {
            this.options.idx = i
        },

        set_name: function(name) {
            d3.select(this.element.context).select("div").text(name)
        }
    });

    // Metadata row widget
    $.widget("composite_plot.metadata_row", {
        options: {
            idx: null,
            basecols: [],
            customcols: [],
            ids: []
        },

        // Create the row
        _create: function() {
            let row = d3.select(this.element.context)
                .classed("content-row", true);
            row.selectAll("td")
                .data(this.options.basecols)
                .join("td")
                    .attr("class", d => "content-field field-" + d.name)
                    .style("display", d => d.show ? null : "none")
                    .append("div")
                        .attr("contenteditable", true)
                        .on("input", function() {d3.select(this.parentNode).classed("mismatch", false)});
            this.options.customcols.forEach(d => {
                row.append("td")
                    .classed("content-field", true)
                    .classed("field-" + d, true)
                    .append("div")
                        .attr("contenteditable", true)
            });
            row.insert("td", "td")
                .attr("class", "content-field field-ids")
                .append("div")
                    .text(this.options.ids.join(", "));

            // Add button to remove the row
            let remove_row = row.append("td")
                .classed("remove-row", true)
                .classed("text-center", true)
                .attr("title", "Remove row")
                .on("click", function() {$(row.node()).metadata_row("destroy")}),
                remove_row_icon = remove_row.append("svg")
                .classed("remove-row-icon", true)
                .attr("baseProfile", "full")
                .attr("viewBox", "-200 -200 400 400")
                .attr("version", "1.1")
                .attr("xmlns", "http://www.w3.org/2000/svg")
                .style("height", "20px")
                .style("width", "20px")
                .append("g");
            remove_row_icon.append("circle")
                .attr("cx", 0)
                .attr("cy", 0)
                .attr("r", 200)
                .attr("fill", "#DD0000");
            remove_row_icon.append("polygon")
                .attr("points", "-130,30 -30,30 -30,130 30,130 30,30 130,30 130,-30 30,-30 30,-130 -30,-130 -30,-30 -130,-30")
                .attr("fill", "#FFFFFF")
                .attr("transform", "rotate(45)")
        },

        // Remove the row
        _destroy: function() {
            $("#metadata-table").metadata_table("remove_row", this.options.idx);
            // Link rows in settings table to metadata table
            $("#settings-table").settings_table("remove_row", this.options.idx);
            // Link composites in plot to metadata table
            $("#main-plot").main_plot("remove_composite", this.options.idx);
            d3.select(this.element.context).remove()
        },

        // Toggle a base field
        toggle_field: function(name, show) {
            d3.select(this.element.context).select("td.field-" + name)
                .style("display", show ? null : "none")
        },

        // Add a field to the row
        add_field: function(i) {
            d3.select(this.element.context).insert("td", "td.remove-row")
                .classed("custom-field", true)
                .classed("content-field", true)
                .classed("field-" + i, true)
                .append("div")
                    .attr("contenteditable", true)
        },

        // Remove a field from the row
        remove_field: function(i) {
            let row = d3.select(this.element.context);
            row.select("td.field-" + i).remove();

            // Rename the remaining fields
            row.selectAll("td.custom-field").join()
                .attr("class", (d, i) => "custom-field field-" + i)
        },

        // Add ID to row
        add_id: function(id) {
            this.options.ids.push(id);
            d3.select(this.element.context).select("td.field-ids div").text(this.options.ids.join(", "))
        },

        // Set the row index
        set_index: function(i) {
            this.options.idx = i
        },

        // Highlight row
        highlight: function() {
            d3.select(this.element.context).classed("mouse-highlight", true)
        },

        // Unhighlight row
        unhighlight: function() {
            d3.select(this.element.context).classed("mouse-highlight", false)
        },

        fetch_metadata_for_pegr_ids: async function(api_key, email) {
            let base_metadata = [
                {key: "antibody", field_name: "antibody", val: new Set()},
                {key: "assay", field_name: "assay", val: new Set()},
                {key: "geneticModification", field_name: "genetic-modification", val: new Set()},
                {key: "growthMedia", field_name: "growth-media", val: new Set()},
                {key: "strain", field_name: "strain", val: new Set()},
                {key: "target", field_name: "target", val: new Set()},
                {key: "treatments", field_name: "treatments", val: new Set()}
            ],
                dedup_reads = [];
            for (let pegr_id of this.options.ids) {
                await $.post(
                    'https://thanos.vmhost.psu.edu/pegr/api/fetchSampleData?apiKey=' + api_key,
                    {
                        userEmail: email,
                        id: pegr_id
                    },
                    function(response) {
                        for (let base_field of base_metadata) {
                            let val = response.data[0][base_field.key];
                            if (val) {
                                base_field.val.add(val)
                            }
                        };

                        dedup_reads.push(response.data[0].experiments[0].alignments[0].dedupUniquelyMappedReads)
                    }
                ).fail(
                    function() {
                        alert("PEGR ID " + pegr_id + " not found")
                    }
                )
            };
            for (let base_field of base_metadata) {
                let val;
                if (base_field.val.size === 0) {
                    val = ""
                } else if (base_field.val.size === 1) {
                    val = base_field.val.values().next().value
                } else {
                    val = "{(" + Array.from(base_field.val).join("), (") + ")}";
                    d3.select(this.element.context).select("td.field-" + base_field.field_name).classed("mismatch", true)
                };
                d3.select(this.element.context).select("td.field-" + base_field.field_name + " div").text(val)
            };
            d3.select(this.element.context).select("td.field-dedup-reads div").text(dedup_reads.join(", "))
        },

        reset: function() {
            this.options.ids = [];

            d3.select(this.element.context).selectAll("td.content-field").join()
                .select("div")
                    .text("");
            d3.select(this.element.context).selectAll("td.content-field").classed("mismatch", false)
        },

        export: function() {
            return d3.select(this.element.context).selectAll("td.content-field").nodes().map(d => d3.select(d).select("div").text())
        },

        import: function(data) {
            this.options.ids = data[0].split(", ");

            d3.select(this.element.context).selectAll("td.content-field").data(data).join()
                .select("div")
                    .text(d => d);

            // Link rows in settings table to metadata table
            $("#settings-table").settings_table("update_ids", this.options.idx, data[0].split(", "))
        }
    });

    $("#metadata-table").metadata_table()
})