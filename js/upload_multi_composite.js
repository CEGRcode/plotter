d3.select("#multi-composite-button").on("click", function() {
    $(d3.select("#multi-composite-loader").node()).click()
})

d3.select("#multi-composite-loader").on("input", async function() {
    const ids = await compositeLoaderObj.loadMultiComposite(this.files[0]);
    for (const id of ids) {
        const compositeObj = dataObj.addCompositeData({idx: tableObj.nRows, name: id, ids: [id]});
        compositeObj.updateData();
        tableObj.addRow(compositeObj)
    };
    await dataObj.autoscaleAxisLimits();
    xAxisInputObj.update();
    yAxisInputObj.update();
    plotObj.updatePlot();
    legendObj.updateLegend();
    referenceLinesObj.updateReferenceLines()
})