const compositeTable = class {
    constructor(elementID) {
        if (document.getElementById(elementID) === null) {
            throw "Element ID " + elementID + " not found"
        };
        const self = this;

        this.container = d3.select("#" + elementID)
        const thb = this.container.append("table").classed("tableFixHead", true);
        const headerRow = thb.append("thead");
        // Insert "Add composite row" in table header
        this.addRowIcon = headerRow.append("th").append("i")
            .classed("add-row-icon fa-solid fa-2xl fa-circle-plus", true)
            .on("click", function() {
                const compositeDataObj = dataObj.addCompositeData({idx: self.nRows});
                self.addRow(compositeDataObj)
            });
        headerRow.append("th").text("Composite");
        headerRow.append("th").text("Color");
        headerRow.append("th").text("Scale");
        headerRow.append("th").text("Opacity");
        headerRow.append("th").text("Smooth");
        headerRow.append("th").text("BP shift");
        headerRow.append("th");
        headerRow.append("th");
        headerRow.append("th").text("Upload files");
        headerRow.append("th");
        headerRow.append("th");

        this.table = thb.append("tbody");

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
        for (let i = idx + 1; i < this.rows.length; i++) {
            this.rows[i].updateIndex(i - 1)
        };

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