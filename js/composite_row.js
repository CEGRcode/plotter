const compositeRow = class {
    constructor(table, idx) {
        this.row = table.append("tr")
            .attr("draggable", true)
            
    }

    addColumn(column) {
        this.row.appendChild(column.column);
    }
}