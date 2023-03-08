$(function() {
    d3.select("#load-composite-button").on("click", function() {
        d3.select("#composite-loader").node().click()
    });

    d3.select("#composite-loader").on("change", function(ev) {
        let file = ev.target.files[0],
            reader = new FileReader();

        reader.onload = function() {
            let prefixes = get_prefixes_from_multiple_composite(reader.result),
                composites = parse_multiple_composite(reader.result, prefixes[0]);

            for (let id in composites) {
                individual_composites[id] = composites[id];
                $("#metadata-table").metadata_table("add_row", [id]);
                $("#settings-table").settings_table("add_row", [id]);
            }
        };

        reader.readAsText(file);
    })
})