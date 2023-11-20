$(function() {
    d3.select("#json-button").on("click", function() {
        let file_input = d3.select("#json-loader");
        file_input.node().value = null;
        file_input.node().click()
    });

    d3.select("#json-loader").on("input", function(ev) {
        reset();
        let file = event.target.files[0],
            reader = new FileReader();
        reader.onload = function() {
            let data;
            try {
                data = JSON.parse(reader.result)
            } catch (e) {
                alert("Invalid JSON file");
                return
            }

            let validate_json = function() {
                if (!data.metadata || !data.settings || !data.plot) {
                    return false
                };

                if (!data.metadata.basecols || !data.metadata.customcols || !data.metadata.rows) {
                    return false
                };

                if (data.metadata.rows.some(row => row.length !== data.metadata.basecols.length + data.metadata.customcols.length + 1)) {
                    return false
                };

                return true
            };

            if (!validate_json()) {
                alert("Invalid JSON file");
                return
            };

            $("#main-plot").main_plot("import", data.plot);
            if (data.separate_color !== undefined) {
                d3.select("#separate-color-checkbox").property("checked", data.separate_color);
                d3.select("#combined-checkbox").property("disabled", data.separate_color);
                $("#settings-table").settings_table("toggle_color_separated_strands", data.separate_color)
            };
            $("#settings-table").settings_table("import", data.settings);
            $("#metadata-table").metadata_table("import", data.metadata);
            $("#main-plot").main_plot("update_legend");
            if (data.preset) {
                $("#settings-dropdown").settings_dropdown("set_value", data.preset)
            }
            $("#enable-nucleosome-button").prop("disabled", false);
        };
        reader.readAsText(file)
    })
})
