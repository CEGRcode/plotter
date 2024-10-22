const compositeObject = class {
    constructor(idx, color) {
        this.name = "Composite " + idx;
        this.color = color;
        this.scale = 1;
        this.minOpacity = null;
        this.maxOpacity = null;
        this.smoothing = null;
        this.bpShift = null;
        this.shiftOccupancy = 0;
        this.hideSense = false;
        this.hideAnti = false;
        this.swap = false
    }

    changeName(name) {
        this.name = name;
        plotObj.updatePlot()
    }

    changeColor(color) {
        this.color = color;
        plotObj.updatePlot()
    }

    changeScale(scale) {
        this.scale = scale;
        plotObj.updatePlot()
    }

    changeOpacity(minOpacity, maxOpacity) {
        this.minOpacity = minOpacity;
        this.maxOpacity = maxOpacity;
        plotObj.updatePlot()
    }

    changeSmoothing(smoothing) {
        this.smoothing = smoothing;
        plotObj.updatePlot()
    }

    changeBpShift(bpShift) {
        this.bpShift = bpShift;
        plotObj.updatePlot()
    }

    changeShiftOccupancy(shiftOccupancy) {
        this.shiftOccupancy = shiftOccupancy;
        plotObj.updatePlot()
    }

    changeHide(hideSense, hideAnti) {
        this.hideSense = hideSense;
        this.hideAnti = hideAnti;
        plotObj.updatePlot()
    }

    changeSwap(swap) {
        this.swap = swap;
        plotObj.updatePlot()
    }

    changeBulkSettings(name, color, scale, minOpacity, maxOpacity, smoothing, bpShift, shiftOccupancy, hideSense, hideAnti, swap) {
        this.name = name;
        this.color = color;
        this.scale = scale;
        this.minOpacity = minOpacity;
        this.maxOpacity = maxOpacity;
        this.smoothing = smoothing;
        this.bpShift = bpShift;
        this.shiftOccupancy = shiftOccupancy;
        this.hideSense = hideSense;
        this.hideAnti = hideAnti;
        this.swap = swap;
        plotObj.updatePlot()
    }
}