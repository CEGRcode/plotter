const updateAll = function() {
    tableObj.loadFromDataObject();
    xAxisInputObj.update();
    yAxisInputObj.update();
    lockAxesObj.update();
    plotObj.updatePlot();
    legendObj.updateLegend();
    opacityInputObj.update();
    smoothingInputObj.update();
    bpShiftInputObj.update();
    combineStrandsObj.update();
    separateColorsObj.update();
    colorTraceObj.update();
    enablePlotTooltipObj.update();
    showLegendObj.update()
}