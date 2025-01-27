const compositeObject = class {
    constructor({idx, name=null, xmin=Infinity, xmax=-Infinity, sense=null, anti=null, primaryColor=null, secondaryColor=null,
        scale=1, minOpacity=null, maxOpacity=null, smoothing=null, bpShift=null, shiftOccupancy=0, hideSense=false,
        hideAnti=false, swap=false, ids=null}) {
        this.name = name || "Composite " + idx;
        this.xmin = xmin;
        this.xmax = xmax;
        this.sense = sense || [];
        this.anti = anti || [];
        this.primaryColor = primaryColor || defaultColors[idx % defaultColors.length];
        this.secondaryColor = secondaryColor;
        this.scale = scale;
        this.minOpacity = minOpacity;
        this.maxOpacity = maxOpacity;
        this.smoothing = smoothing;
        this.bpShift = bpShift;
        this.shiftOccupancy = shiftOccupancy;
        this.hideSense = hideSense;
        this.hideAnti = hideAnti;
        this.swap = swap;
        this.ids = ids || [];
        this.filesLoaded = this.ids.length
    }

    changeName(name) {
        this.name = name
    }

    changePrimaryColor(primaryColor) {
        this.primaryColor = primaryColor
    }

    changeSecondaryColor(secondaryColor) {
        this.secondaryColor = secondaryColor
    }

    changeScale(scale) {
        this.scale = scale
    }

    changeMinOpacity(minOpacity) {
        this.minOpacity = minOpacity
    }

    changeMaxOpacity(maxOpacity) {
        this.maxOpacity = maxOpacity
    }

    changeSmoothing(smoothing) {
        this.smoothing = smoothing
    }

    changeBpShift(bpShift) {
        this.bpShift = bpShift
    }

    changeShiftOccupancy(shiftOccupancy) {
        this.shiftOccupancy = shiftOccupancy
    }

    changeHideSense(hideSense) {
        this.hideSense = hideSense
    }

    changeHideAnti(hideAnti) {
        this.hideAnti = hideAnti
    }

    changeSwap(swap) {
        this.swap = swap
    }

    changeBulkSettings(settings) {
        Object.assign(this, settings)
    }

    changeXmin(xmin) {
        this.xmin = xmin
    }

    changeXmax(xmax) {
        this.xmax = xmax
    }

    changeSense(sense) {
        this.sense = sense
    }

    changeAnti(anti) {
        this.anti = anti
    }

    async loadFiles(file_list) {
        const self = this;
        return new Promise(async function(resolve) {
            for (const file of file_list) {
                self.ids.push(file.name);
                self.filesLoaded++
            };
    
            if ((await Promise.all(compositeLoaderObj.loadFiles(file_list))).some(overwrite => overwrite)) {
                dataObj.updateAllComposites()
            } else {
                self.updateData()
            };

            resolve()
        })
    }

    updateData() {
        // Get the minimum and maximum x values of the selected files and initialize the sense and anti arrays
        const xmin = Math.min(...this.ids.map(id => dataObj.fileData[id].xmin)),
            xmax = Math.max(...this.ids.map(id => dataObj.fileData[id].xmax)),
            sense = Array(xmax - xmin + 1).fill(0),
            anti = Array(xmax - xmin + 1).fill(0);
        
        // Add the sense and anti values of the selected files to the sense and anti arrays
        for (let x = xmin; x <= xmax; x++) {
            for (let id of this.ids) {
                const file_xmin = dataObj.fileData[id].xmin;
                sense[x - xmin] += dataObj.fileData[id].sense[x - file_xmin] || 0;
                anti[x - xmin] += dataObj.fileData[id].anti[x - file_xmin] || 0
            }
        };

        // Update the composite object
        this.changeXmin(xmin);
        this.changeXmax(xmax);
        this.changeSense(sense);
        this.changeAnti(anti);
        this.filesLoaded = this.ids.length
    }

    clearData() {
        this.ids = [];
        this.filesLoaded = 0;
        
        this.changeXmin(Infinity);
        this.changeXmax(-Infinity);
        this.changeSense([]);
        this.changeAnti([])
    }
}