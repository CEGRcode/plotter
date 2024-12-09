const compositeRow = class {
    constructor(row, idx, compositeDataObj) {
        this.row = row;
        this.idx = idx;
        this.compositeDataObj = compositeDataObj;
        
        const self = this;
        this.row
            .attr("draggable", true)
            .on("mouseover", function() {self.mouseHighlight()})
            .on("mouseleave", function() {self.mouseUnhighlight()})
            .on("dragstart", function(ev) {ev.dataTransfer.setData("text/plain", self.idx)})
            .on("dragover", function(ev) {
                self.fileDragHighlight();
                // This is necessary to allow a drop
                ev.preventDefault()
            })
            .on("dragleave", function() {self.fileDragUnhighlight()})
            .on("drop", function(ev) {
                self.fileDragUnhighlight();
                self.directDropEvent(ev)
            });

        // Add the drag column
        this.dragIcon = this.row.append("td").append("div")
            .classed("drag-col", true)
            .attr("title", "Drag to reorder")
            .append("svg")
                .classed("drag-icon", true)
                .attr("baseProfile", "full")
                .attr("width", "24px")
                .attr("viewBox", "0 0 16 16")
                .attr("version", "1.1")
                .attr("xmlns", "http://www.w3.org/2000/svg")
                .append("g")
                    .selectAll("line")
                    .data([4, 8, 12])
                    .join("line")
                        .attr("x1", 0)
                        .attr("y1", d => d)
                        .attr("x2", 16)
                        .attr("y2", d => d)
                        .attr("stroke", "gray")
                        .attr("stroke-width", 2);
        
        // Add the name column
        this.nameInput = this.row.append("td").append("div")
            .classed("name-div", true)
            .attr("contenteditable", true)
            .on("input", function(ev) {
                self.compositeDataObj.changeName(ev.target.textContent);
                plotObj.updatePlot();
                legendObj.updateLegend()
            })
            .on("mousedown", function() {self.disableDrag()})
            .on("mouseup", function() {self.enableDrag()})
            .on("mouseleave", function() {self.enableDrag()});

        // Add the color column
        const colorCol = this.row.append("td").classed("color-col", true);
        this.primaryColorInput = colorCol.append("input")
            .attr("type", "color")
            .classed("color-1", true)
            .on("change", function(ev) {
                self.compositeDataObj.changePrimaryColor(ev.target.value);
                if (self.compositeDataObj.secondaryColor === null) {
                    colorCol.select(".color-2").attr("value", ev.target.value)
                };
                plotObj.updatePlot();
                legendObj.updateLegend()
            });
        this.secondaryColorInput = colorCol.append("input")
            .attr("type", "color")
            .classed("color-2", true)
            .on("change", function(ev) {
                self.compositeDataObj.changeSecondaryColor(ev.target.value);
                plotObj.updatePlot();
                legendObj.updateLegend()
            });
        
        // Add the scale column
        const scaleDiv = this.row.append("td").append("div")
                .classed("slider-div", true);
                scaleDiv.append("label")
                .classed("setting-label", true)
                .text("Scale:");
        this.scaleTextInput = scaleDiv.append("input")
            .attr("type", "text")
            .classed("setting-text", true)
            .on("change", function(ev) {
                const scale = roundNearestWithPrecision(ev.target.value)
                ev.target.value = scale.toPrecision(2);
                scaleDiv.select(".scale-slider").attr("value", Math.log10(scale) * 50 + 50);
                self.compositeDataObj.changeScale(scale);
                plotObj.updatePlot()
            })
            .on("mousedown", function() {self.disableDrag()})
            .on("mouseup", function() {self.enableDrag()})
            .on("mouseleave", function() {self.enableDrag()});
        this.scaleSliderInput = scaleDiv.append("input")
            .attr("type", "range")
            .classed("scale-slider", true)
            .attr("min", 0)
            .attr("max", 100)
            .on("input", function(ev) {
                const scale = roundNearestWithPrecision(Math.pow(10, (ev.target.value - 50) / 50));
                scaleDiv.select(".setting-text").attr("value", scale.toPrecision(2));
                self.compositeDataObj.changeScale(scale);
                plotObj.updatePlot()
            })
            .on("mousedown", function() {self.disableDrag()})
            .on("mouseup", function() {self.enableDrag()});
        // Add the opacity column
        const opacityCol = this.row.append("td");
        opacityCol.append("label")
            .classed("setting-label", true)
            .text("Opacity:");
        this.minOpacityInput = opacityCol.append("input")
            .attr("type", "text")
            .classed("setting-text", true)
            .on("change", function(ev) {
                const minOpacity = !isNaN(parseFloat(ev.target.value)) ? parseFloat(ev.target.value) : null;
                self.compositeDataObj.changeMinOpacity(minOpacity);
                plotObj.updatePlot();
            })
            .on("mousedown", function() {self.disableDrag()})
            .on("mouseup", function() {self.enableDrag()})
            .on("mouseleave", function() {self.enableDrag()});
            opacityCol.append("span")
            .text(" - ");
        this.maxOpacityInput = opacityCol.append("input")
            .attr("type", "text")
            .classed("setting-text", true)
            .on("change", function(ev) {
                const maxOpacity = !isNaN(parseFloat(ev.target.value)) ? parseFloat(ev.target.value) : null;
                self.compositeDataObj.changeMaxOpacity(maxOpacity);
                plotObj.updatePlot()
            })
            .on("mousedown", function() {self.disableDrag()})
            .on("mouseup", function() {self.enableDrag()})
            .on("mouseleave", function() {self.enableDrag()});
        
        // Add the smoothing column
        const smoothingCol = this.row.append("td");
        smoothingCol.append("label")
                .classed("setting-label", true)
                .text("Smoothing:");
        this.smoothingInput = smoothingCol.append("input")
            .attr("type", "text")
            .classed("setting-text", true)
            .on("change", function(ev) {
                const smoothing = parseInt(ev.target.value) > 0 ? parseInt(ev.target.value) : null;
                self.compositeDataObj.changeSmoothing(smoothing);
                plotObj.updatePlot()
            })
            .on("mousedown", function() {self.disableDrag()})
            .on("mouseup", function() {self.enableDrag()})
            .on("mouseleave", function() {self.enableDrag()});
        
        // Add the bp shift column
        const bpShiftCol = this.row.append("td");
        bpShiftCol.append("label")
            .classed("setting-label", true)
            .text("BP Shift:");
        this.shiftInput = bpShiftCol.append("input")
            .attr("type", "text")
            .classed("setting-text", true)
            .on("change", function(ev) {
                const bpShift = !isNaN(parseInt(ev.target.value)) ? parseInt(ev.target.value) : null;
                self.compositeDataObj.changeBpShift(bpShift);
                plotObj.updatePlot()
            })
            .on("mousedown", function() {self.disableDrag()})
            .on("mouseup", function() {self.enableDrag()})
            .on("mouseleave", function() {self.enableDrag()});

        // Add hide icon
        const hideCol = this.row.append("td").classed("hide-col", true);
        this.eyeOpenIcon = hideCol.append("div")
            .classed("hide-container", true)
            .attr("title", "Hide")
            .on("click", function() {
                self.compositeDataObj.changeHideSense(true);
                self.compositeDataObj.changeHideAnti(true);
                plotObj.updatePlot();
                legendObj.updateLegend();

                self.closeEyeIcon()
            })
            .append("svg")
                .classed("hide-icon", true)
                .classed("eye-open", true)
                .attr("baseProfile", "full")
                .attr("viewBox", "-100 -100 200 200")
                .attr("version", "1.1")
                .attr("xmlns", "http://www.w3.org/2000/svg")
                .append("g");
        this.eyeOpenIcon.append("path")
            .attr("d", "M-100 0C-50 60 50 60 100 0C50 -60 -50 -60 -100 0")
            .attr("fill", "none")
            .attr("stroke", "black")
            .attr("stroke-width", 3);
        this.eyeOpenIcon.append("circle")
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("r", 30)
            .attr("fill", "black")
            .attr("stroke", "none");
        this.eyeClosedIcon = hideCol.append("div")
            .classed("hide-container", true)
            .attr("title", "Show")
            .on("click", function() {
                self.compositeDataObj.changeHideSense(false);
                self.compositeDataObj.changeHideAnti(false);
                plotObj.updatePlot();
                legendObj.updateLegend();

                self.openEyeIcon()
            })
            .append("svg")
                .classed("hide-icon", true)
                .classed("eye-closed", true)
                .attr("title", "Show")
                .attr("baseProfile", "full")
                .attr("viewBox", "-100 -100 200 200")
                .attr("version", "1.1")
                .attr("xmlns", "http://www.w3.org/2000/svg")
                .style("display", "none")
                .append("g");
        this.eyeClosedIcon.append("path")
            .attr("d", "M-100 0C-50 60 50 60 100 0M-66.77 27.7L-74.21 40.78M-24.62 42.82L-27.26 57.58M24.62 42.82L27.26 57.58M66.77 27.7L74.21 40.78")
            .attr("fill", "none")
            .attr("stroke", "black")
            .attr("stroke-width", 3);

        // Add file upload column
        const uploadCol = this.row.append("td"),
            fileInput = uploadCol.append("input")
                .attr("type", "file")
                .property("multiple", true)
                .style("display", "none")
                .on("input", async function(ev) {
                    self.loadFiles(ev.target.files)
                });
        uploadCol.append("button")
            .classed("upload-button", true)
            .attr("title", "Upload file(s)")
            .on("click", function() {$(fileInput.node()).click()})
            .append("svg")
                .classed("upload-icon", true)
                .attr("baseProfile", "full")
                .attr("viewBox", "0 0 24 24")
                .attr("version", "1.1")
                .attr("xmlns", "http://www.w3.org/2000/svg")
                .append("g")
                    .append("path")
                        .attr("d", "M9 10L12 7L15 10M12 7V21M20 7V4A1 1 0 0 0 19 3H5A1 1 0 0 0 4 4V7")
                        .attr("stroke", "#000000")
                        .attr("stroke-width", 2)
                        .attr("stroke-linejoin", "round")
                        .attr("fill", "none");
        this.uploadLabel = uploadCol.append("label")
            .classed("upload-label", true)
            .style("padding-left", "10px");

        // Add remove column
        const removeIcon = this.row.append("td").append("svg")
            .classed("remove-icon", true)
            .attr("baseProfile", "full")
            .attr("viewBox", "-200 -200 400 400")
            .attr("version", "1.1")
            .attr("xmlns", "http://www.w3.org/2000/svg")
            .on("click", function() {
                tableObj.removeRow(self.idx);
                dataObj.updateCompositeData(tableObj.rows.map(row => row.compositeDataObj));
                plotObj.updatePlot();
                legendObj.updateLegend()
            });
        removeIcon.append("circle")
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("r", 200)
            .attr("fill", "#DD0000");
        removeIcon.append("polygon")
            .attr("points", "-130,30 -30,30 -30,130 30,130 30,30 130,30 130,-30 30,-30 30,-130 -30,-130 -30,-30 -130,-30")
            .attr("fill", "#FFFFFF")
            .attr("transform", "rotate(45)");
            
        this.updateInputs()
    }

    updateIndex(idx) {
        this.idx = idx
    }

    updateInputs() {
        this.nameInput.text(this.compositeDataObj.name);
        this.primaryColorInput.node().value = this.compositeDataObj.primaryColor;
        this.secondaryColorInput.style("display", dataObj.globalSettings.separateColors && !dataObj.globalSettings.combined ? null : "none");
        this.secondaryColorInput.node().value = this.compositeDataObj.secondaryColor || this.compositeDataObj.primaryColor;
        this.scaleTextInput.node().value = this.compositeDataObj.scale;
        this.scaleSliderInput.node().value = Math.log10(this.compositeDataObj.scale) * 50 + 50;
        this.minOpacityInput.node().value = this.compositeDataObj.minOpacity || "";
        this.maxOpacityInput.node().value = this.compositeDataObj.maxOpacity || "";
        this.smoothingInput.node().value = this.compositeDataObj.smoothing || "";
        this.shiftInput.node().value = this.compositeDataObj.bpShift || "";
        if (this.compositeDataObj.hideSense && this.compositeDataObj.hideAnti) {
            this.closeEyeIcon()
        } else {
            this.openEyeIcon()
        };
        this.uploadLabel.text(
            this.compositeDataObj.filesLoaded === 1 ? "1 file loaded" : this.compositeDataObj.filesLoaded + " files loaded"
        )
    } 

    openEyeIcon() {
        this.row.select(".eye-open").style("display", null);
        this.row.select(".eye-closed").style("display", "none")
    }

    closeEyeIcon() {
        this.row.select(".eye-open").style("display", "none");
        this.row.select(".eye-closed").style("display", null)
    }

    disableDrag() {
        this.row.attr("draggable", false)
    }

    enableDrag() {
        this.row.attr("draggable", true)
    }

    mouseHighlight() {
        this.row.classed("mouse-highlight", true)
    }

    mouseUnhighlight() {
        this.row.classed("mouse-highlight", false)
    }

    fileDragHighlight() {
        this.row.classed("file-drag-highlight", true)
    }

    fileDragUnhighlight() {
        this.row.classed("file-drag-highlight", false)
    }

    directDropEvent(ev) {
        ev.preventDefault();
        if (ev.dataTransfer.items[0].kind === "file") {
            const files = [];
            for (let i = 0; i < ev.dataTransfer.items.length; i++) {
                files.push(ev.dataTransfer.items[i].getAsFile())
            };
            this.loadFiles(files)
        } else {
            this.insertRow(parseInt(ev.dataTransfer.getData("text/plain")), ev.clientY);
            dataObj.updateCompositeData(tableObj.rows.map(row => row.compositeDataObj));
            plotObj.updatePlot()
        }
    }

    async loadFiles(files) {
        await this.compositeDataObj.loadFiles(files)
        await dataObj.autoscaleAxisLimits();
        xAxisInputObj.update();
        yAxisInputObj.update();
        plotObj.updatePlot();
        legendObj.updateLegend();
        this.updateInputs()
    }

    insertRow(dragIdx, dropY) {
        let {y, height} = this.row.node().getBoundingClientRect();
        if (dropY > y + (height / 2)) {
            tableObj.insertRowAfter(dragIdx, this.idx)
        } else {
            tableObj.insertRowBefore(dragIdx, this.idx)
        }
    }

    remove() {
        this.row.remove()
    }
}