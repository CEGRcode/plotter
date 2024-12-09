const dataObject = class {
    constructor({globalSettings, fileData, compositeData, referenceLines, nucleosomeSlider}) {
        this.globalSettings = globalSettings;
        this.fileData = fileData;
        this.compositeData = compositeData;
        this.referenceLines = referenceLines;
        this.nucleosomeSlider = nucleosomeSlider
    }

    changeXmin(xmin) {
        this.globalSettings.xmin = xmin
    }

    changeXmax(xmax) {
        this.globalSettings.xmax = xmax
    }

    changeYmin(ymin) {
        this.globalSettings.ymin = ymin
    }

    changeYmax(ymax) {
        this.globalSettings.ymax = ymax
    }

    changeSymmetricY(symmetricY) {
        this.globalSettings.symmetricY = symmetricY
    }

    changeLockAxes(lockAxes) {
        this.globalSettings.lockAxes = lockAxes
    }

    changeMinOpacity(minOpacity) {
        this.globalSettings.minOpacity = minOpacity
    }

    changeMaxOpacity(maxOpacity) {
        this.globalSettings.maxOpacity = maxOpacity
    }

    changeSmoothing(smoothing) {
        this.globalSettings.smoothing = smoothing
    }

    changeBpShift(bpShift) {
        this.globalSettings.bpShift = bpShift
    }

    changeCombined(combined) {
        this.globalSettings.combined = combined
    }

    changeSeparateColors(separateColors) {
        this.globalSettings.separateColors = separateColors
    }

    changeColorTrace(colorTrace) {
        this.globalSettings.colorTrace = colorTrace
    }

    changeEnableTooltip(enableTooltip) {
        this.globalSettings.enableTooltip = enableTooltip
    }

    changeShowLegend(showLegend) {
        this.globalSettings.showLegend = showLegend
    }

    changeLabel(field, value) {
        this.globalSettings.labels[field] = value
    }

    addCompositeData({idx, name=null, xmin=Infinity, xmax=-Infinity, sense=null, anti=null, primaryColor=null,
        secondaryColor=null, scale=1, minOpacity=null, maxOpacity=null, smoothing=null, bpShift=null, shiftOccupancy=0,
        hideSense=false, hideAnti=false, swap=false, ids=null}) {
        const compositeDataObj = new compositeObject({idx, name: name, xmin: xmin, xmax: xmax, sense: sense, anti: anti,
            primaryColor: primaryColor, secondaryColor: secondaryColor, scale: scale, minOpacity: minOpacity,
            maxOpacity: maxOpacity, smoothing: smoothing, bpShift: bpShift, shiftOccupancy: shiftOccupancy,
            hideSense: hideSense, hideAnti: hideAnti, swap: swap, ids: ids});
        this.compositeData.push(compositeDataObj);

        return compositeDataObj
    }

    updateCompositeData(compositeData) {
        this.compositeData = compositeData
    }

    updateGlobalSettings(globalSettings) {
        Object.assign(this.globalSettings, globalSettings)
    }

    autoscaleAxisLimits() {
        if (this.globalSettings.lockAxes) {
            return
        };

        const self = this;
        return new Promise(function(resolve) {
            const xmin = self.compositeData.reduce((a, c) => Math.min(a, c.xmin), Infinity),
            xmax = self.compositeData.reduce((a, c) => Math.max(a, c.xmax), -Infinity),
            ymin = self.globalSettings.combined ? 0 :
                -self.compositeData.reduce((a, c) => Math.max(a, Math.max(...c.anti)), -Infinity),
            ymax = self.globalSettings.combined ? self.compositeData.reduce((a, c) => Math.max(a, Math.max(...c.sense.map((d, i) => d + c.anti[i]))), -Infinity) :
                self.compositeData.reduce((a, c) => Math.max(a, Math.max(...c.sense)), -Infinity);

            self.changeXmin(xmin);
            self.changeXmax(xmax);
            self.changeYmin(ymin);
            self.changeYmax(ymax);

            resolve()
        })
    }
    
    async importDataFromJSON(file) {
        const self = this;
        return new Promise(async function(resolve_, reject_) {
            const data = await new Promise(function(resolve, reject) {
                const reader = new FileReader();
                reader.onload = function() {
                    try {
                        resolve(JSON.parse(reader.result))
                    } catch (e) {
                        alert("Invalid JSON file");
                        reject()
                    }
                };
                reader.onerror = function() {
                    reject()
                };
                reader.readAsText(file)
            });
            if (data.globalSettings && data.compositeData) {
                self.globalSettings = data.globalSettings;
                self.fileData = data.fileData;
                self.compositeData = [];
                for (const compositeDataProps of data.compositeData) {
                    self.compositeData.push(new compositeObject(compositeDataProps))
                };

                self.referenceLines = data.referenceLines || [];
                self.nucleosomeSlider = data.nucleosomeSlider || {};
                resolve_()
            } else {
                alert("JSON file does not contain the required data");
                reject_()
            }
        })
    }

    exportDataAsJSON() {
        const a = document.createElement("a"),
            e = new MouseEvent("click");
        a.download = "composite_plot_config.json";
        a.href = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(
            {
                globalSettings: this.globalSettings,
                fileData: this.fileData,
                compositeData: this.compositeData,
                referenceLines: this.referenceLines,
                nucleosomeSlider: this.nucleosomeSlider
            },
            null, 4
        ));
        a.dispatchEvent(e)
    }
}

let dataObj = new dataObject({
    globalSettings: {
        xmin: -500,
        xmax: 500,
        ymin: -1,
        ymax: 1,
        symmetricY: true,
        lockAxes: false,
        minOpacity: 0,
        maxOpacity: 1,
        smoothing: 7,
        bpShift: 0,
        combined: false,
        separateColors: false,
        colorTrace: false,
        enableTooltip: true,
        showLegend: true,
        labels: {
            title: "Composite plot",
            xlabel: "Position (bp)",
            ylabel: "Occupancy (AU)"
        }
    },
    fileData: {},
    compositeData: [],
    referenceLines: [],
    nucleosomeSlider: {}
})