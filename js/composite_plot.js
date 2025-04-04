const plotObject = class {
    constructor(elementID, width, height, margins) {
        if (document.getElementById(elementID) === null) {
            throw "Element ID " + elementID + " not found"
        };
        this.width = width;
        this.height = height;
        this.margins = margins;
        this.xscale = d3.scaleLinear().range([this.margins.left, this.width - this.margins.right]);
        this.yscale = d3.scaleLinear().range([this.height - this.margins.bottom, this.margins.top]);
        this._elements = {
            mainPlot: d3.select("#" + elementID),
            axisTop: null,
            axisBottom: null,
            axisRight: null,
            axisLeft: null,
            midaxisBottom: null,
            midaxisTop: null,
            xminLabel: null,
            xmaxLabel: null,
            yminLabel: null,
            ymaxLabel: null,
            title: null,
            xlabel: null,
            ylabel: null,
            compositesGroup: null,
            compositesArr: []
        };
        this.counter = 0;

        this.createPlot()
    }

    createPlot() {
        // Set up svg element
        this._elements.mainPlot.attr("viewBox", "0 0 " + this.width + " " + this.height);

        // Create composite group
        this._elements.compositesGroup = this._elements.mainPlot.append("g");

        // Create static axes
        this._elements.axisTop = this._elements.mainPlot.append("g")
            .attr("transform", "translate(0 " + (this.height - this.margins.bottom) + ")");
        this._elements.axisBottom = this._elements.mainPlot.append("g")
            .attr("transform", "translate(0 " + this.margins.top + ")");
        this._elements.axisRight = this._elements.mainPlot.append("g")
            .attr("transform", "translate(" + this.margins.left + " 0)");
        this._elements.axisLeft = this._elements.mainPlot.append("g")
            .attr("transform", "translate(" + (this.width - this.margins.right) + " 0)");
        // Create dynamic axes
        this._elements.midaxisBottom = this._elements.mainPlot.append("g");
        this._elements.midaxisTop = this._elements.mainPlot.append("g");
        // Create axis bound labels
        this._elements.xminLabel = this._elements.mainPlot.append("text")
            .classed("plot-text", true)
            .attr("x", this.margins.left)
            .attr("y", this.height - this.margins.bottom + 15)
            .attr("text-anchor", "middle")
            .attr("font-size", "14px");
        this._elements.xmaxLabel = this._elements.mainPlot.append("text")
            .classed("plot-text", true)
            .attr("x", this.width - this.margins.right)
            .attr("y", this.height - this.margins.bottom + 15)
            .attr("text-anchor", "middle")
            .attr("font-size", "14px");
        this._elements.yminLabel = this._elements.mainPlot.append("text")
            .classed("plot-text", true)
            .attr("x", this.margins.left - 10)
            .attr("y", this.height - this.margins.bottom)
            .attr("text-anchor", "end")
            .attr("font-size", "14px");
        this._elements.ymaxLabel = this._elements.mainPlot.append("text")
            .classed("plot-text", true)
            .attr("x", this.margins.left - 10)
            .attr("y", this.margins.top + 10)
            .attr("text-anchor", "end")
            .attr("font-size", "14px");
        // Create axis labels
        const titleGroup = this._elements.mainPlot.append("g"),
            self = this;
        this._elements.title = titleGroup.append("text")
            .classed("plot-text", true)
            .classed("plot-label", true)
            .attr("x", (this.margins.left + this.width - this.margins.right) / 2)
            .attr("y", 20)
            .attr("text-anchor", "middle")
            .attr("font-size", "16px")
            .on("click", function() {editPlotLabel(titleGroup, self._elements.title, "title")});
        this._elements.blankTitle = titleGroup.append("rect")
            .classed("blank-plot-label", true)
            .attr("x", (this.margins.left + this.width - this.margins.right) / 2 - 50)
            .attr("y", 5)
            .attr("width", 100)
            .attr("height", 20)
            .attr("fill", "#FFFFFF")
            .attr("stroke", "#000000")
            .attr("stroke-width", .5)
            .on("click", function() {editPlotLabel(titleGroup, self._elements.title, "title")});
        const xlabelGroup = this._elements.mainPlot.append("g");
        this._elements.xlabel = xlabelGroup.append("text")
            .classed("plot-text", true)
            .classed("plot-label", true)
            .attr("x", (this.margins.left + this.width - this.margins.right) / 2)
            .attr("y", this.height - 5)
            .attr("text-anchor", "middle")
            .attr("font-size", "14px")
            .on("click", function() {editPlotLabel(xlabelGroup, self._elements.xlabel, "xlabel")});
        this._elements.blankXlabel = xlabelGroup.append("rect")
            .classed("blank-plot-label", true)
            .attr("x", (this.margins.left + this.width - this.margins.right) / 2 - 50)
            .attr("y", this.height - 18)
            .attr("width", 100)
            .attr("height", 16)
            .attr("fill", "#FFFFFF")
            .attr("stroke", "#000000")
            .attr("stroke-width", .5)
            .on("click", function() {editPlotLabel(xlabelGroup, self._elements.xlabel, "xlabel")});
        const ylabelGroup = this._elements.mainPlot.append("g");
        this._elements.ylabel = ylabelGroup.append("text")
            .classed("plot-text", true)
            .classed("plot-label", true)
            .attr("x", this.margins.left - 18)
            .attr("y", (this.margins.top + this.height - this.margins.bottom) / 2)
            .attr("transform", "rotate(-90 " + (this.margins.left - 18) + " " + ((this.margins.top + this.height - this.margins.bottom) / 2) + ")")
            .attr("text-anchor", "middle")
            .attr("font-size", "14px")
            .on("click", function() {editPlotLabel(ylabelGroup, self._elements.ylabel, "ylabel")});
        this._elements.blankYlabel = ylabelGroup.append("rect")
            .classed("blank-plot-label", true)
            .attr("x", this.margins.left - 29)
            .attr("y", (this.margins.top + this.height - this.margins.bottom) / 2 - 60)
            .attr("width", 16)
            .attr("height", 120)
            .attr("fill", "#FFFFFF")
            .attr("stroke", "#000000")
            .attr("stroke-width", .5)
            .on("click", function() {editPlotLabel(ylabelGroup, self._elements.ylabel, "ylabel")});

        this.updatePlot()
    }

    updatePlot() {
        // Get y limits
        const {ymax, ymin} = this.getYlimits();
        // Update scales for raw values to svg coordinates
        this.xscale.domain([dataObj.globalSettings.xmin, dataObj.globalSettings.xmax]);
        this.yscale.domain([ymin, ymax]);
        // Update static axes
        this._elements.axisTop.call(d3.axisTop(this.xscale).tickFormat("")).style("color", "#000000");
        this._elements.axisBottom.call(d3.axisBottom(this.xscale).tickFormat("")).style("color", "#000000");
        this._elements.axisRight.call(d3.axisRight(this.yscale).tickFormat("")).style("color", "#000000");
        this._elements.axisLeft.call(d3.axisLeft(this.yscale).tickFormat("")).style("color", "#000000");
        // Update dynamic axes
        if (dataObj.globalSettings.combined) {
            this._elements.midaxisBottom.attr("display", "none");
            this._elements.midaxisTop.attr("display", "none")
        } else {
            this._elements.midaxisBottom
                .attr("display", null)
                .attr("transform", "translate(0 " + this.yscale(0) + ")")
                .call(d3.axisBottom(this.xscale).tickFormat("")).style("color", "#000000");
            this._elements.midaxisTop
                .attr("display", null)
                .attr("transform", "translate(0 " + this.yscale(0) + ")")
                .call(d3.axisTop(this.xscale).tickFormat("")).style("color", "#000000")
        };
        // Update axis bound labels
        this._elements.xminLabel.text(dataObj.globalSettings.xmin);
        this._elements.xmaxLabel.text(dataObj.globalSettings.xmax);
        this._elements.yminLabel.text(String(parseFloat(ymin.toPrecision(2))).length > 7 ? parseFloat(ymin.toPrecision(2)).toExponential() : parseFloat(ymin.toPrecision(2)));
        this._elements.ymaxLabel.text(String(parseFloat(ymax.toPrecision(2))).length > 6 ? parseFloat(ymax.toPrecision(2)).toExponential() : parseFloat(ymax.toPrecision(2)));
        // Update axis labels
        this._elements.title.text(dataObj.globalSettings.labels.title)
            .attr("display", dataObj.globalSettings.labels.title.trim().length > 0 ? null : "none");
        this._elements.blankTitle.attr("display", dataObj.globalSettings.labels.title.trim().length > 0 ? "none" : null);
        this._elements.xlabel.text(dataObj.globalSettings.labels.xlabel)
            .attr("display", dataObj.globalSettings.labels.xlabel.trim().length > 0 ? null : "none");
        this._elements.blankXlabel.attr("display", dataObj.globalSettings.labels.xlabel.trim().length > 0 ? "none" : null);
        this._elements.ylabel.text(dataObj.globalSettings.labels.ylabel)
            .attr("display", dataObj.globalSettings.labels.ylabel.trim().length > 0 ? null : "none");
        this._elements.blankYlabel.attr("display", dataObj.globalSettings.labels.ylabel.trim().length > 0 ? "none" : null);

        // Update composite plots
        const plotN = this._elements.compositesArr.length,
            dataN = dataObj.compositeData.length;
        for (let i = 0; i < Math.max(plotN, dataN); i++) {
            // If there are more plots than data, remove the extra plots
            if (i >= dataN && i < plotN) {
                this._elements.compositesArr[this._elements.compositesArr.length - 1].remove();
                this._elements.compositesArr.splice(this._elements.compositesArr.length - 1, 1)
            // If there are more data than plots, create new plots
            } else if (i >= plotN && i < dataN) {
                this._elements.compositesArr.push(this.createComposite(this.counter++));
                this.updateComposite(this._elements.compositesArr[i], dataObj.compositeData[dataN - 1 - i])
            } else {
                this.updateComposite(this._elements.compositesArr[i], dataObj.compositeData[dataN - 1 - i])
            }
        }
    }

    createComposite(idx) {
        const compositeGroup = this._elements.compositesGroup.append("g");
    
        // Add gradients
        const defs = compositeGroup.append("defs");
        defs.append("linearGradient")
            .attr("id", "composite-gradient-top-" + idx)
            .classed("composite-gradient", true)
            .classed("top", true)
            .attr("x1", "0%")
            .attr("x2", "0%")
            .attr("y1", "0%")
            .attr("y2", "100%");
        defs.append("linearGradient")
            .attr("id", "composite-gradient-bottom-" + idx)
            .classed("composite-gradient", true)
            .classed("bottom", true)
            .attr("x1", "0%")
            .attr("x2", "0%")
            .attr("y1", "100%")
            .attr("y2", "0%");
            
        // Add traces at composite edges
        compositeGroup.append("path")
            .classed("composite-path", true)
            .classed("top", true)
            .attr("fill", "url(#composite-gradient-top-" + idx + ")")
            .attr("stroke", "#FFFFFF")
            .attr("stroke-width", 1)
            .attr("d", "");
        compositeGroup.append("path")
            .classed("composite-line", true)
            .classed("top", true)
            .attr("fill", "none")
            .attr("stroke", "#000000")
            .attr("stroke-width", 0.5)
            .attr("d", "");
        compositeGroup.append("path")
            .classed("composite-path", true)
            .classed("bottom", true)
            .attr("fill", "url(#composite-gradient-bottom-" + idx + ")")
            .attr("stroke", "#FFFFFF")
            .attr("stroke-width", 1)
            .attr("d", "");
        compositeGroup.append("path")
            .classed("composite-line", true)
            .classed("bottom", true)
            .attr("fill", "none")
            .attr("stroke", "#000000")
            .attr("stroke-width", 0.5)
            .attr("d", "");
        
        return compositeGroup
    }

    updateComposite(compositeElem, compositeData) {
        // Check if there are any files loaded
        if (compositeData.filesLoaded === 0) {
            compositeElem.attr("display", "none");
            return
        }
        compositeElem.attr("display", null);

        // Fetch composite settings
        const minOpacity = compositeData.minOpacity === null ? dataObj.globalSettings.minOpacity : compositeData.minOpacity,
            maxOpacity = compositeData.maxOpacity === null ? dataObj.globalSettings.maxOpacity : compositeData.maxOpacity,
            opacity = [maxOpacity, minOpacity],
            primaryColor = compositeData.primaryColor,
            secondaryColor = dataObj.globalSettings.separateColors && !dataObj.globalSettings.combined ? (compositeData.secondaryColor || primaryColor) : primaryColor,
            smoothing = compositeData.smoothing === null ? dataObj.globalSettings.smoothing : compositeData.smoothing,
            smoothShift = (smoothing - 1) / 2,
            bpShift = compositeData.bpShift === null ? dataObj.globalSettings.bpShift : compositeData.bpShift,
            scale = compositeData.scale;
        if (dataObj.globalSettings.combined) {
            // Adjust composite data according to settings
            let shiftedSense, shiftedAnti;
            if (bpShift > 0) {
                shiftedSense = compositeData.sense.slice(0, compositeData.sense.length - 2 * bpShift)
                shiftedAnti = compositeData.anti.slice(2 * bpShift)
            } else {
                shiftedSense = compositeData.sense.slice(-2 * bpShift)
                shiftedAnti = compositeData.anti.slice(0, compositeData.anti.length + 2 * bpShift)
            };
            const combinedOccupancy = shiftedSense.map((d, i) => d + shiftedAnti[i]),
                smoothedOccupancy = this.slidingWindow(combinedOccupancy, smoothing),
                compositeXmin = compositeData.xmin + Math.abs(bpShift) + smoothShift,
                compositeXmax = compositeData.xmax - Math.abs(bpShift) - smoothShift,
                truncatedXmin = Math.max(dataObj.globalSettings.xmin, compositeXmin),
                truncatedXmax = Math.min(dataObj.globalSettings.xmax, compositeXmax),
                truncatedOccupancy = smoothedOccupancy.slice(truncatedXmin - compositeXmin,
                        smoothedOccupancy.length - compositeXmax + truncatedXmax)
                    .map((d, i) => ({x: truncatedXmin + i, y: d * scale + compositeData.shiftOccupancy}));
            truncatedOccupancy.unshift({x: truncatedXmin, y: 0});
            truncatedOccupancy.push({x: truncatedXmax, y: 0});
            // Set fill color and opacity
            compositeElem.select("defs .composite-gradient.top").selectAll("stop")
                .data([0, 1])
                .join("stop")
                    .attr("offset", d => d)
                    .attr("stop-color", primaryColor)
                    .attr("stop-opacity", d => opacity[d]);
            // Set composite paths
            const topLine = d3.line()
                .x(d => this.xscale(d.x))
                .y(d => this.yscale(d.y));
            compositeElem.select(".composite-path.top")
                .attr("stroke", dataObj.globalSettings.colorTrace ? null : "#FFFFFF")
                .attr("display", compositeData.hideSense && compositeData.hideAnti ? "none" : null)
                .datum(truncatedOccupancy)
                .attr("d", topLine);
            compositeElem.select(".composite-line.top")
                .attr("stroke", dataObj.globalSettings.colorTrace ? primaryColor : "#000000")
                .attr("display", compositeData.hideSense && compositeData.hideAnti ? "none" : null)
                .datum(truncatedOccupancy.slice(1, -1))
                .attr("d", topLine);
            compositeElem.select(".composite-path.bottom")
                .attr("display", "none");
            compositeElem.select(".composite-line.bottom")
                .attr("display", "none")
        } else {
            // Adjust composite data according to settings
            const smoothedSense = this.slidingWindow(compositeData.sense, smoothing),
                smoothedAnti = this.slidingWindow(compositeData.anti, smoothing),
                truncatedXminSense = Math.max(dataObj.globalSettings.xmin, compositeData.xmin + smoothShift + bpShift),
                truncatedXmaxSense = Math.min(dataObj.globalSettings.xmax, compositeData.xmax - smoothShift + bpShift),
                truncatedXminAnti = Math.max(dataObj.globalSettings.xmin, compositeData.xmin + smoothShift - bpShift),
                truncatedXmaxAnti = Math.min(dataObj.globalSettings.xmax, compositeData.xmax - smoothShift - bpShift),
                truncatedSense = smoothedSense.slice(truncatedXminSense - compositeData.xmin - smoothShift - bpShift,
                        smoothedSense.length - compositeData.xmax + truncatedXmaxSense + smoothShift - bpShift)
                    .map((d, i) => ({x: truncatedXminSense + i, y: d * scale + compositeData.shiftOccupancy})),
                truncatedAnti = smoothedAnti.slice(truncatedXminAnti - compositeData.xmin - smoothShift + bpShift,
                        smoothedAnti.length - compositeData.xmax + truncatedXmaxAnti + smoothShift + bpShift)
                    .map((d, i) => ({x: truncatedXminAnti + i, y: d * scale + compositeData.shiftOccupancy}));
            truncatedSense.unshift(({x: truncatedXminSense, y: 0}));
            truncatedSense.push(({x: truncatedXmaxSense, y: 0}));
            truncatedAnti.unshift(({x: truncatedXminAnti, y: 0}));
            truncatedAnti.push(({x: truncatedXmaxAnti, y: 0}));
            // Set fill color and opacity
            compositeElem.select("defs .composite-gradient.top").selectAll("stop")
                .data([0, 1])
                .join("stop")
                    .attr("offset", d => d)
                    .attr("stop-color", primaryColor)
                    .attr("stop-opacity", d => opacity[d]);
            compositeElem.select("defs .composite-gradient.bottom").selectAll("stop")
                .data([0, 1])
                .join("stop")
                    .attr("offset", d => d)
                    .attr("stop-color", secondaryColor)
                    .attr("stop-opacity", d => opacity[d]);
            // Set composite paths
            const topLine = d3.line()
                .x(d => this.xscale(d.x))
                .y(d => this.yscale(d.y));
            compositeElem.select(".composite-path.top")
                .attr("stroke", dataObj.globalSettings.colorTrace ? null : "#FFFFFF")
                .attr("display", compositeData.hideSense ? "none" : null)
                .datum(compositeData.swap ? truncatedAnti : truncatedSense)
                .attr("d", topLine);
            compositeElem.select(".composite-line.top")
                .attr("stroke", dataObj.globalSettings.colorTrace ? primaryColor : "#000000")
                .attr("display", compositeData.hideSense ? "none" : null)
                .datum(compositeData.swap ? truncatedAnti.slice(1, -1) : truncatedSense.slice(1, -1))
                .attr("d", topLine);
            const bottomLine = d3.line()
                .x(d => this.xscale(d.x))
                .y(d => this.yscale(-d.y));
            compositeElem.select(".composite-path.bottom")
                .attr("stroke", dataObj.globalSettings.colorTrace ? null : "#FFFFFF")
                .attr("display", compositeData.hideAnti ? "none" : null)
                .datum(compositeData.swap ? truncatedSense : truncatedAnti)
                .attr("d", bottomLine);
            compositeElem.select(".composite-line.bottom")
                .attr("stroke", dataObj.globalSettings.colorTrace ? secondaryColor : "#000000")
                .attr("display", compositeData.hideAnti ? "none" : null)
                .datum(compositeData.swap ? truncatedSense.slice(1, -1) : truncatedAnti.slice(1, -1))
                .attr("d", bottomLine)
        }
    }

    slidingWindow(vec, window) {
        let val = vec.slice(0, window).reduce((a, c) => a + c, 0) / window,
            newVec = [val];
        for (let i = 0; i < vec.length - window; i++) {
            val += (vec[i + window] - vec[i]) / window;
            newVec.push(val);
        };
        return newVec
    }

    getYlimits() {
        if (dataObj.globalSettings.combined) {
            return {
                ymax: roundUpWithPrecision(dataObj.globalSettings.ymax - dataObj.globalSettings.ymin),
                ymin: 0
            }
        } else if (dataObj.globalSettings.symmetricY) {
            return {
                ymax: roundUpWithPrecision(Math.max(dataObj.globalSettings.ymax, -dataObj.globalSettings.ymin)),
                ymin: roundUpWithPrecision(Math.min(-dataObj.globalSettings.ymax, dataObj.globalSettings.ymin))
            }
        } else {
            return {
                ymax: roundUpWithPrecision(dataObj.globalSettings.ymax),
                ymin: roundUpWithPrecision(dataObj.globalSettings.ymin)
            }
        }
    }

    downloadAsSVG(minimal=false) {
        // Hide placeholder labels
        this._elements.mainPlot.selectAll(".blank-plot-label").attr("display", "none");
        this._elements.mainPlot.selectAll(".legend-move").attr("display", "none");

        if (minimal) {
            this._elements.mainPlot.selectAll(".plot-text").attr("display", "none");
            legendObj.legend.attr("display", "none")
        };

        // Download plot as SVG
        const b64doc = btoa(this._elements.mainPlot.node().outerHTML.replaceAll("&nbsp;", "")),
            a = document.createElement("a"),
            e = new MouseEvent("click");
        a.download = "composite_plot.svg";
        a.href = "data:image/svg+xml;base64," + b64doc;
        a.dispatchEvent(e);
        // Revert any changes to the plot
        this.updatePlot();
        this._elements.mainPlot.selectAll(".plot-text").attr("display", null);
        legendObj.updateLegend()
    }
};

let plotObj = new plotObject("main-plot", 500, 300, {top: 30, right: 190, bottom: 35, left: 60})
