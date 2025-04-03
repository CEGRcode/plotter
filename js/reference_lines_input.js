const referenceLinesInput = class {
    constructor(elementID, defaultColor="#FF0000", defaultLineStyle="dashed") {
        if (document.getElementById(elementID) === null) {
            throw "Element ID " + elementID + " not found"
        };
        this.container = d3.select("#" + elementID);

        this.defaultColor = defaultColor;
        this.defaultLineStyle = defaultLineStyle;
        this.defaultFontSize = 6;
        this.defaultLabelOffset = 10;

        const self = this;

        this.horizontalLinesSection = this.container.append("span")
            .classed("ref-line-section", true)
        this.horizontalLinesSection.append("i")
            .classed("add-row-icon fa-solid fa-lg fa-circle-plus", true)
            .on("click", function() {
                const y = (plotObj.yscale.domain()[0] + plotObj.yscale.domain()[1]) / 2;
                dataObj.addHorizontalReferenceLine(y, self.defaultColor, self.defaultLineStyle,
                    self.defaultFontSize, self.defaultColor, "horizontal", self.defaultLabelOffset);
                self.update("horizontal");
                referenceLinesObj.updateReferenceLines()
            });
        this.horizontalLinesSection.append("text")
            .text("  Horizontal lines");
        this.horizontalLinesTable = this.horizontalLinesSection.append("table")
            .classed("ref-line-table", true);

        this.verticalLinesSection = this.container.append("span")
            .classed("ref-line-section", true)
        this.verticalLinesSection.append("i")
            .classed("add-row-icon fa-solid fa-lg fa-circle-plus", true)
            .on("click", function() {
                const x = Math.floor((dataObj.globalSettings.xmin + dataObj.globalSettings.xmax) / 2);
                dataObj.addVerticalReferenceLine(x, self.defaultColor, self.defaultLineStyle,
                    self.defaultFontSize, self.defaultColor, "horizontal", self.defaultLabelOffset);
                self.update("vertical");
                referenceLinesObj.updateReferenceLines()
            });
        this.verticalLinesSection.append("text")
            .text("  Vertical lines");
        this.verticalLinesTable = this.verticalLinesSection.append("table")
            .classed("ref-line-table", true);

        dataObj.addVerticalReferenceLine(0, "#999999", "dashed", 14, "#000000", "horizontal", 15);
        referenceLinesObj.updateReferenceLines();
        this.updateAll()
    }

    update(hv) {
        const table = hv === "horizontal" ? this.horizontalLinesTable : this.verticalLinesTable,
            referenceLinesArr = hv === "horizontal" ? dataObj.referenceLines.horizontalLines :
                dataObj.referenceLines.verticalLines,
            axis = hv === "horizontal" ? "y" : "x",
            rowsSelector = table.selectAll("tr.ref-line-row")
                .data(referenceLinesArr)
                .join("tr")
                    .classed("ref-line-row", true)
                    .selectAll("table")
                        .data((d, i) => [{data: d, index: i}])
                        .join("table"),
            lineSettingsSelector = rowsSelector.selectAll("tr.ref-line-line-settings")
                .data(d => [d])
                .join("tr")
                    .classed("ref-line-line-settings", true),
            labelSettingsSelector = rowsSelector.selectAll("tr.ref-line-label-settings")
                .data(d => [d])
                .join("tr")
                    .classed("ref-line-label-settings", true)
                    .classed("hidden", true);
            self = this;

        // Add a column for the position input
        const posColSelector = lineSettingsSelector.selectAll("td.ref-line-pos-col")
            .data(d => [d])
            .join("td")
                .classed("ref-line-pos-col", true);
        posColSelector.selectAll("label.setting-label")
            .data(() => [null])
            .join("label")
                .classed("setting-label", true)
                .text(axis + "=");
        posColSelector.selectAll("input.ref-line-pos-input")
            .data(d => [d])
            .join("input")
                .attr("type", "text")
                .classed("ref-line-pos-input", true)
                .each(function(d) {
                    this.value = d.data[axis];
                    d3.select(this).on("change", function() {
                        referenceLinesArr[d.index][axis] = parseFloat(this.value);
                        referenceLinesObj.updateReferenceLines()
                    })
                });

        // Add a column for the color input
        lineSettingsSelector.selectAll("td.ref-line-color-col")
            .data(d => [d])
            .join("td")
                .classed("ref-line-color-col", true)
                .selectAll("input.ref-line-color-input")
                    .data(d => [d])
                    .join("input")
                        .attr("type", "color")
                        .classed("ref-line-color-input", true)
                        .each(function(d) {
                            this.value = d.data.color;
                            d3.select(this).on("change", function() {
                                referenceLinesArr[d.index].color = this.value;
                                referenceLinesObj.updateReferenceLines()
                            })
                        });
        
        // Add a column for the line style selector
        const styleColSelector = lineSettingsSelector.selectAll("td.ref-line-style-col")
            .data(d => [d])
            .join("td")
                .classed("ref-line-style-col", true);
        styleColSelector.selectAll("svg.ref-line-style-svg")
            .data(d => [d])
            .join("svg")
                .classed("ref-line-style-svg", true)
                .classed("main-line-style-svg", true)
                .each(function(d) {
                    const selector = d3.select(this);
                    self.createStyleSVG(selector, d.data.linestyle)
                })
                .on("click", function() {
                    d3.select(this.parentNode).select(".ref-line-style-selector").classed("hidden", false)
                });
        styleColSelector.selectAll("div.ref-line-style-selector")
            .data(d => [d])
            .join("div")
                .classed("ref-line-style-selector", true)
                .classed("hidden", true)
                .selectAll("svg.ref-line-style-svg")
                    .data(d => Object.keys(lineStyles).map(s => ({style: s, index: d.index})))
                    .join("svg")
                        .classed("ref-line-style-svg", true)
                        .each(function(d) {
                            const selector = d3.select(this);
                            self.createStyleSVG(selector, d.style);
                            selector.on("click", function() {
                                referenceLinesArr[d.index].linestyle = d.style;
                                referenceLinesObj.updateReferenceLines();
                                table.select("tr.ref-line-row:nth-child(" + (d.index + 1) + ")")
                                    .select("svg.main-line-style-svg")
                                    .selectAll("line")
                                        .data(() => [null])
                                        .join("line")
                                            .attr("stroke-dasharray", lineStyles[d.style]);
                                d3.select(this.parentNode).classed("hidden", true)
                            })
                        });

        // Add a column for the label settings button
        lineSettingsSelector.selectAll("td.ref-line-label-col")
            .data(d => [d])
            .join("td")
                .classed("ref-line-label-col", true)
                .selectAll("button")
                    .data(() => [null])
                    .join("button")
                        .text("Label settings")
                        .on("click", function() {
                            const selector = d3.select(this.parentNode.parentNode.parentNode),
                                notHidden = selector.select("tr.ref-line-label-settings").classed("not-hidden");
                            selector.select("tr.ref-line-label-settings").classed("not-hidden", !notHidden)
                        });
        
        // Add a column for the remove icon
        lineSettingsSelector.selectAll("td.ref-line-remove-col")
            .data(d => [d])
            .join("td")
                .classed("ref-line-remove-col", true)
                .selectAll("i.remove-icon")
                    .data(d => [d])
                    .join("i")
                        .classed("remove-icon fa-solid fa-lg fa-times-circle", true)
                        .each(function(d) {
                            d3.select(this).on("click", function() {
                                referenceLinesArr.splice(d.index, 1);
                                referenceLinesObj.updateReferenceLines();
                                self.update(hv)
                            })
                        });

        const fontSizeCol = labelSettingsSelector.selectAll("td.font-size-col")
            .data(d => [d])
            .join("td")
                .classed("font-size-col", true);
        fontSizeCol.selectAll("label")
            .data(() => [null])
            .join("label")
                .classed("setting-label", true)
                .text("Size:");
        fontSizeCol.selectAll("input")
            .data(d => [d])
            .join("input")
                .classed("font-size-input", true)
                .attr("type", "number")
                .attr("min", 0)
                .each(function(d) {
                    this.value = d.data.fontSize;
                    d3.select(this).on("change", function() {
                        referenceLinesArr[d.index].fontSize = parseFloat(this.value);
                        referenceLinesObj.updateReferenceLines()
                    })
                });
        
        labelSettingsSelector.selectAll("td.font-color-col")
            .data(d => [d])
            .join("td")
                .classed("font-color-col", true)
                .selectAll("input")
                    .data(d => [d])
                    .join("input")
                        .attr("type", "color")
                        .each(function(d) {
                            this.value = d.data.fontColor;
                            d3.select(this).on("change", function() {
                                referenceLinesArr[d.index].fontColor = this.value;
                                referenceLinesObj.updateReferenceLines()
                            })
                        });
        
        labelSettingsSelector.selectAll("td.text-orientation-col")
            .data(d => [d])
            .join("td")
                .classed("text-orientation-col", true)
                .attr("colspan", 2)
                .selectAll("select")
                    .data(d => [d])
                    .join("select")
                        .each(function(d) {
                            this.value = d.data.textOrientation;
                            d3.select(this).on("change", function() {
                                referenceLinesArr[d.index].textOrientation = this.value;
                                referenceLinesObj.updateReferenceLines()
                            })
                        })
                        .selectAll("option")
                            .data(["horizontal", "vertical"])
                            .join("option")
                                .text(d => d)
                                .attr("value", d => d);
        
        const offsetCol = labelSettingsSelector.selectAll("td.label-offset-col")
            .data(d => [d])
            .join("td")
                .classed("label-offset-col", true);
        offsetCol.selectAll("label")
            .data(() => [null])
            .join("label")
                .classed("setting-label", true)
                .text("Pad:");
        offsetCol.selectAll("input")
            .data(d => [d])
            .join("input")
                .attr("type", "number")
                .classed("label-offset-input", true)
                .each(function(d) {
                    this.value = d.data.labelOffset;
                    d3.select(this).on("change", function() {
                        referenceLinesArr[d.index].labelOffset = parseFloat(this.value);
                        referenceLinesObj.updateReferenceLines()
                    })
                })
    }

    updateAll() {
        this.update("horizontal");
        this.update("vertical")
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
};

const referenceLinesInputObj = new referenceLinesInput("reference-lines-input")