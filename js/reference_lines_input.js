const referenceLinesInput = class {
    constructor(elementID, defaultColor="#FF0000", defaultLineStyle="dashed") {
        if (document.getElementById(elementID) === null) {
            throw "Element ID " + elementID + " not found"
        };
        this.container = d3.select("#" + elementID);

        this.defaultColor = defaultColor;
        this.defaultLineStyle = defaultLineStyle;

        const self = this;

        this.horizontalLinesSection = this.container.append("span")
            .classed("ref-line-section", true)
        const horizontalLinesAddRow = this.horizontalLinesSection.append("i")
            .classed("add-row-icon fa-solid fa-lg fa-circle-plus", true)
            .on("click", function() {
                const y = (plotObj.yscale.domain()[0] + plotObj.yscale.domain()[1]) / 2;
                dataObj.referenceLines.horizontalLines.push({
                    y: y,
                    color: self.defaultColor,
                    linestyle: self.defaultLineStyle
                });
                self.addRow(self.horizontalLinesTable.append("tr").classed("ref-line-row", true),
                    "y", y, dataObj.referenceLines.horizontalLines);
                referenceLinesObj.updateReferenceLines()
            });
        this.horizontalLinesSection.append("text")
            .text("  Horizontal lines");
        this.horizontalLinesTable = this.horizontalLinesSection.append("table")
            .classed("ref-line-table", true);

        this.verticalLinesSection = this.container.append("span")
            .classed("ref-line-section", true)
        const verticalLinesAddRow = this.verticalLinesSection.append("i")
            .classed("add-row-icon fa-solid fa-lg fa-circle-plus", true)
            .on("click", function() {
                const x = Math.floor((dataObj.globalSettings.xmin + dataObj.globalSettings.xmax) / 2);
                dataObj.referenceLines.verticalLines.push({
                    x: x,
                    color: self.defaultColor,
                    linestyle: self.defaultLineStyle
                });
                self.addRow(self.verticalLinesTable.append("tr").classed("ref-line-row", true),
                    "x", x, dataObj.referenceLines.verticalLines);
                referenceLinesObj.updateReferenceLines()
            });
        this.verticalLinesSection.append("text")
            .text("  Vertical lines");
        this.verticalLinesTable = this.verticalLinesSection.append("table")
            .classed("ref-line-table", true);

    }

    addRow(newRow, axis, pos, referenceLinesArr) {
        const posCol = newRow.append("td")
            .classed("ref-line-pos-col", true);
        posCol.append("label")
            .classed("setting-label", true)
            .text(axis + "=");
        posCol.append("input")
            .attr("type", "text")
            .classed("ref-line-pos-input", true)
            .on("change", function() {
                const idx = this.parentNode.parentNode.rowIndex;
                referenceLinesArr[idx][axis] = parseFloat(this.value);
                referenceLinesObj.updateReferenceLines()
            })
            .node().value = pos;
        
        newRow.append("td")
            .classed("ref-line-color-col", true)
            .append("input")
                .attr("type", "color")
                .classed("ref-line-color-input", true)
                .on("change", function() {
                    const idx = this.parentNode.parentNode.rowIndex;
                    referenceLinesArr[idx].color = this.value;
                    referenceLinesObj.updateReferenceLines()
                })
                .node().value = this.defaultColor;
        
        const styleCol = newRow.append("td")
                .classed("ref-line-style-col", true),
            styleSVG = styleCol.append("svg")
                .classed("ref-line-style-svg", true)
                .on("click", function() {
                    d3.select(this.parentNode).select(".ref-line-style-selector").classed("hidden", false)
                });
        this.createStyleSVG(styleSVG, this.defaultLineStyle);

        const styleSelector = styleCol.append("div")
            .classed("ref-line-style-selector", true)
            .classed("hidden", true);
        for (const style in lineStyles) {
            const styleOption = styleSelector.append("svg")
                .classed("ref-line-style-svg", true)
                .on("click", function() {
                    const idx = this.parentNode.parentNode.parentNode.rowIndex;
                    referenceLinesArr[idx].linestyle = style;
                    referenceLinesObj.updateReferenceLines();
                    styleSVG.select("line").attr("stroke-dasharray", lineStyles[style]);

                    styleSelector.classed("hidden", true)
                });
            this.createStyleSVG(styleOption, style)
        };

        const removeIcon = newRow.append("td")
            .classed("ref-line-remove-col", true)
            .append("i")
                .classed("remove-icon fa-solid fa-lg fa-times-circle", true)
                .on("click", function() {
                    const idx = this.parentNode.parentNode.rowIndex;
                    referenceLinesArr.splice(idx, 1);
                    referenceLinesObj.updateReferenceLines();
                    this.parentNode.parentNode.remove()
                });
    }

    createStyleSVG(selector, style) {
        selector
            .attr("xmlns", "http://www.w3.org/2000/svg")
            .attr("viewbox", "0 0 40 40")
            .attr("width", "40")
            .attr("height", "40");
        selector.append("rect")
            .attr("x", 2)
            .attr("y", 2)
            .attr("width", 36)
            .attr("height", 36)
            .attr("rx", 3)
            .attr("stroke", "#000000")
            .attr("stroke-width", 2)
            .attr("fill", "none");
        selector.append("line")
            .attr("x1", 2)
            .attr("y1", 38)
            .attr("x2", 38)
            .attr("y2", 2)
            .attr("stroke", "#000000")
            .attr("stroke-width", 2)
            .attr("stroke-dasharray", lineStyles[style])
    }

    update() {
        const dataNH = dataObj.referenceLines.horizontalLines.length,
            tableNH = this.horizontalLinesTable.selectAll(".ref-line-row").size();
        for (let i = 0; i < Math.max(tableNH, dataNH); i++) {
            // If there are more rows in the table than data elements, remove the last row
            if (i >= dataNH && i < tableNH) {
                this.horizontalLinesTable.select(".ref-line-row:last-child").remove()
            }
            // If there are more data elements than rows in the table, add a new row
            else if (i >= tableNH && i < dataNH) {
                const newRow = this.horizontalLinesTable.append("tr").classed("ref-line-row", true);
                this.addRow(newRow, "y", dataObj.referenceLines.horizontalLines[i].y,
                    dataObj.referenceLines.horizontalLines);
                newRow.select(".ref-line-color-input").node().value = dataObj.referenceLines.horizontalLines[i].color;
                newRow.select(".ref-line-style-svg line").attr("stroke-dasharray",
                    lineStyles[dataObj.referenceLines.horizontalLines[i].linestyle])
            } else {
                const row = d3.select(this.horizontalLinesTable.node().rows[i]);
                row.select(".ref-line-pos-input").node().value = dataObj.referenceLines.horizontalLines[i].y;
                row.select(".ref-line-color-input").node().value = dataObj.referenceLines.horizontalLines[i].color;
                row.select(".ref-line-style-svg line").attr("stroke-dasharray",
                    lineStyles[dataObj.referenceLines.horizontalLines[i].linestyle])
            }
        };

        const dataNV = dataObj.referenceLines.verticalLines.length,
            tableNV = this.verticalLinesTable.selectAll(".ref-line-row").size();
        for (let i = 0; i < Math.max(tableNV, dataNV); i++) {
            if (i >= dataNV && i < tableNV) {
                this.verticalLinesTable.select(".ref-line-row:last-child").remove()
            } else if (i >= tableNV && i < dataNV) {
                const newRow = this.verticalLinesTable.append("tr").classed("ref-line-row", true);
                this.addRow(newRow, "x", dataObj.referenceLines.verticalLines[i].x,
                    dataObj.referenceLines.verticalLines);
                newRow.select(".ref-line-color-input").node().value = dataObj.referenceLines.verticalLines[i].color;
                newRow.select(".ref-line-style-svg line").attr("stroke-dasharray",
                    lineStyles[dataObj.referenceLines.verticalLines[i].linestyle])
            } else {
                const row = d3.select(this.verticalLinesTable.node().rows[i]);
                row.select(".ref-line-pos-input").node().value = dataObj.referenceLines.verticalLines[i].x;
                row.select(".ref-line-color-input").node().value = dataObj.referenceLines.verticalLines[i].color;
                row.select(".ref-line-style-svg line").attr("stroke-dasharray",
                    lineStyles[dataObj.referenceLines.verticalLines[i].linestyle])
            }
        }
    }
};

const referenceLinesInputObj = new referenceLinesInput("reference-lines-input")