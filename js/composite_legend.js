const legendObject = class {
    constructor() {
        const mainPlot = plotObj._elements.mainPlot;
        this.legend = mainPlot.append("g")
            .attr("id", "composite-legend")
            .attr("transform", "translate(" + (plotObj.width - plotObj.margins.right + 25) + " " + plotObj.margins.top + ")");
        this.legendElements = [];
    }

    updateLegend() {
        const plotN = this.legendElements.length,
            dataN = dataObj.compositeData.length;
        let y = 0;
        for (let i = 0; i < Math.max(plotN, dataN); i++) {
            // If there are more legend elements than data, remove the extra legend elements
            if (i >= dataN && i < plotN) {
                this.legendElements[i].remove();
                this.legendElements.splice(i, 1)
            // If there are more data than legend elements, create new legend elements
            } else if (i >= plotN && i < dataN) {
                this.legendElements.push(this.createLegendElement());
                y = this.updateLegendElement(this.legendElements[i], dataObj.compositeData[i], y)
            } else {
                y = this.updateLegendElement(this.legendElements[i], dataObj.compositeData[i], y)
            }
        }
    }

    createLegendElement() {
        const legendElement = this.legend.append("g")
            .classed("legend-element", true);

        legendElement.append("polygon")
            .classed("legend-color-sense", true)
            .attr("points", "0,0 15,0 15,15 0,15");
        legendElement.append("polygon")
            .classed("legend-color-anti", true)
            .attr("points", "15,0 15,15 0,15");
        legendElement.append("rect")
            .attr("width", 15)
            .attr("height", 15)
            .attr("stroke", "#000000")
            .attr("stroke-width", 1)
            .attr("fill", "none");
        legendElement.append("text")
            .classed("legend-text", true)
            .attr("x", 20)
            .attr("y", 10)
            .attr("font-size", "10px");

        return legendElement
    }

    updateLegendElement(legendElement, compositeData, y) {
        const hide = compositeData.hideSense && compositeData.hideAnti || compositeData.filesLoaded === 0;
        legendElement
            .attr("transform", "translate(0 " + (24 * y) + ")")
            .style("display", hide ? "none" : null);
        legendElement.select(".legend-color-sense")
            .attr("fill", compositeData.primaryColor)
            .style("display", compositeData.hideSense ? "none" : null);
        legendElement.select(".legend-color-anti")
            .attr("fill", dataObj.globalSettings.separateColors && !dataObj.globalSettings.combined ? (compositeData.secondaryColor || compositeData.primaryColor) : compositeData.primaryColor)
            .style("display", compositeData.hideAnti ? "none" : null);
        legendElement.select(".legend-text")
            .text(compositeData.name);
        
        return y + !hide
    }
};

const legendObj = new legendObject();