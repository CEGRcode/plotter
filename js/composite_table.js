const compositeTable = class {
    constructor(elementID) {
        if (document.getElementById(elementID) === null) {
            throw "Element ID " + elementID + " not found"
        };
        this.table = d3.select("#" + elementID).append("table").append("tbody");
        this.rows = [];
        this.nRows = 0;
        const self = this;
        this.add_row = this.table.append("tr")
            .attr("id", "add-row")
            .append("td")
                .attr("colspan", 9)
                .append("div")
                    .text("Add new composite")
                    .on("click", function() {
                        const compositeDataObj = dataObj.addCompositeData({idx: self.nRows});
                        self.addRow(compositeDataObj)
                    });
    }

    addRow(compositeDataObj) {
        // Add the row
        this.rows.push(new compositeRow(this.table.insert("tr", "#add-row"), this.nRows, compositeDataObj));
        this.nRows++
    }
};

let tableObj = new compositeTable("composite-table")