$(function() {
    d3.select("#tsv-download").on("click", function() {
        let metadata = $("#metadata-table").metadata_table("export"),
            settings = $("#settings-table").settings_table("export"),
            plot = $("#main-plot").main_plot("export"),
            separate_color = d3.select("#separate-color-checkbox").property("checked"),
            str = "#Preset: " + $("#settings-dropdown").settings_dropdown("get_value") + "\n"
                + (d3.select("#combined-checkbox").property("checked") ? "#Combined\n" : "")
                + (separate_color ? "#Separate color\n" : "")
                + "IDs\t";
        for (let col of metadata.basecols) {
            str += col.label + "\t"
        };
        for (let col of metadata.customcols) {
            str += col + "\t"
        };
        str += "Forward strand color\tReverse strand color\tScale\tOpacity\tSmoothing\tBP shift\tHidden\n";
        for (let i = 0; i < metadata.rows.length; i++) {
            str += metadata.rows[i].join("\t") + "\t" + settings[i].color + "\t"
                + (separate_color ? settings[i].secondary_color : settings[i].color) + "\t" + settings[i].scale + "\t"
                + (settings[i].opacity !== false ? settings[i].opacity : plot.opacity) + "\t"
                + (settings[i].smoothing !== false ? settings[i].smoothing : plot.smoothing) + "\t"
                + (settings[i].bp_shift !== false ? settings[i].bp_shift : plot.bp_shift) + "\t"
                + settings[i].hide + "\n"
        };

        let a = document.createElement("a"),
            e = new MouseEvent("click");
        a.download = "composite_plot_metadata.tsv";
        a.href = "data:text/plain;charset=utf-8," + encodeURIComponent(str);
        a.dispatchEvent(e)
    })
})