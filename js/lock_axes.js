const lockAxes = class {
    constructor(elementID) {
        if (document.getElementById(elementID) === null) {
            throw "Element ID " + elementID + " not found"
        };

        const self = this;
        this.element = d3.select("#" + elementID);
        this.checkbox = this.element.append("input")
            .attr("type", "checkbox")
            .attr("id", "lock-axes-checkbox")
            .on("click", function() {
                dataObj.globalSettings.lockAxes = this.checked;
                self.update()
            });
        this.label = this.element.append("label")
            .attr("for", "lock-axes-checkbox")
            .attr("id", "lock-axes-label")
            .classed("checkbox-label", true)
            .text("Lock axes")
    }

    update() {
        this.checkbox.property("checked", dataObj.globalSettings.lockAxes);
        if (dataObj.globalSettings.lockAxes) {
            xAxisInputObj.lockInputs();
            yAxisInputObj.lockInputs()
        } else {
            xAxisInputObj.unlockInputs();
            yAxisInputObj.unlockInputs()
        }
    }
};

const lockAxesObj = new lockAxes("lock-axes")