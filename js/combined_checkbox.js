const combineStrands = class {
    constructor(elementID) {
        if (document.getElementById(elementID) === null) {
            throw "Element ID " + elementID + " not found"
        };

        const self = this;
        this.element = d3.select("#" + elementID);
        this.checkbox = this.element.append("input")
            .attr("type", "checkbox")
            .attr("id", "combine-strands-checkbox")
            .on("click", function() {
                dataObj.globalSettings.combined = this.checked;
                xAxisInputObj.update();
                yAxisInputObj.update();
                separateColorsObj.update();
                plotObj.updatePlot()
            });
        this.label = this.element.append("label")
            .attr("for", "combine-strands-checkbox")
            .attr("id", "combine-strands-label")
            .classed("checkbox-label", true)
            .text("Combine strands");

        this.update()
    }

    update() {
        this.checkbox.property("checked", dataObj.globalSettings.combined)
    }
};

const combineStrandsObj = new combineStrands("combine-strands")