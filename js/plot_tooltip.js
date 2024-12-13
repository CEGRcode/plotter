const plotTooltip = class {
    constructor() {
        this.mainPlot = plotObj._elements.mainPlot;
        
        const self = this;
        // Add event listeners to show and hide the tooltip
        this.mainPlot
            .on("mousemove", function(ev) {self.update(ev)})
            .on("mouseleave", function() {self.hide()});

        this.tooltip = this.mainPlot.append("g");
        // Create tooltip border
        this.tooltipBorder = this.tooltip.append("path")
            .attr("fill", "white")
            .attr("stroke", "black");
        // Create tooltip text group
        this.tooltipText = this.tooltip.append("g")
            .attr("font-size", "8px");
    }

    update(ev) {
        if (!dataObj.globalSettings.enableTooltip) {
            this.hide();
            return
        };

        // Get the relative mouse position
        const {x: plotX, y: plotY, width, height} = this.mainPlot.node().getBoundingClientRect(),
            mouseX = (ev.clientX - plotX) * plotObj.width / width,
            mouseY = (ev.clientY - plotY) * plotObj.height / height,
            mouseXScaled = Math.round(plotObj.xscale.invert(mouseX)),
            // Filter data to only include data that is visible and has been loaded
            data = dataObj.compositeData.filter(d => (!d.hideSense || !d.hideAnti) && d.filesLoaded > 0);
        // If cursor is out of range or there is no data, hide the tooltip
        if (mouseX < plotObj.margins.left || mouseX > plotObj.width - plotObj.margins.right ||
            mouseY < plotObj.margins.top || mouseY > plotObj.height - plotObj.margins.bottom ||
            data.length === 0) {
                this.hide();
                return
        };
        
        // Move tooltip to mouse position
        this.tooltip
            .style("display", null)
            .attr("transform", "translate(" + plotObj.xscale(mouseXScaled) + " " + mouseY + ")");

        // Populate tooltip text with data
        this.tooltipText.selectAll("text")
            .data([[[dataObj.globalSettings.labels.xlabel + ": " + mouseXScaled, "#000000"]], ...data.map(function(d) {
                const bpShift = d.bpShift === null ? dataObj.globalSettings.bpShift : d.bpShift;
                if (dataObj.globalSettings.combined) {
                    if (mouseXScaled < d.xmin + bpShift || mouseXScaled > d.xmax - bpShift) {
                        return null
                    };
                    return [
                        [
                            d.name + ": ",
                            "#000000"
                        ],
                        [
                            parseFloat((d.sense[mouseXScaled - d.xmin - bpShift] +
                                d.anti[mouseXScaled - d.xmin + bpShift]).toPrecision(3)),
                            d.primaryColor
                        ]
                    ]
                }
                if (mouseXScaled < d.xmin - bpShift || mouseXScaled > d.xmax + bpShift) {
                    return null
                } else if (mouseXScaled > d.xmax - bpShift) {
                    return [
                        [
                            d.name + ": ",
                            "#000000"
                        ],
                        [
                            parseFloat((d.swap ? d.anti : d.sense)[mouseXScaled - d.xmin - bpShift].toPrecision(3)),
                            d.primaryColor
                        ]
                    ]
                } else if (mouseXScaled < d.xmin + bpShift) {
                    return [
                        [
                            d.name + ": ",
                            "#000000"
                        ],
                        [
                            parseFloat((d.swap ? d.sense : d.anti)[mouseXScaled - d.xmin + bpShift].toPrecision(3)),
                            !dataObj.globalSettings.separateColors || d.secondaryColor === null ?
                                d.primaryColor : d.secondaryColor
                        ]
                    ]
                } else {
                    return [
                        [
                            d.name + ": ",
                            "#000000"
                        ],
                        [
                            parseFloat(d.sense[mouseXScaled - d.xmin - bpShift].toPrecision(3)),
                            d.primaryColor
                        ],
                        [
                            "; ",
                            "#000000"
                        ],
                        [
                            parseFloat(d.anti[mouseXScaled - d.xmin + bpShift].toPrecision(3)),
                            !dataObj.globalSettings.separateColors || d.secondaryColor === null ?
                                d.primaryColor : d.secondaryColor
                        ]
                    ]
                }
            }).filter(d => d !== null)])
            .join("text")
                .attr("x", 0)
                .attr("y", (_, i) => (i * 1.1) + "em")
                .attr("font-weight", (_, i) => i === 0 ? "bold" : null)
                .attr("stroke", (_, i) => i === 0 ? null : "#000000")
                .attr("stroke-width", (_, i) => i === 0 ? null : "0.1px")
                .selectAll("tspan")
                    .data(d => d)
                    .join("tspan")
                        .attr("fill", d => d[1])
                        .text(d => d[0]);
        
        // Get bounding box of tooltip text
        const {y, width: w, height: h} = this.tooltipText.node().getBBox();
        // Center tooltip text
        this.tooltipText.attr("transform", "translate(" + (-w / 2) + " " + (15 - y) + ")");

        // Update tooltip border
        this.tooltipBorder.attr("d", "M" + (-w / 2 - 10) + ",5H-5l5,-5l5,5H" + (w / 2 + 10) + "v" + (h + 20) + "h-" + (w + 20) + "z")
    }

    hide() {
        this.tooltip.style("display", "none")
    }
};

const tooltipObj = new plotTooltip()