const enablePlotTooltip = class {
    constructor(elementID) {
        if (document.getElementById(elementID) === null) {
            throw "Element ID " + elementID + " not found"
        };

        const self = this;
        this.element = d3.select("#" + elementID);
        this.checkbox = this.element.append("input")
            .attr("type", "checkbox")
            .attr("id", "enable-plot-tooltip-checkbox")
            .on("click", function() {
                dataObj.globalSettings.enableTooltip = this.checked
            });
        this.label = this.element.append("label")
            .attr("for", "enable-plot-tooltip-checkbox")
            .attr("id", "enable-plot-tooltip-label")
            .classed("checkbox-label", true)
            .text("Enable plot tooltip");
        
        this.update()
    }

    update() {
        this.checkbox.property("checked", dataObj.globalSettings.enableTooltip)
    }
};

const enablePlotTooltipObj = new enablePlotTooltip("enable-plot-tooltip")