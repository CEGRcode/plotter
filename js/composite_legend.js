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
        
        const elSelect = this.legend.selectAll("g.legend-element")
            .data(dataObj.compositeData)
            .join("g")
                .classed("legend-element", true);
        elSelect.attr("display", d => d.hideSense && d.hideAnti || d.filesLoaded === 0 ? "none" : null);
        let y = 0;
        elSelect.attr("transform", function(d) {
            const t = "translate(0 " + (24 * y) + ")";
            y += !(d.hideSense && d.hideAnti || d.filesLoaded === 0);
            return t
        });
        elSelect.selectAll("rect")
            .data(() => [null])
            .join("rect")
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
                .text(d => d.name)
    }
};

const legendObj = new legendObject();