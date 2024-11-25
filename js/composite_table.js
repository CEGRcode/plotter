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
                    .on("click", function() {self.addRow({idx: self.nRows, primary_color: "#000000"})});
    }

    addRow({idx, primary_color, name=null, separate_colors=false, secondary_color=null, scale=1,
        min_opacity=null, max_opacity=null, smoothing=null, bp_shift=null, shift_occupancy=0, hide_sense=false,
        hide_anti=false, swap=false, ids=[]}) {
        this.rows.push(new compositeRow({row: this.table.insert("tr", "#add-row"), idx: idx,
            primary_color: primary_color, name: name, separate_colors: separate_colors,
            secondary_color: secondary_color, scale: scale, min_opacity: min_opacity, max_opacity: max_opacity,
            smoothing: smoothing, bp_shift: bp_shift, shift_occupancy: shift_occupancy, hide_sense: hide_sense,
            hide_anti: hide_anti, swap: swap, ids: ids}));
        this.nRows++
    }
};

let tableObj = new compositeTable("composite-table")