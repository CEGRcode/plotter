const xAxisInput = class {
    constructor(elementID) {
        if (document.getElementById(elementID) === null) {
            throw "Element ID " + elementID + " not found"
        };
        this.element = d3.select("#" + elementID);
        this.label = this.element.append("label")
            .attr("for", "x-axis-min")
            .attr("id", "x-axis-min-label")
            .text("x-axis limits:");
        this.xMinInput = this.element.append("input")
            .attr("type", "text")
            .attr("id", "x-axis-min")
            .classed("axis-limit-input", true)
            .on("change", function() {
                dataObj.globalSettings.xmin = parseInt(this.value);
                plotObj.updatePlot();
                referenceLinesObj.updateReferenceLines();
                nucleosomeSliderObj.updateNucleosomeSlider()
            });
        this.xMaxInput = this.element.append("input")
            .attr("type", "text")
            .attr("id", "x-axis-max")
            .classed("axis-limit-input", true)
            .on("change", function() {
                dataObj.globalSettings.xmax = parseInt(this.value);
                plotObj.updatePlot();
                referenceLinesObj.updateReferenceLines();
                nucleosomeSliderObj.updateNucleosomeSlider()
            });

        this.update()
    }

    update() {
        this.xMinInput.node().value = dataObj.globalSettings.xmin;
        this.xMaxInput.node().value = dataObj.globalSettings.xmax
    }

    lockInputs() {
        this.xMinInput.attr("disabled", true);
        this.xMaxInput.attr("disabled", true)
    }

    unlockInputs() {
        this.xMinInput.attr("disabled", null);
        this.xMaxInput.attr("disabled", null)
    }
};

const xAxisInputObj = new xAxisInput("x-axis-input")