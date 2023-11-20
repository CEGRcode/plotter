$(function() {
    d3.select("#load-composite-button").on("click", function() {
        d3.select("#composite-loader").node().click()
    });

    d3.select("#composite-loader").on("change", function(ev) {
        let file = ev.target.files[0],
            reader = new FileReader();

        reader.onload = function() {
            let prefixes = get_prefixes_from_multiple_composite(reader.result),
                composites = parse_multiple_composite(reader.result, prefixes[0]),
                xmin = Math.min(...Object.values(composites).map(c => c.xmin)),
                xmax = Math.max(...Object.values(composites).map(c => c.xmax)),
                ymax = Math.max(...Object.values(composites).map(c => Math.max(...c.sense, ...c.anti)));

            for (let id in composites) {
                individual_composites[id] = composites[id];
                $("#metadata-table").metadata_table("add_row", [id]);
                $("#settings-table").settings_table("add_row", [id]);
            };

            $("#settings-table").settings_table("plot_all_composites", {xmin: xmin, xmax: xmax, ymax: ymax}, allow_shrink=true);
            $("#main-plot").main_plot("update_legend")
            $("#enable-nucleosome-button").prop("disabled", false);
        };

        reader.readAsText(file);
    })
})