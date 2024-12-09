const opacityInput = class {
    constructor(elementID) {
        if (document.getElementById(elementID) === null) {
            throw "Element ID " + elementID + " not found"
        };

        const self = this;
        this.element = d3.select("#" + elementID);
        this.label = this.element.append("label")
            .attr("id", "opacity-input-label")
            .classed("setting-label", true)
            .text("Opacity:");
        this.minTextInput = this.element.append("input")
            .attr("type", "text")
            .attr("id", "min-opacity-text")
            .classed("setting-text", true)
            .on("change", function() {
                dataObj.globalSettings.minOpacity = parseFloat(this.value);
                if (self.slider1.node().value < self.slider2.node().value) {
                    self.slider1.node().value = dataObj.globalSettings.minOpacity * 100
                } else {
                    self.slider2.node().value = dataObj.globalSettings.minOpacity * 100
                }
                plotObj.updatePlot()
            });
        this.element.append("span")
            .text(" - ");
        this.maxTextInput = this.element.append("input")
            .attr("type", "text")
            .attr("id", "max-opacity-text")
            .classed("setting-text", true)
            .on("change", function() {
                dataObj.globalSettings.maxOpacity = parseFloat(this.value);
                if (self.slider1.node().value > self.slider2.node().value) {
                    self.slider1.node().value = dataObj.globalSettings.maxOpacity * 100
                } else {
                    self.slider2.node().value = dataObj.globalSettings.maxOpacity * 100
                }
                plotObj.updatePlot()
            });
        this.slider1 = this.element.append("input")
            .attr("type", "range")
            .attr("id", "opacity-slider-1")
            .classed("global-slider", true)
            .classed("double-slider", true)
            .attr("min", 0)
            .attr("max", 100)
            .on("input", function() {
                const value1 = parseInt(self.slider1.node().value),
                    value2 = parseInt(self.slider2.node().value);
                if (value1 > value2) {
                    dataObj.globalSettings.minOpacity = value2 / 100;
                    dataObj.globalSettings.maxOpacity = value1 / 100
                } else {
                    dataObj.globalSettings.minOpacity = value1 / 100;
                    dataObj.globalSettings.maxOpacity = value2 / 100
                }
                self.minTextInput.node().value = dataObj.globalSettings.minOpacity;
                self.maxTextInput.node().value = dataObj.globalSettings.maxOpacity;
                plotObj.updatePlot()
            });
        this.slider2 = this.element.append("input")
            .attr("type", "range")
            .attr("id", "opacity-slider-2")
            .classed("global-slider", true)
            .classed("double-slider", true)
            .attr("min", 0)
            .attr("max", 100)
            .on("input", function() {
                const value1 = parseInt(self.slider1.node().value),
                    value2 = parseInt(self.slider2.node().value);
                if (value1 > value2) {
                    dataObj.globalSettings.minOpacity = value2 / 100;
                    dataObj.globalSettings.maxOpacity = value1 / 100
                } else {
                    dataObj.globalSettings.minOpacity = value1 / 100;
                    dataObj.globalSettings.maxOpacity = value2 / 100
                }
                self.minTextInput.node().value = dataObj.globalSettings.minOpacity;
                self.maxTextInput.node().value = dataObj.globalSettings.maxOpacity;
                plotObj.updatePlot()
            });
        
        this.update()
    }

    update() {
        this.minTextInput.node().value = dataObj.globalSettings.minOpacity;
        this.maxTextInput.node().value = dataObj.globalSettings.maxOpacity;
        this.slider1.node().value = dataObj.globalSettings.minOpacity * 100;
        this.slider2.node().value = dataObj.globalSettings.maxOpacity * 100
    }
};

const opacityInputObj = new opacityInput("opacity-input")