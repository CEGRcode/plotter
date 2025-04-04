const dataObject = class {
    constructor({globalSettings, fileData, compositeData, referenceLines, nucleosomeSlider}) {
        this.globalSettings = globalSettings;
        this.fileData = fileData;
        this.compositeData = compositeData;
        this.legendOrder = [...compositeData.keys()];
        this.referenceLines = referenceLines;
        this.nucleosomeSlider = nucleosomeSlider
    }

    changeXmin(xmin) {
        if (isFinite(xmin)) {
            this.globalSettings.xmin = xmin
        }
    }

    changeXmax(xmax) {
        if (isFinite(xmax)) {
            this.globalSettings.xmax = xmax
        }
    }

    changeYmin(ymin) {
        if (isFinite(ymin)) {
            this.globalSettings.ymin = ymin
        }
    }

    changeYmax(ymax) {
        if (isFinite(ymax)) {
            this.globalSettings.ymax = ymax
        }
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
        hideSense=false, hideAnti=false, swap=false, sticky=false, ids=null}) {
        const compositeDataObj = new compositeObject({idx, name: name, xmin: xmin, xmax: xmax, sense: sense, anti: anti,
            primaryColor: primaryColor, secondaryColor: secondaryColor, scale: scale, minOpacity: minOpacity,
            maxOpacity: maxOpacity, smoothing: smoothing, bpShift: bpShift, shiftOccupancy: shiftOccupancy,
            hideSense: hideSense, hideAnti: hideAnti, swap: swap, sticky: sticky, ids: ids});
        this.compositeData.push(compositeDataObj);
        this.legendOrder.push(idx);

        return compositeDataObj
    }

    moveCompositeData(oldIdx, newIdx) {
        const compositeDataObj = this.compositeData[oldIdx];
        this.compositeData.splice(oldIdx, 1);
        this.compositeData.splice(newIdx, 0, compositeDataObj);

        for (const i in this.legendOrder) {
            if (this.legendOrder[i] == oldIdx) {
                this.legendOrder[i] = newIdx
            } else if (this.legendOrder[i] > oldIdx && this.legendOrder[i] <= newIdx) {
                this.legendOrder[i]--
            } else if (this.legendOrder[i] < oldIdx && this.legendOrder[i] >= newIdx) {
                this.legendOrder[i]++
            }
        }
    }

    removeCompositeData(idx) {
        this.compositeData.splice(idx, 1);

        for (const i in this.legendOrder) {
            if (this.legendOrder[i] == idx) {
                this.legendOrder.splice(i, 1)
            };
            if (this.legendOrder[i] > idx) {
                this.legendOrder[i]--
            }
        }
    }

    updateAllComposites() {
        for (const compositeDataObj of this.compositeData) {
            if (compositeDataObj.filesLoaded > 0) {
                compositeDataObj.updateData()
            }
        }
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
            let xmin = Infinity,
                xmax = -Infinity,
                ymin = Infinity,
                ymax = -Infinity;
            for (const compositeDataObj of self.compositeData) {
                if (compositeDataObj.hideSense && compositeDataObj.hideAnti) {
                    continue
                };
                const smoothing = compositeDataObj.smoothing === null ?
                        self.globalSettings.smoothing : compositeDataObj.smoothing,
                    bpShift = Math.abs(compositeDataObj.bpShift === null ?
                        self.globalSettings.bpShift : compositeDataObj.bpShift);
                xmin = Math.min(xmin, compositeDataObj.xmin - bpShift);
                xmax = Math.max(xmax, compositeDataObj.xmax + bpShift);
                if (!compositeDataObj.hideSense) {
                    ymax = Math.max(ymax, Math.max(...plotObj.slidingWindow(compositeDataObj.sense, smoothing)) *
                        compositeDataObj.scale)
                };
                if (!compositeDataObj.hideAnti) {
                    ymin = Math.min(ymin, -Math.max(...plotObj.slidingWindow(compositeDataObj.anti, smoothing)) *
                        compositeDataObj.scale)
                }
            };

            self.changeXmin(xmin);
            self.changeXmax(xmax);
            self.changeYmin(ymin);
            self.changeYmax(ymax);

            resolve()
        })
    }

    addHorizontalReferenceLine(y, color, linestyle, fontSize, fontColor, textOrientation, labelOffset) {
        const referenceLineObj = {
            y: y,
            color: color,
            linestyle: linestyle,
            fontSize: fontSize,
            fontColor: fontColor,
            textOrientation: textOrientation,
            labelOffset: labelOffset
        };
        this.referenceLines.horizontalLines.push(referenceLineObj);

        return referenceLineObj
    }

    removeHorizontalReferenceLine(idx) {
        this.referenceLines.horizontalLines.splice(idx, 1)
    }

    addVerticalReferenceLine(x, color, linestyle, fontSize, fontColor, textOrientation, labelOffset) {
        const referenceLineObj = {
            x: x,
            color: color,
            linestyle: linestyle,
            fontSize: fontSize,
            fontColor: fontColor,
            textOrientation: textOrientation,
            labelOffset: labelOffset
        };
        this.referenceLines.verticalLines.push(referenceLineObj);

        return referenceLineObj
    }

    removeVerticalReferenceLine(idx) {
        this.referenceLines.verticalLines.splice(idx, 1)
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
                for (const idx in data.compositeData) {
                    const compositeObj = new compositeObject({idx: idx, ...data.compositeData[idx]});
                    compositeObj.updateData();
                    self.compositeData.push(compositeObj)
                };

                if (data.legendOrder) {
                    self.legendOrder = data.legendOrder
                } else {
                    self.legendOrder = [...self.compositeData.keys()]
                };

                if (data.referenceLines) {
                    self.referenceLines = data.referenceLines
                } else {
                    self.referenceLines = {
                        horizontalLines: [],
                        verticalLines: []
                    }
                };

                if (data.nucleosomeSlider) {
                    self.nucleosomeSlider = data.nucleosomeSlider
                } else {
                    self.nucleosomeSlider = {
                        x: 0,
                        lines: []
                    }
                };

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
                legendOrder: this.legendOrder,
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
    referenceLines: {
        horizontalLines: [],
        verticalLines: []
    },
    nucleosomeSlider: {
        x: 0,
        lines: []
    }
})