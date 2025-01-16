const showLegend = class {
    constructor(elementID) {
        if (document.getElementById(elementID) === null) {
            throw "Element ID " + elementID + " not found"
        };

        const self = this;
        this.element = d3.select("#" + elementID);
        this.checkbox = this.element.append("input")
            .attr("type", "checkbox")
            .attr("id", "show-legend-checkbox")
            .on("click", function() {
                dataObj.globalSettings.showLegend = this.checked;
                legendObj.updateLegend()
            });
        this.label = this.element.append("label")
            .attr("for", "show-legend-checkbox")
            .attr("id", "show-legend-label")
            .classed("checkbox-label", true)
            .text("Show legend");
        
        this.update()
    }

    update() {
        this.checkbox.property("checked", dataObj.globalSettings.showLegend)
    }
};

const showLegendObj = new showLegend("show-legend")