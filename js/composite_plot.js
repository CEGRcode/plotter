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
            refline: null,
            xminLabel: null,
            xmaxLabel: null,
            yminLabel: null,
            ymaxLabel: null,
            title: null,
            xlabel: null,
            ylabel: null,
            composites: []
        };
        this.counter = 0;

        this.createPlot()
    }

    createPlot() {
        // Set up svg element
        this._elements.mainPlot.attr("viewBox", "0 0 " + this.width + " " + this.height);

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
        this._elements.midaxisBottom = this._elements.mainPlot.append("g")
            .attr("transform", "translate(0 " + ((this.height - this.margins.bottom + this.margins.top) / 2) + ")");
        this._elements.midaxisTop = this._elements.mainPlot.append("g")
            .attr("transform", "translate(0 " + ((this.height - this.margins.bottom + this.margins.top) / 2) + ")");
        // Create vertical line at reference point
        this._elements.refline = this._elements.mainPlot.append("line")
            .attr("stroke", "gray")
            .attr("stroke-width", 1)
            .attr("stroke-dasharray", "5,5")
            .attr("opacity", .5);
        // Create axis bound labels
        this._elements.xminLabel = this._elements.mainPlot.append("text")
            .attr("x", this.margins.left)
            .attr("y", this.height - this.margins.bottom + 15)
            .style("text-anchor", "middle")
            .attr("font-size", "14px");
        this._elements.xmaxLabel = this._elements.mainPlot.append("text")
            .attr("x", this.width - this.margins.right)
            .attr("y", this.height - this.margins.bottom + 15)
            .style("text-anchor", "middle")
            .attr("font-size", "14px");
        this._elements.yminLabel = this._elements.mainPlot.append("text")
            .attr("x", this.margins.left - 10)
            .attr("y", this.height - this.margins.bottom)
            .style("text-anchor", "end")
            .attr("font-size", "14px");
        this._elements.ymaxLabel = this._elements.mainPlot.append("text")
            .attr("x", this.margins.left - 10)
            .attr("y", this.margins.top + 10)
            .style("text-anchor", "end")
            .attr("font-size", "14px");
        // Create axis labels
        const titleGroup = this._elements.mainPlot.append("g"),
            self = this;
        this._elements.title = titleGroup.append("text")
            .attr("x", (this.margins.left + this.width - this.margins.right) / 2)
            .attr("y", 20)
            .style("text-anchor", "middle")
            .attr("font-size", "16px")
            .on("click", function() {editPlotLabel(titleGroup, self._elements.title, "title")});
        const xlabelGroup = this._elements.mainPlot.append("g");
        this._elements.xlabel = xlabelGroup.append("text")
            .attr("x", (this.margins.left + this.width - this.margins.right) / 2)
            .attr("y", this.height - 5)
            .style("text-anchor", "middle")
            .attr("font-size", "14px")
            .on("click", function() {editPlotLabel(xlabelGroup, self._elements.xlabel, "xlabel")});
        const ylabelGroup = this._elements.mainPlot.append("g");
        this._elements.ylabel = ylabelGroup.append("text")
            .attr("x", this.margins.left - 18)
            .attr("y", (this.margins.top + this.height - this.margins.bottom) / 2)
            .attr("transform", "rotate(-90 " + (this.margins.left - 18) + " " + ((this.margins.top + this.height - this.margins.bottom) / 2) + ")")
            .style("text-anchor", "middle")
            .attr("font-size", "14px")
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
        this._elements.axisTop.call(d3.axisTop(this.xscale).tickFormat(""));
        this._elements.axisBottom.call(d3.axisBottom(this.xscale).tickFormat(""));
        this._elements.axisRight.call(d3.axisRight(this.yscale).tickFormat(""));
        this._elements.axisLeft.call(d3.axisLeft(this.yscale).tickFormat(""));
        // Update dynamic axes
        if (dataObj.globalSettings.combined) {
            this._elements.midaxisBottom.style("display", "none");
            this._elements.midaxisTop.style("display", "none")
        } else {
            this._elements.midaxisBottom
                .style("display", null)
                .attr("transform", "translate(0 " + this.yscale(0) + ")")
                .call(d3.axisBottom(this.xscale).tickFormat(""));
            this._elements.midaxisTop
                .style("display", null)
                .attr("transform", "translate(0 " + this.yscale(0) + ")")
                .call(d3.axisTop(this.xscale).tickFormat(""))
        }
        // Update vertical line at reference point
        this._elements.refline
            .attr("x1", this.xscale(0))
            .attr("x2", this.xscale(0))
            .attr("y1", this.yscale(ymin))
            .attr("y2", this.yscale(ymax));
        // Update axis bound labels
        this._elements.xminLabel.text(dataObj.globalSettings.xmin);
        this._elements.xmaxLabel.text(dataObj.globalSettings.xmax);
        this._elements.yminLabel.text(String(parseFloat(ymin.toPrecision(2))).length > 7 ? parseFloat(ymin.toPrecision(2)).toExponential() : parseFloat(ymin.toPrecision(2)));
        this._elements.ymaxLabel.text(String(parseFloat(ymax.toPrecision(2))).length > 6 ? parseFloat(ymax.toPrecision(2)).toExponential() : parseFloat(ymax.toPrecision(2)));
        // Update axis labels
        this._elements.title.text(dataObj.globalSettings.labels.title);
        this._elements.xlabel.text(dataObj.globalSettings.labels.xlabel);
        this._elements.ylabel.text(dataObj.globalSettings.labels.ylabel);

        // Update composite plots
        const plotN = this._elements.composites.length,
            dataN = dataObj.compositeData.length;
        for (let i = 0; i < Math.max(plotN, dataN); i++) {
            // If there are more plots than data, remove the extra plots
            if (i >= dataN && i < plotN) {
                this._elements.composites[i].remove();
                this._elements.composites.splice(i, 1)
            // If there are more data than plots, create new plots
            } else if (i >= plotN && i < dataN) {
                this._elements.composites.push(this.createComposite(this.counter++));
                this.updateComposite(this._elements.composites[i], dataObj.compositeData[i])
            } else {
                this.updateComposite(this._elements.composites[i], dataObj.compositeData[i])
            }
        }
    }

    createComposite(idx) {
        const compositeGroup = this._elements.mainPlot.append("g");
    
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
            const shiftedSense = compositeData.sense.slice(0, compositeData.sense.length - 2 * bpShift),
                shiftedAnti = compositeData.anti.slice(2 * bpShift),
                combinedOccupancy = shiftedSense.map((d, i) => d + shiftedAnti[i]),
                smoothedOccupancy = this.slidingWindow(combinedOccupancy, smoothing),
                compositeXmin = compositeData.xmin + bpShift + smoothShift,
                compositeXmax = compositeData.xmax - bpShift - smoothShift,
                truncatedXmin = Math.max(dataObj.globalSettings.xmin, compositeXmin),
                truncatedXmax = Math.min(dataObj.globalSettings.xmax, compositeXmax),
                truncatedOccupancy = smoothedOccupancy.slice(truncatedXmin - compositeXmin,
                        smoothedOccupancy.length - truncatedXmax - compositeXmax)
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
                .style("display", compositeData.hideSense && compositeData.hideAnti ? "none" : null)
                .datum(truncatedOccupancy)
                .attr("d", topLine);
            compositeElem.select(".composite-line.top")
                .attr("stroke", dataObj.globalSettings.colorTrace ? primaryColor : "#000000")
                .style("display", compositeData.hideSense && compositeData.hideAnti ? "none" : null)
                .datum(truncatedOccupancy.slice(1, -1))
                .attr("d", topLine);
            compositeElem.select(".composite-path.bottom")
                .style("display", "none");
            compositeElem.select(".composite-line.bottom")
                .style("display", "none")
        } else {
            // Adjust composite data according to settings
            const smoothedSense = this.slidingWindow(compositeData.sense, smoothing),
                smoothedAnti = this.slidingWindow(compositeData.anti, smoothing),
                truncatedXminSense = Math.max(dataObj.globalSettings.xmin, compositeData.xmin + smoothShift + bpShift),
                truncatedXmaxSense = Math.min(dataObj.globalSettings.xmax, compositeData.xmax - smoothShift + bpShift),
                truncatedXminAnti = Math.max(dataObj.globalSettings.xmin, compositeData.xmin + smoothShift - bpShift),
                truncatedXmaxAnti = Math.min(dataObj.globalSettings.xmax, compositeData.xmax - smoothShift - bpShift),
                truncatedSense = smoothedSense.slice(truncatedXminSense - compositeData.xmin, truncatedXmaxSense - compositeData.xmax)
                    .map((d, i) => ({x: truncatedXminSense + i, y: d * scale + compositeData.shiftOccupancy})),
                truncatedAnti = smoothedAnti.slice(truncatedXminAnti - compositeData.xmin, truncatedXmaxAnti - compositeData.xmax)
                    .map((d, i) => ({x: truncatedXminAnti + i, y: d * scale + compositeData.shiftOccupancy}));
            truncatedSense.unshift({x: truncatedXminSense, y: 0});
            truncatedSense.push({x: truncatedXmaxSense, y: 0});
            truncatedAnti.unshift({x: truncatedXminAnti, y: 0});
            truncatedAnti.push({x: truncatedXmaxAnti, y: 0});
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
                .style("display", compositeData.hideSense ? "none" : null)
                .datum(compositeData.swap ? truncatedAnti : truncatedSense)
                .attr("d", topLine);
            compositeElem.select(".composite-line.top")
                .attr("stroke", dataObj.globalSettings.colorTrace ? primaryColor : "#000000")
                .style("display", compositeData.hideSense ? "none" : null)
                .datum(compositeData.swap ? truncatedAnti.slice(1, -1) : truncatedSense.slice(1, -1))
                .attr("d", topLine);
            const bottomLine = d3.line()
                .x(d => this.xscale(d.x))
                .y(d => this.yscale(-d.y));
            compositeElem.select(".composite-path.bottom")
                .attr("stroke", dataObj.globalSettings.colorTrace ? null : "#FFFFFF")
                .style("display", compositeData.hideAnti ? "none" : null)
                .datum(compositeData.swap ? truncatedSense : truncatedAnti)
                .attr("d", bottomLine);
            compositeElem.select(".composite-line.bottom")
                .attr("stroke", dataObj.globalSettings.colorTrace ? secondaryColor : "#000000")
                .style("display", compositeData.hideAnti ? "none" : null)
                .datum(compositeData.swap ? truncatedSense.slice(1, -1) : truncatedAnti.slice(1, -1))
                .attr("d", bottomLine)
        }
    }

    slidingWindow(vec, window) {
        let val = vec.slice(0, window).reduce((a, c) => a + c, 0) / window,
            newVec = [val];
        for (let i = 0; i < vec.length - window - 1; i++) {
            val += (vec[i + window] - vec[i]) / window;
            newVec.push(val);
        };
        return newVec
    }

    getYlimits() {
        if (dataObj.globalSettings.combined) {
            return {
                ymax: this.roundUpWithPrecision(dataObj.globalSettings.ymax - dataObj.globalSettings.ymin),
                ymin: 0
            }
        } else if (dataObj.globalSettings.symmetricY) {
            return {
                ymax: this.roundUpWithPrecision(Math.max(dataObj.globalSettings.ymax, -dataObj.globalSettings.ymin)),
                ymin: this.roundUpWithPrecision(Math.min(-dataObj.globalSettings.ymax, dataObj.globalSettings.ymin))
            }
        } else {
            return {
                ymax: this.roundUpWithPrecision(dataObj.globalSettings.ymax),
                ymin: this.roundUpWithPrecision(dataObj.globalSettings.ymin)
            }
        }
    }

    roundUpWithPrecision(value, precision=2) {
        // Round the absolute value of a number up to the nearest value with a given precision
        const absValue = Math.abs(value),
            sign = Math.sign(value);
        if (absValue === 0) {
            return 0
        };
        const factor = Math.pow(10, Math.floor(Math.log10(absValue)) - precision + 1);
        return Math.ceil(absValue / factor) * factor * sign
    }
};

let plotObj = new plotObject("main-plot", 460, 300, {top: 30, right: 150, bottom: 35, left: 60})
