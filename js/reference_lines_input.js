const referenceLinesInput = class {
    constructor(elementID) {
        if (document.getElementById(elementID) === null) {
            throw "Element ID " + elementID + " not found"
        };
        this.container = d3.select("#" + elementID);

        this.horizontalLinesSection = this.container.append("div");
        this.horizontalLinesTable = this.horizontalLinesSection.append("table");

        this.verticalLinesSection = this.container.append("div");
    }

    addHorizontalLine() {
        const newRow = this.horizontalLinesTable.append("tr");
            
    }
}