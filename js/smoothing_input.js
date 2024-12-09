const smoothingInput = class {
    constructor(elementID) {
        if (document.getElementById(elementID) === null) {
            throw "Element ID " + elementID + " not found"
        };

        const self = this;
        this.element = d3.select("#" + elementID);
        this.label = this.element.append("label")
            .attr("for", "smoothing-slider")
            .attr("id", "smoothing-slider-label")
            .classed("setting-label", true)
            .text("Smoothing:");
        this.textInput = this.element.append("input")
            .attr("type", "text")
            .attr("id", "smoothing-text")
            .classed("setting-text", true)
            .on("change", function() {
                dataObj.globalSettings.smoothing = parseInt(this.value);
                self.sliderInput.node().value = dataObj.globalSettings.smoothing;
                plotObj.updatePlot()
            });
        this.sliderInput = this.element.append("input")
            .attr("type", "range")
            .attr("id", "smoothing-slider")
            .classed("global-slider", true)
            .attr("min", 1)
            .attr("max", 31)
            .attr("step", 2)
            .on("input", function() {
                dataObj.globalSettings.smoothing = parseInt(this.value);
                self.textInput.node().value = dataObj.globalSettings.smoothing;
                plotObj.updatePlot()
            });
        
        this.update()
    }

    update() {
        this.textInput.node().value = dataObj.globalSettings.smoothing;
        this.sliderInput.node().value = dataObj.globalSettings.smoothing
    }
};

const smoothingInputObj = new smoothingInput("smoothing-input")