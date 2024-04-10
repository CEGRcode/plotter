$(function() {
    d3.select("#json-download").on("click", function() {
        let data = {
            metadata: $("#metadata-table").metadata_table("export"),
            settings: $("#settings-table").settings_table("export"),
            plot: $("#main-plot").main_plot("export"),
            reference_axes: $("#reference-axes-pane").reference_axes("export"),
            nucleosome_slider: $("#nucleosome-slider").nucleosome_slider("export"),
            preset: $("#settings-dropdown").settings_dropdown("get_value"),
            separate_color: d3.select("#separate-color-checkbox").property("checked")
        },
            a = document.createElement("a"),
            e = new MouseEvent("click");
        a.download = "composite_plot_config.json";
        a.href = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 4));
        a.dispatchEvent(e)
    })
})