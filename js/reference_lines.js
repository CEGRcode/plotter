const lineStyles = {
    solid: "0",
    dashed: "5, 5",
    dotted: "2, 1"
}

const referenceLines = class {
    constructor() {
        this.mainPlot = plotObj._elements.mainPlot;

        this.horizontalLineGroup = this.mainPlot.append("g");
        this.verticalLineGroup = this.mainPlot.append("g");

        this.updateReferenceLines()
    }

    updateReferenceLines() {
        this.horizontalLineGroup.selectAll("line.visible-reference-line")
            .data(dataObj.referenceLines.horizontalLines)
            .join("line")
                .classed("visible-reference-line", true)
                .attr("stroke", d => d.color)
                .attr("stroke-width", 1)
                .attr("stroke-dasharray", d => lineStyles[d.linestyle])
                .attr("x1", plotObj.margins.left)
                .attr("x2", plotObj.width - plotObj.margins.right)
                .attr("y1", d => plotObj.yscale(d.y))
                .attr("y2", d => plotObj.yscale(d.y));
        this.horizontalLineGroup.selectAll("line.draggable-reference-line")
            .data(dataObj.referenceLines.horizontalLines)
            .join("line")
                .classed("draggable-reference-line", true)
                .attr("stroke", "transparent")
                .attr("stroke-width", 10)
                .attr("x1", plotObj.margins.left)
                .attr("x2", plotObj.width - plotObj.margins.right)
                .attr("y1", d => plotObj.yscale(d.y))
                .attr("y2", d => plotObj.yscale(d.y));
        this.horizontalLineGroup.selectAll("text")
            .data(dataObj.referenceLines.horizontalLines)
            .join("text")
                .attr("x", plotObj.width - plotObj.margins.right + 5)
                .attr("y", d => plotObj.yscale(d.y) - 5)
                .attr("font-size", "8px")
                .attr("fill", d => d.color)
                .text(d => d.y);

        this.verticalLineGroup.selectAll("line.visible-reference-line")
            .data(dataObj.referenceLines.verticalLines)
            .join("line")
                .classed("visible-reference-line", true)
                .attr("stroke", d => d.color)
                .attr("stroke-width", 1)
                .attr("stroke-dasharray", d => lineStyles[d.linestyle])
                .attr("x1", d => plotObj.xscale(d.x))
                .attr("x2", d => plotObj.xscale(d.x))
                .attr("y1", plotObj.margins.top)
                .attr("y2", plotObj.height - plotObj.margins.bottom);
        this.verticalLineGroup.selectAll("line.draggable-reference-line")
            .data(dataObj.referenceLines.verticalLines)
            .join("line")
                .classed("draggable-reference-line", true)
                .attr("stroke", "transparent")
                .attr("stroke-width", 10)
                .attr("x1", d => plotObj.xscale(d.x))
                .attr("x2", d => plotObj.xscale(d.x))
                .attr("y1", plotObj.margins.top)
                .attr("y2", plotObj.height - plotObj.margins.bottom);
        this.verticalLineGroup.selectAll("text")
            .data(dataObj.referenceLines.verticalLines)
            .join("text")
                .attr("x", d => plotObj.xscale(d.x) + 5)
                .attr("y", plotObj.height - plotObj.margins.bottom + 5)
                .attr("font-size", "8px")
                .attr("fill", d => d.color)
                .text(d => d.x)
    }
}