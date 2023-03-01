$(function() {
    d3.select("#json-download").on("click", function() {
        let data = {
            metadata: $("#metadata-table").metadata_table("export"),
            settings: $("#settings-table").settings_table("export"),
            plot: $("#main-plot").main_plot("export"),
            preset: $("#settings-dropdown").settings_dropdown("get_value")
        },
            a = document.createElement("a"),
            e = new MouseEvent("click");
        a.download = "composite_plot_config.json";
        a.href = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 4));
        a.dispatchEvent(e)
    })
})