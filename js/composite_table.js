const compositeTable = class {
    constructor(elementID) {
        if (document.getElementById(elementID) === null) {
            throw "Element ID " + elementID + " not found"
        };
        this.table = d3.select("#" + elementID).append("table").append("tbody");
        this.rows = [];
        this.nRows = 0;
        const self = this;
        this.addRow_ = this.table.append("tr")
            .attr("id", "add-row")
            .append("td")
                .attr("colspan", 11)
                .append("div")
                    .classed("add-row-text", true)
                    .text("Add new composite")
                    .on("click", function() {
                        const compositeDataObj = dataObj.addCompositeData({idx: self.nRows});
                        self.addRow(compositeDataObj)
                    });
    }

    addRow(compositeDataObj) {
        // Add the row
        this.rows.push(new compositeRow(
            this.table.insert("tr", "#add-row").classed("composite-row", true),
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