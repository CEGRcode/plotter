const opacityInput = class {
    constructor(elementID) {
        if (document.getElementById(elementID) === null) {
            throw "Element ID " + elementID + " not found"
        };

        const self = this;
        this.element = d3.select("#" + elementID);
        this.label = this.element.append("td").append("label")
            .attr("id", "opacity-input-label")
            .classed("setting-label", true)
            .text("Opacity:");
        this.textInputCol = this.element.append("td");
        this.minTextInput = this.textInputCol.append("input")
            .attr("type", "text")
            .attr("id", "min-opacity-text")
            .classed("setting-text", true)
            .on("change", function() {
                dataObj.globalSettings.minOpacity = parseFloat(this.value);
                self.slider1.node().value = dataObj.globalSettings.minOpacity * 100;
                self.slider2.node().value = dataObj.globalSettings.maxOpacity * 100;
                plotObj.updatePlot()
            });
        this.textInputCol.append("span")
            .text(" - ");
        this.maxTextInput = this.textInputCol.append("input")
            .attr("type", "text")
            .attr("id", "max-opacity-text")
            .classed("setting-text", true)
            .on("change", function() {
                dataObj.globalSettings.maxOpacity = parseFloat(this.value);
                self.slider1.node().value = dataObj.globalSettings.minOpacity * 100;
                self.slider2.node().value = dataObj.globalSettings.maxOpacity * 100;
                plotObj.updatePlot()
            });
        this.sliderInputCol = this.element.append("td").classed("slider-container", true);
        this.slider1 = this.sliderInputCol.append("input")
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
        this.slider2 = this.sliderInputCol.append("input")
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