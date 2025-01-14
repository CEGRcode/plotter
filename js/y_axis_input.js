const yAxisInput = class {
    constructor(elementID) {
        if (document.getElementById(elementID) === null) {
            throw "Element ID " + elementID + " not found"
        };
        this.element = d3.select("#" + elementID);
        this.label = this.element.append("label")
            .attr("for", "y-axis-min")
            .attr("id", "y-axis-min-label")
            .text("y-axis limits:");
        this.yMinInput = this.element.append("input")
            .attr("type", "text")
            .attr("id", "y-axis-min")
            .classed("axis-limit-input", true)
            .on("change", function() {
                dataObj.globalSettings.ymin = parseFloat(this.value);
                if (dataObj.globalSettings.symmetricY) {
                    dataObj.globalSettings.ymax = -dataObj.globalSettings.ymin;
                    yAxisInputObj.update()
                };
                plotObj.updatePlot();
                referenceLinesObj.updateReferenceLines();
                nucleosomeSliderObj.updateNucleosomeSlider()
            });
        this.yMaxInput = this.element.append("input")
            .attr("type", "text")
            .attr("id", "y-axis-max")
            .classed("axis-limit-input", true)
            .on("change", function() {
                if (dataObj.globalSettings.combined) {
                    const yTotal = parseFloat(this.value);
                    dataObj.globalSettings.ymax = yTotal / 2;
                    dataObj.globalSettings.ymin = -yTotal / 2
                } else {
                    dataObj.globalSettings.ymax = parseFloat(this.value);
                    if (dataObj.globalSettings.symmetricY) {
                        dataObj.globalSettings.ymin = -dataObj.globalSettings.ymax
                    }
                };
                yAxisInputObj.update();
                plotObj.updatePlot();
                referenceLinesObj.updateReferenceLines();
                nucleosomeSliderObj.updateNucleosomeSlider()
            });
        
        this.symmetricYCheckbox = this.element.append("input")
            .attr("type", "checkbox")
            .attr("id", "symmetric-y-checkbox")
            .on("change", function() {
                dataObj.globalSettings.symmetricY = this.checked;
                yAxisInputObj.update();
                plotObj.updatePlot();
                referenceLinesObj.updateReferenceLines();
                nucleosomeSliderObj.updateNucleosomeSlider()
            });
        this.symmetricYLabel = this.element.append("label")
            .attr("for", "symmetric-y-checkbox")
            .attr("id", "symmetric-y-label")
            .classed("checkbox-label", true)
            .text("Symmetric y-axis");

        this.update()
    }

    update() {
        this.symmetricYCheckbox.property("checked", dataObj.globalSettings.symmetricY && !dataObj.globalSettings.combined);
        this.symmetricYCheckbox.property("disabled", dataObj.globalSettings.combined);
        
        if (dataObj.globalSettings.combined) {
            this.yMaxInput.node().value = roundUpWithPrecision(dataObj.globalSettings.ymax - dataObj.globalSettings.ymin);
            this.yMinInput.node().value = 0
        } else if (dataObj.globalSettings.symmetricY) {
            this.yMaxInput.node().value = roundUpWithPrecision(Math.max(dataObj.globalSettings.ymax, -dataObj.globalSettings.ymin));
            this.yMinInput.node().value = roundUpWithPrecision(Math.min(-dataObj.globalSettings.ymax, dataObj.globalSettings.ymin))
        } else {
            this.yMaxInput.node().value = roundUpWithPrecision(dataObj.globalSettings.ymax);
            this.yMinInput.node().value = roundUpWithPrecision(dataObj.globalSettings.ymin)
        }
    }

    lockYmin() {
        this.yMinInput.attr("disabled", true)
    }

    unlockYmin() {
        this.yMinInput.attr("disabled", null)
    }

    lockInputs() {
        this.yMinInput.attr("disabled", true);
        this.yMaxInput.attr("disabled", true)
    }

    unlockInputs() {
        this.yMinInput.attr("disabled", null);
        this.yMaxInput.attr("disabled", null)
    }
};

const yAxisInputObj = new yAxisInput("y-axis-input")