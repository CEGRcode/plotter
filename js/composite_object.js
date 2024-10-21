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
        this.swap = false;
    }
}