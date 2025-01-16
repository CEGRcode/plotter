const compositeTable = class {
    constructor(elementID) {
        if (document.getElementById(elementID) === null) {
            throw "Element ID " + elementID + " not found"
        };
        const self = this;

        this.container = d3.select("#" + elementID)
        this.addRowContainer = this.container.append("div")
            .attr("id", "add-row");
        this.addRowIcon = this.addRowContainer.append("svg")
            .classed("add-row-icon", true)
            .attr("title", "Add new composite")
            .attr("xmlns", "http://www.w3.org/2000/svg")
            .attr("viewbox", "0 0 185 30")
            .attr("width", "185")
            .attr("height", "30")
            .on("click", function() {
                const compositeDataObj = dataObj.addCompositeData({idx: self.nRows});
                self.addRow(compositeDataObj)
            });
        this.addRowIcon.append("circle")
            .attr("cx", 15)
            .attr("cy", 15)
            .attr("r", 15)
            .attr("fill", "#468C00");
        this.addRowIcon.append("path")
            .attr("d", "m 15 5 l 0 20 M 5 15 l 20 0")
            .attr("stroke", "#FFFFFF")
            .attr("stroke-width", 4);
        this.addRowIcon.append("text")
            .attr("x", 40)
            .attr("y", 21)
            .attr("font-size", 16)
            .text("Add new composite");
        this.table = this.container.append("table").append("tbody");
        this.rows = [];
        this.nRows = 0;

        this.addRow(dataObj.addCompositeData({idx: this.nRows}))
    }

    addRow(compositeDataObj) {
        // Add the row
        this.rows.push(new compositeRow(
            this.table.append("tr").classed("composite-row", true),
            this.nRows,
            compositeDataObj
        ));
        this.nRows++
    }

    insertRowBefore(dragIdx, dropIdx) {
        if (dragIdx === dropIdx) {
            return
        };

        // Move row elements
        const dragRow = this.rows[dragIdx],
            dropRow = this.rows[dropIdx];
        $(dragRow.row.node()).insertBefore(dropRow.row.node());

        // Update row array
        this.rows.splice(dragIdx, 1);
        this.rows.splice(dropIdx - (dropIdx > dragIdx), 0, dragRow);

        // Update row indices
        for (const i in this.rows) {
            this.rows[i].updateIndex(i)
        }
    }

    insertRowAfter(dragIdx, dropIdx) {
        if (dragIdx === dropIdx) {
            return
        };

        // Move row elements
        const dragRow = this.rows[dragIdx],
            dropRow = this.rows[dropIdx];
        $(dragRow.row.node()).insertAfter(dropRow.row.node());

        // Update row array
        this.rows.splice(dragIdx, 1);
        this.rows.splice(dropIdx - (dropIdx > dragIdx) + 1, 0, dragRow);

        // Update row indices
        for (const i in this.rows) {
            this.rows[i].updateIndex(parseInt(i))
        }
    }

    removeRow(idx) {
        this.rows[idx].remove();
        this.rows.splice(idx, 1);
        this.nRows--
    }

    loadFromDataObject() {
        this.clear();
        for (const compositeDataObj of dataObj.compositeData) {
            this.addRow(compositeDataObj)
        }
    }

    clear() {
        this.rows = [];
        this.nRows = 0;
        this.table.selectAll(".composite-row").remove()
    }
};

let tableObj = new compositeTable("composite-table")