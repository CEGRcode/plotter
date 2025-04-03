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
            .append("i")
                .classed("drag-icon fa-solid fa-2xl fa-bars", true);
                // .classed("drag-icon fa-solid fa-2xl fa-grip-lines", true);

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
                    colorCol.select(".color-2").node().value = ev.target.value
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
        const scaleDiv = this.row.append("td")
            .classed("scale-col", true)
            .append("div")
                .classed("slider-div", true);
        this.scaleTextInput = scaleDiv.append("input")
            .attr("type", "text")
            .classed("setting-text", true)
            .on("change", function(ev) {
                const scale = roundNearestWithPrecision(ev.target.value)
                ev.target.value = scale.toPrecision(2);
                scaleDiv.select(".scale-slider").node().value = Math.log10(scale) * 50 + 50;
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
                scaleDiv.select(".setting-text").node().value = scale.toPrecision(2);
                self.compositeDataObj.changeScale(scale);
                plotObj.updatePlot()
            })
            .on("mousedown", function() {self.disableDrag()})
            .on("mouseup", function() {self.enableDrag()});
        // Add the opacity column
        const opacityCol = this.row.append("td").classed("opacity-col", true);
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

        // Add swap icon
        const swapCol = this.row.append("td").classed("swap-col", true);
        this.swapIcon = swapCol.append("div")
            .classed("swap-container", true)
            .attr("title", "Swap strands")
            .on("click", function() {
                self.compositeDataObj.changeSwap(!self.compositeDataObj.swap);
                plotObj.updatePlot();

                self.swapIcon.classed("grayed", !self.compositeDataObj.swap)
            })
            .append("svg")
                .classed("swap-icon", true)
                .attr("baseProfile", "full")
                .attr("viewBox", "0 0 100 100")
                .attr("version", "1.1")
                .attr("xmlns", "http://www.w3.org/2000/svg");
        this.swapIcon.append("path")
            .attr("d", "M77.323 37.277L62.15 52.447h9.934c-.377 8.756-7.598 15.769-16.445 15.769h-37.3v10.409h37.3c14.589 0 26.492-11.68 26.872-26.178H92.5l-15.177-15.17z")
            .attr("fill", "#D2042D");
        this.swapIcon.append("path")
            .attr("d", "M17.489 47.553H7.5l15.177 15.17 15.173-15.17h-9.934c.377-8.756 7.598-15.769 16.445-15.769h37.3V21.375h-37.3c-14.588 0-26.492 11.68-26.872 26.178z")
            .attr("fill", "#0047AB");

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
            .append("i")
                .classed("hide-icon eye-open fas fa-2xl fa-eye", true)
                .classed("", true)
                .classed("", true);
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
            .append("i")
                .classed("hide-icon eye-closed fas fa-2xl fa-eye-slash", true);

        // Add sticky column
        const stickyCol = this.row.append("td").classed("sticky-col", true);
        this.stickyIcon = stickyCol.append("div")
            .classed("sticky-container", true)
            .attr("title", "Unsticky")
            .on("click", function() {
                self.compositeDataObj.changeSticky(false);
                self.row.classed("sticky", false);
                tableObj.updateStickyRows();
                self.disableSticky()
            })
            .append("i")
                .classed("sticky-icon fa-solid fa-thumbtack", true);
        this.noStickyIcon = stickyCol.append("div")
            .classed("sticky-container", true)
            .attr("title", "Sticky")
            .on("click", function() {
                self.compositeDataObj.changeSticky(true);
                self.row.classed("sticky", true);
                tableObj.updateStickyRows();
                self.enableSticky()
            })
            .append("i")
                .classed("sticky-icon fa-solid fa-thumbtack-slash", true);

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
            .append("i")
            .classed("upload-icon fas fa-upload", true);
        this.uploadLabel = uploadCol.append("label")
            .classed("upload-label", true)
            .style("padding-left", "10px");

        // Add clear data column
        this.row.append("td").append("button")
            .classed("clear-button", true)
            .text("Clear")
            .on("click", function() {
                for (const id of self.compositeDataObj.ids) {
                    compositeLoaderObj.referenceCounter[id]--
                };
                self.compositeDataObj.clearData();
                plotObj.updatePlot();
                legendObj.updateLegend();
                self.updateInputs()
            });

        // Add remove column
        const removeIcon = this.row.append("td").append("i")
            .classed("remove-icon fa-solid fa-2xl fa-times-circle", true)
            .on("click", function() {
                for (const id of self.compositeDataObj.ids) {
                    compositeLoaderObj.referenceCounter[id]--
                };
                tableObj.removeRow(self.idx);
                dataObj.removeCompositeData(self.idx);
                plotObj.updatePlot();
                legendObj.updateLegend();
                tableObj.updateStickyRows()
            });
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
        this.swapIcon.classed("grayed", !this.compositeDataObj.swap);
        
        if (this.compositeDataObj.hideSense && this.compositeDataObj.hideAnti) {
            this.closeEyeIcon()
        } else {
            this.openEyeIcon()
        };
        if (this.compositeDataObj.sticky) {
            this.row.classed("sticky", true);
            this.enableSticky()
        } else {
            this.row.classed("sticky", false);
            this.disableSticky()
        };

        this.uploadLabel.text(
            this.compositeDataObj.filesLoaded === 1 ? "1 file loaded" : this.compositeDataObj.filesLoaded + " files loaded"
        )
    } 

    openEyeIcon() {
        this.eyeOpenIcon.classed("hidden", false);
        this.eyeClosedIcon.classed("hidden", true)
    }

    closeEyeIcon() {
        this.eyeOpenIcon.classed("hidden", true);
        this.eyeClosedIcon.classed("hidden", false)
    }

    enableSticky() {
        this.stickyIcon.classed("hidden", false);
        this.noStickyIcon.classed("hidden", true)
    }

    disableSticky() {
        this.stickyIcon.classed("hidden", true);
        this.noStickyIcon.classed("hidden", false)
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
        referenceLinesObj.updateReferenceLines();
        nucleosomeSliderObj.updateNucleosomeSlider();
        this.updateInputs()
    }

    insertRow(dragIdx, dropY) {
        const {y, height} = this.row.node().getBoundingClientRect();
        if (dropY > y + (height / 2)) {
            dataObj.moveCompositeData(dragIdx, this.idx - (this.idx >= dragIdx) + 1);
            tableObj.insertRowAfter(dragIdx, this.idx)
        } else {
            dataObj.moveCompositeData(dragIdx, this.idx - (this.idx > dragIdx));
            tableObj.insertRowBefore(dragIdx, this.idx)
        }
    }

    remove() {
        this.row.remove()
    }
}