d3.select("#json-button").on("click", function() {
    $(d3.select("#json-loader").node()).click()
})

d3.select("#json-loader").on("change", async function() {
    await dataObj.importDataFromJSON(this.files[0]);
    updateAll()
})