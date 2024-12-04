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
        this.row.append("td").append("div")
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
        this.row.append("td").append("div")
            .classed("name-div", true)
            .attr("contenteditable", true)
            .text(this.compositeDataObj.name)
            .on("input", function(ev) {
                self.compositeDataObj.changeName(ev.target.textContent);
                plotObj.updatePlot()
            })
            .on("mousedown", function() {self.disableDrag()})
            .on("mouseup", function() {self.enableDrag()})
            .on("mouseleave", function() {self.enableDrag()});

        // Add the color column
        const color_col = this.row.append("td").classed("color-col", true);
        color_col.append("input")
            .attr("type", "color")
            .classed("color-1", true)
            .attr("value", this.compositeDataObj.primaryColor)
            .on("change", function(ev) {
                self.compositeDataObj.changePrimaryColor(ev.target.value);
                if (self.compositeDataObj.secondaryColor === null) {
                    color_col.select(".color-2").attr("value", ev.target.value)
                };
                plotObj.updatePlot()
            });
        if (dataObj.separateColors) {
            color_col.append("input")
                .attr("type", "color")
                .classed("color-2", true)
                .attr("value", this.compositeDataObj.secondaryColor || this.compositeDataObj.primaryColor)
                .on("change", function(ev) {
                    self.compositeDataObj.changeSecondaryColor(ev.target.value);
                    plotObj.updatePlot()
                })
        };
        
        // Add the scale column
        const scale_div = this.row.append("td").append("div")
            .classed("slider-div", true);
            scale_div.append("label")
            .text("Scale:");
        scale_div.append("input")
            .attr("type", "text")
            .classed("setting-text", true)
            .attr("value", this.compositeDataObj.scale)
            .on("change", function(ev) {
                const scale = roundNearestWithPrecision(ev.target.value)
                ev.target.value = scale.toPrecision(2);
                scale_div.select(".scale-slider").attr("value", Math.log10(scale) * 50 + 50);
                self.compositeDataObj.changeScale(scale);
                plotObj.updatePlot()
            })
            .on("mousedown", function() {self.disableDrag()})
            .on("mouseup", function() {self.enableDrag()})
            .on("mouseleave", function() {self.enableDrag()});
        scale_div.append("input")
            .attr("type", "range")
            .classed("scale-slider", true)
            .attr("value", Math.log10(this.compositeDataObj.scale) * 50 + 50)
            .attr("min", 0)
            .attr("max", 100)
            .on("input", function(ev) {
                const scale = roundNearestWithPrecision(Math.pow(10, (ev.target.value - 50) / 50));
                scale_div.select(".setting-text").attr("value", scale.toPrecision(2));
                self.compositeDataObj.changeScale(scale);
                plotObj.updatePlot()
            })
            .on("mousedown", function() {self.disableDrag()})
            .on("mouseup", function() {self.enableDrag()});
        
        // Add the opacity column
        const opacity_col = this.row.append("td");
        opacity_col.append("label")
            .text("Opacity:");
        opacity_col.append("input")
            .attr("type", "text")
            .classed("setting-text", true)
            .attr("value", this.compositeDataObj.minOpacity || "")
            .on("change", function(ev) {
                const minOpacity = !isNaN(parseFloat(ev.target.value)) ? parseFloat(ev.target.value) : null;
                self.compositeDataObj.changeMinOpacity(minOpacity);
                plotObj.updatePlot();
            })
            .on("mousedown", function() {self.disableDrag()})
            .on("mouseup", function() {self.enableDrag()})
            .on("mouseleave", function() {self.enableDrag()});
        opacity_col.append("span")
            .text(" - ");
        opacity_col.append("input")
            .attr("type", "text")
            .classed("setting-text", true)
            .attr("value", this.compositeDataObj.maxOpacity || "")
            .on("change", function(ev) {
                const maxOpacity = !isNaN(parseFloat(ev.target.value)) ? parseFloat(ev.target.value) : null;
                self.compositeDataObj.changeMaxOpacity(maxOpacity);
                plotObj.updatePlot()
            })
            .on("mousedown", function() {self.disableDrag()})
            .on("mouseup", function() {self.enableDrag()})
            .on("mouseleave", function() {self.enableDrag()});
        
        // Add the smoothing column
        const smoothing_col = this.row.append("td");
        smoothing_col.append("label")
                .text("Smoothing:");
        smoothing_col.append("input")
            .attr("type", "text")
            .classed("setting-text", true)
            .attr("value", this.compositeDataObj.smoothing || "")
            .on("change", function(ev) {
                const smoothing = parseInt(ev.target.value) > 0 ? parseInt(ev.target.value) : null;
                self.compositeDataObj.changeSmoothing(smoothing);
                plotObj.updatePlot()
            })
            .on("mousedown", function() {self.disableDrag()})
            .on("mouseup", function() {self.enableDrag()})
            .on("mouseleave", function() {self.enableDrag()});
        
        // Add the bp shift column
        const bpShift_col = this.row.append("td");
        bpShift_col.append("label")
            .text("BP Shift:");
        bpShift_col.append("input")
            .attr("type", "text")
            .classed("setting-text", true)
            .attr("value", this.compositeDataObj.bpShift || "")
            .on("change", function(ev) {
                const bpShift = !isNaN(parseInt(ev.target.value)) ? parseInt(ev.target.value) : null;
                self.compositeDataObj.changeBpShift(bpShift);
                plotObj.updatePlot()
            })
            .on("mousedown", function() {self.disableDrag()})
            .on("mouseup", function() {self.enableDrag()})
            .on("mouseleave", function() {self.enableDrag()});

        // Add hide icon
        const hide_col = this.row.append("td").classed("hide-col", true),
            eye_open_icon = hide_col.append("div")
                .classed("hide-container", true)
                .attr("title", "Hide")
                .on("click", function() {
                    self.compositeDataObj.changeHideSense(true);
                    self.compositeDataObj.changeHideAnti(true);
                    plotObj.updatePlot();

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
        eye_open_icon.append("path")
            .attr("d", "M-100 0C-50 60 50 60 100 0C50 -60 -50 -60 -100 0")
            .attr("fill", "none")
            .attr("stroke", "black")
            .attr("stroke-width", 3);
        eye_open_icon.append("circle")
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("r", 30)
            .attr("fill", "black")
            .attr("stroke", "none");
        const eye_closed_icon = hide_col.append("div")
            .classed("hide-container", true)
            .attr("title", "Show")
            .on("click", function() {
                self.compositeDataObj.changeHideSense(false);
                self.compositeDataObj.changeHideAnti(false);
                plotObj.updatePlot();

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
        eye_closed_icon.append("path")
            .attr("d", "M-100 0C-50 60 50 60 100 0M-66.77 27.7L-74.21 40.78M-24.62 42.82L-27.26 57.58M24.62 42.82L27.26 57.58M66.77 27.7L74.21 40.78")
            .attr("fill", "none")
            .attr("stroke", "black")
            .attr("stroke-width", 3);

        // Add file upload column
        const upload_col = this.row.append("td"),
            file_input = upload_col.append("input")
                .attr("type", "file")
                .property("multiple", true)
                .style("display", "none")
                .on("change", async function(ev) {
                    await self.compositeDataObj.loadFiles(ev.target.files);
                    await dataObj.autoscaleAxisLimits();
                    plotObj.updatePlot();
                    self.updateFilesLoaded()
                });
        upload_col.append("button")
            .classed("upload-button", true)
            .attr("title", "Upload file(s)")
            .on("click", function() {$(file_input.node()).click()})
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
        upload_col.append("label")
            .classed("upload-label", true)
            .style("padding-left", "10px")
            .text(this.compositeDataObj.filesLoaded === 1 ? this.compositeDataObj.filesLoaded + " file loaded" :
                this.compositeDataObj.filesLoaded + " files loaded");
        
        this.updateFilesLoaded()
    }

    updateIndex(idx) {
        this.idx = idx
    }

    updateFilesLoaded() {
        this.row.select(".upload-label").text(
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

    async directDropEvent(ev) {
        ev.preventDefault();
        if (ev.dataTransfer.items[0].kind === "file") {
            const files = [];
            for (let i = 0; i < ev.dataTransfer.items.length; i++) {
                files.push(ev.dataTransfer.items[i].getAsFile())
            };
            await this.compositeDataObj.loadFiles(files);
            await dataObj.autoscaleAxisLimits();
            plotObj.updatePlot();
            this.updateFilesLoaded()
        } else {
            this.insertRow(parseInt(ev.dataTransfer.getData("text/plain")), ev.clientY);
            dataObj.updateCompositeData(tableObj.rows.map(row => row.compositeDataObj).reverse());
            plotObj.updatePlot()
        }
    }

    insertRow(dragIdx, dropY) {
        let {y, height} = this.row.node().getBoundingClientRect();
        if (dropY > y + (height / 2)) {
            tableObj.insertRowAfter(dragIdx, this.idx)
        } else {
            tableObj.insertRowBefore(dragIdx, this.idx)
        }
    }
}