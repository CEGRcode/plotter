const bpShiftInput = class {
    constructor(elementID) {
        if (document.getElementById(elementID) === null) {
            throw "Element ID " + elementID + " not found"
        };

        const self = this;
        this.element = d3.select("#" + elementID);
        this.label = this.element.append("label")
            .attr("id", "bp-shift-input-label")
            .classed("setting-label", true)
            .text("BP shift:");
        this.textInput = this.element.append("input")
            .attr("type", "text")
            .attr("id", "bp-shift-text")
            .classed("setting-text", true)
            .on("change", function() {
                dataObj.globalSettings.bpShift = parseInt(this.value);
                self.sliderInput.node().value = dataObj.globalSettings.bpShift;
                plotObj.updatePlot()
            });
        this.sliderInput = this.element.append("input")
            .attr("type", "range")
            .attr("id", "bp-shift-slider")
            .classed("global-slider", true)
            .attr("min", -50)
            .attr("max", 50)
            .on("input", function() {
                dataObj.globalSettings.bpShift = parseInt(this.value);
                self.textInput.node().value = dataObj.globalSettings.bpShift;
                plotObj.updatePlot()
            });
        
        this.update()
    }

    update() {
        this.textInput.node().value = dataObj.globalSettings.bpShift;
        this.sliderInput.node().value = dataObj.globalSettings.bpShift
    }
};

const bpShiftInputObj = new bpShiftInput("bp-shift-input")