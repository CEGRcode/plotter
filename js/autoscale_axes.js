d3.select("#autoscale-axes-button").on("click", async function() {
    if (dataObj.globalSettings.lockAxes) {
        alert("Unlock axes to autoscale");
        return
    };

    await dataObj.autoscaleAxisLimits();
    xAxisInputObj.update();
    yAxisInputObj.update();
    plotObj.updatePlot();
    referenceLinesObj.updateReferenceLines()
})