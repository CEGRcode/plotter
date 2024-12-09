const separateColors = class {
    constructor(elementID) {
        if (document.getElementById(elementID) === null) {
            throw "Element ID " + elementID + " not found"
        };

        const self = this;
        this.element = d3.select("#" + elementID);
        this.checkbox = this.element.append("input")
            .attr("type", "checkbox")
            .attr("id", "separate-color-checkbox")
            .on("click", function() {
                dataObj.globalSettings.separateColors = this.checked;
                tableObj.rows.forEach(row => row.updateInputs());
                plotObj.updatePlot();
                legendObj.updateLegend()
            });
        this.label = this.element.append("label")
            .attr("for", "separate-color-checkbox")
            .attr("id", "separate-color-label")
            .classed("checkbox-label", true)
            .text("Separate colors for strands")
    }

    update() {
        this.checkbox.property("checked", dataObj.globalSettings.separateColors && !dataObj.globalSettings.combined);
        this.checkbox.property("disabled", dataObj.globalSettings.combined)
    }
};

const separateColorsObj = new separateColors("separate-colors")