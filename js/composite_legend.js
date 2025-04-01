const legendObject = class {
    constructor() {
        const mainPlot = plotObj._elements.mainPlot;
        this.legend = mainPlot.append("g")
            .attr("id", "composite-legend")
            .attr("transform", "translate(" + (plotObj.width - plotObj.margins.right + 25) + " " + plotObj.margins.top + ")");
        this.legendElements = [];
    }

    updateLegend() {
        this.legend.attr("display", dataObj.globalSettings.showLegend ? null : "none");
        
        const self = this,
            visibleLegendOrder = [...dataObj.legendOrder.keys()].filter(function(legendIdx) {
                const compositeIdx = dataObj.legendOrder[legendIdx];
                return !dataObj.compositeData[compositeIdx].hideSense &&
                    !dataObj.compositeData[compositeIdx].hideAnti &&
                    dataObj.compositeData[compositeIdx].filesLoaded > 0
            }),
            elSelect = this.legend.selectAll("g.legend-element")
                .data(visibleLegendOrder.map(idx => dataObj.compositeData[dataObj.legendOrder[idx]]))
                .join("g")
                    .classed("legend-element", true);

        elSelect.attr("transform", (_, i) => "translate(0 " + (24 * i) + ")");
        elSelect.selectAll("rect.legend-color")
            .data(() => [null])
            .join("rect")
                .classed("legend-color", true)
                .attr("width", 15)
                .attr("height", 15)
                .attr("stroke", "#000000")
                .attr("stroke-width", 1)
                .attr("fill", "none");
        elSelect.selectAll("polygon.legend-color-sense")
            .data(d => [d])
            .join("polygon")
                .classed("legend-color-sense", true)
                .attr("points", "0,0 15,0 15,15 0,15")
                .attr("fill", d => d.primaryColor)
                .attr("display", d => d.hideSense ? "none" : null);
        elSelect.selectAll("polygon.legend-color-anti")
            .data(d => [d])
            .join("polygon")
                .classed("legend-color-anti", true)
                .attr("points", "15,0 15,15 0,15")
                .attr("fill", d => dataObj.globalSettings.separateColors && !dataObj.globalSettings.combined ? (d.secondaryColor || d.primaryColor) : d.primaryColor)
                .attr("display", d => d.hideAnti ? "none" : null);
        elSelect.selectAll("text")
            .data(d => [d])
            .join("text")
                .classed("plot-text", true)
                .classed("legend-text", true)
                .attr("x", 20)
                .attr("y", 10)
                .attr("font-size", "10px")
                .text(d => d.name);
        elSelect.selectAll("polygon.legend-move")
            .data(function(_, i) {
                const moveArr = [
                    {
                        oldIdx: i,
                        newIdx: i - 1,
                        points: "0,6 6,6 3,1"
                    },
                    {
                        oldIdx: i,
                        newIdx: i + 1,
                        points: "0,9 6,9 3,14"
                    }
                ];
                if (i === 0) {
                    moveArr[0].points = null
                };
                if (i === visibleLegendOrder.length - 1) {
                    moveArr[1].points = null
                };
                return moveArr
            })
            .join("polygon")
                .attr("transform", "translate(" + (plotObj.margins.right - 36) + " 0)")
                .classed("legend-move", true)
                .attr("display", d => d.points ? null : "none")
                .attr("points", d => d.points)
                .attr("fill", "#000000")
                .attr("stroke-width", 1)
                .attr("cursor", "pointer")
                .each(function(d) {
                    d3.select(this).on("click", function() {
                        const oldIdx = visibleLegendOrder[d.oldIdx],
                            newIdx = visibleLegendOrder[d.newIdx];
                        dataObj.legendOrder.splice(newIdx, 0, dataObj.legendOrder.splice(oldIdx, 1)[0]);
                        self.updateLegend()
                    })
                });
        
        this.legendElements = elSelect.nodes();
    }
};

const legendObj = new legendObject();