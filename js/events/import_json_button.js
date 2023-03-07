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

                if (!data.plot.title || !data.plot.xlabel || !data.plot || isNaN(data.plot.xmin) ||
                    isNaN(data.plot.xmax) || isNaN(data.plot.ymax) || isNaN(data.plot.opacity) ||
                    !data.plot.smoothing || isNaN(data.plot.bp_shift) || isNaN(data.plot.combined) ||
                    isNaN(data.plot.locked)) {
                    return false
                };

                if (data.settings.some(function(setting) {
                    if (isNaN(setting.xmin) || isNaN(setting.xmax) || !setting.color || isNaN(setting.scale) ||
                        isNaN(setting.files_loaded)) {
                        return true
                    };

                    if (setting.files_loaded === 0 && setting.xmax === null && setting.xmin === null) {
                        return false
                    };

                    let range = setting.xmax - setting.xmin + 1;
                    if (setting.sense.length !== range || setting.anti.length !== range) {
                        return true
                    }
                })) {
                    return false
                };

                return true
            };

            if (!validate_json()) {
                alert("Invalid JSON file");
                return
            };

            $("#main-plot").main_plot("import", data.plot);
            $("#settings-table").settings_table("import", data.settings);
            $("#metadata-table").metadata_table("import", data.metadata);
            $("#main-plot").main_plot("update_legend");
            $("#settings-dropdown").settings_dropdown("set_value", data.preset)
        };
        reader.readAsText(file)
    })
})
