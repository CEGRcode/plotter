const dataObject = class {
    constructor(globalSettings, defaultColors, compositeData, referenceLines, nucleosomeSlider) {
        this.globalSettings = globalSettings;
        this.defaultColors = defaultColors;
        this.compositeData = compositeData;
        this.referenceLines = referenceLines;
        this.nucleosomeSlider = nucleosomeSlider
    }

    changeXmin(xmin) {
        this.globalSettings.xmin = xmin;
        plotObj.updatePlot()
    }

    changeXmax(xmax) {
        this.globalSettings.xmax = xmax;
        plotObj.updatePlot()
    }

    changeYmin(ymin) {
        this.globalSettings.ymin = ymin;
        plotObj.updatePlot()
    }

    changeYmax(ymax) {
        this.globalSettings.ymax = ymax;
        plotObj.updatePlot()
    }

    changeSymmetricY(symmetricY) {
        this.globalSettings.symmetricY = symmetricY;
        plotObj.updatePlot()
    }

    changeLockAxes(lockAxes) {
        this.globalSettings.lockAxes = lockAxes
    }

    changeOpacity(minOpacity, maxOpacity) {
        this.globalSettings.minOpacity = minOpacity;
        this.globalSettings.maxOpacity = maxOpacity;
        plotObj.updatePlot()
    }

    changeSmoothing(smoothing) {
        this.globalSettings.smoothing = smoothing;
        plotObj.updatePlot()
    }

    changeBpShift(bpShift) {
        this.globalSettings.bpShift = bpShift;
        plotObj.updatePlot()
    }

    changeCombined(combined) {
        this.globalSettings.combined = combined;
        plotObj.updatePlot()
    }

    changeSeparateColors(separateColors) {
        this.globalSettings.separateColors = separateColors;
        plotObj.updatePlot()
    }

    changeColorTrace(colorTrace) {
        this.globalSettings.colorTrace = colorTrace;
        plotObj.updatePlot()
    }

    changeEnableTooltip(enableTooltip) {
        this.globalSettings.enableTooltip = enableTooltip
    }

    changeShowLegend(showLegend) {
        this.globalSettings.showLegend = showLegend
    }

    changeLabel(field, value) {
        this.globalSettings.labels[field] = value;
        plotObj.updatePlot()
    }
    
    async importDataFromJSON(file) {
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
            this.globalSettings = data.globalSettings;
            this.defaultColors = data.defaultColors || [];
            this.compositeData = data.compositeData;
            this.referenceLines = data.referenceLines || [];
            this.nucleosomeSlider = data.nucleosomeSlider || {};
            plotObj.updatePlot()
        } else {
            alert("JSON file does not contain the required data")
            throw new Error("Invalid JSON file")
        }
    }

    exportDataAsJSON() {
        const a = document.createElement("a"),
            e = new MouseEvent("click");
        a.download = "composite_plot_config.json";
        a.href = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(
            {
                globalSettings: this.globalSettings,
                defaultColors: this.defaultColors,
                compositeData: this.compositeData,
                referenceLines: this.referenceLines,
                nucleosomeSlider: this.nucleosomeSlider
            },
            null, 4
        ));
        a.dispatchEvent(e)
    }
}

let dataObj = new dataObject(
    {
        xmin: -500,
        xmax: 500,
        ymin: -1,
        ymax: 1,
        symmetricY: false,
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
    [
        "#BFBFBF",
        "#000000",
        "#FF0000",
        "#FF9100",
        "#D7D700",
        "#07E200",
        "#00B0F0",
        "#0007FF",
        "#A700FF",
        "#FF00D0"
    ],
    [], [], {}
)