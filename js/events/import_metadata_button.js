$(function() {
    d3.select("#import-metadata-button").on("click", function() {
        d3.select("#import-metadata-form").style("display", null)
    });

    d3.select("#import-metadata-submit-button").on("click", function() {
        let api_key = d3.select("#pegr-api-key-input").node().value,
            email = d3.select("#email-input").node().value;
        $("#metadata-table").metadata_table("import_metadata_from_pegr", api_key, email);
        d3.select("#import-metadata-form").style("display", "none")
    });

    d3.select("#import-metadata-cancel-button").on("click", function() {
        d3.select("#import-metadata-form").style("display", "none")
    })
})