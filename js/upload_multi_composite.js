d3.select("#multi-composite-button").on("click", function() {
    $(d3.select("#multi-composite-loader").node()).click()
})

d3.select("#multi-composite-loader").on("input", async function() {
    let lastFilledComposite = -1;
    for (let i = 0; i < dataObj.compositeData.length; i++) {
        if (dataObj.compositeData[i].ids.length > 0) {
            lastFilledComposite = i
        }
    };
    const compositesToFill = [...Array(dataObj.compositeData.length - lastFilledComposite - 1).keys()]
            .map(d => d + lastFilledComposite + 1),
        ids = await compositeLoaderObj.loadMultiComposite(this.files[0]);
    let i = 0;
    for (i; i < Math.min(compositesToFill.length, ids.length); i++) {
        const id = ids[i],
            compositeObj = dataObj.compositeData[compositesToFill[i]];
        compositeObj.changeName(id);
        compositeObj.ids = [id];
        compositeObj.updateData();
        tableObj.rows[compositesToFill[i]].updateInputs()
    };
    for (i; i < ids.length; i++) {
        const id = ids[i],
            compositeObj = dataObj.addCompositeData({idx: tableObj.nRows, name: id, ids: [id]});
        compositeObj.updateData();
        tableObj.addRow(compositeObj)
    };
    await dataObj.autoscaleAxisLimits();
    xAxisInputObj.update();
    yAxisInputObj.update();
    plotObj.updatePlot();
    legendObj.updateLegend();
    referenceLinesObj.updateReferenceLines();
    nucleosomeSliderObj.updateNucleosomeSlider()
})