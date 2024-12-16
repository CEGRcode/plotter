const lineStyles = {
    solid: "0",
    dashed: "5, 5",
    dotted: "2, 1"
}

const horizontalReferenceLine = class {
    constructor(y, color, linestyle) {
        this.y = y;
        this.color = color;
        this.linestyle = linestyle;

        this.mainPlot = plotObj._elements.mainPlot;

        this.plotGroup = this.mainPlot.append("g");
        this.visibleLine = this.plotGroup.append("line")
            .attr("stroke", this.color)
            .attr("stroke-width", 1)
            .attr("stroke-dasharray", lineStyles[this.linestyle])
            .attr("x1", plotObj.margins.left)
            .attr("x2", plotObj.width - plotObj.margins.right)
            .attr("y1", 0)
            .attr("y2", 0);
        this.draggableLine = this.plotGroup.append("line")
            .attr("stroke", "transparent")
            .attr("stroke-width", 10)
            .attr("x1", plotObj.margins.left)
            .attr("x2", plotObj.width - plotObj.margins.right)
            .attr("y1", 0)
            .attr("y2", 0);

        const self = this;
    }

    update() {
        this.plotGroup.attr("transform", "translate(0 " + plotObj.yscale(this.y) + ")");
        this.visibleLine.attr("stroke", this.color);
    }
}