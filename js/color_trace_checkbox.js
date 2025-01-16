const colorTrace = class {
    constructor(elementID) {
        if (document.getElementById(elementID) === null) {
            throw "Element ID " + elementID + " not found"
        };

        const self = this;
        this.element = d3.select("#" + elementID);
        this.checkbox = this.element.append("input")
            .attr("type", "checkbox")
            .attr("id", "color-trace-checkbox")
            .on("click", function() {
                dataObj.globalSettings.colorTrace = this.checked;
                plotObj.updatePlot()
            });
        this.label = this.element.append("label")
            .attr("for", "color-trace-checkbox")
            .attr("id", "color-trace-label")
            .classed("checkbox-label", true)
            .text("Color trace");
        
        this.update()
    }

    update() {
        this.checkbox.property("checked", dataObj.globalSettings.colorTrace)
    }
};

const colorTraceObj = new colorTrace("color-trace")