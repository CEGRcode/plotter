const opacityInput = class {
    constructor(elementID) {
        if (document.getElementById(elementID) === null) {
            throw "Element ID " + elementID + " not found"
        };

        const self = this;
        this.element = d3.select("#" + elementID);
        this.label = this.element.append("label")
            .attr("for", "opacity-slider")
            .attr("id", "opacity-slider-label")
            .classed("setting-label", true)
            .text("Opacity:");
        this.minTextInput = this.element.append("input")
            .attr("type", "text")
            .attr("id", "opacity-text")
            .classed("setting-text", true)
            .on("change", function() {
                dataObj.globalSettings.minOpacity = parseFloat(this.value);
                if (self.slider1.attr("value") < self.slider2.attr("value")) {
                    self.slider1.node().value = dataObj.globalSettings.minOpacity * 100
                } else {
                    self.slider2.node().value = dataObj.globalSettings.minOpacity * 100
                }
                plotObj.updatePlot()
            });
        this.maxTextInput = this.element.append("input")
            .attr("type", "text")
            .attr("id", "opacity-text")
            .classed("setting-text", true)
            .on("change", function() {
                dataObj.globalSettings.maxOpacity = parseFloat(this.value);
                if (self.slider1.attr("value") > self.slider2.attr("value")) {
                    self.slider1.node().value = dataObj.globalSettings.maxOpacity * 100
                } else {
                    self.slider2.node().value = dataObj.globalSettings.maxOpacity * 100
                }
                plotObj.updatePlot()
            });
        this.slider1 = this.element.append("input")
            .attr("type", "range")
            .attr("id", "opacity-slider-1")
            .attr("min", 0)
            .attr("max", 100)
            .on("input", function() {
                if (self.slider1.attr("value") > self.slider2.attr("value")) {
                    dataObj.globalSettings.minOpacity = self.slider2.attr("value") / 100;
                    dataObj.globalSettings.maxOpacity = self.slider1.attr("value") / 100
                } else {
                    dataObj.globalSettings.minOpacity = self.slider1.attr("value") / 100;
                    dataObj.globalSettings.maxOpacity = self.slider2.attr("value") / 100
                }
                self.minTextInput.node().value = dataObj.globalSettings.minOpacity;
                self.maxTextInput.node().value = dataObj.globalSettings.maxOpacity;
                plotObj.updatePlot()
            });
        this.slider2 = this.element.append("input")
            .attr("type", "range")
            .attr("id", "opacity-slider-2")
            .attr("min", 0)
            .attr("max", 100)
            .on("input", function() {
                if (self.slider1.attr("value") > self.slider2.attr("value")) {
                    dataObj.globalSettings.minOpacity = self.slider2.attr("value") / 100;
                    dataObj.globalSettings.maxOpacity = self.slider1.attr("value") / 100
                } else {
                    dataObj.globalSettings.minOpacity = self.slider1.attr("value") / 100;
                    dataObj.globalSettings.maxOpacity = self.slider2.attr("value") / 100
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