const nucleosomeSlider = class {
    constructor(width=146, height=18, lineColor="#FFFC61") {
        this.width = width;
        this.height = height;
        this.lineColor = lineColor;

        this.mainPlot = plotObj._elements.mainPlot;

        const self = this;
        this.selectedElement = null;
        this.xOffset = null;

        const mask = this.mainPlot.append("mask")
            .attr("id", "nucleosome-mask");
        mask.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", plotObj.width)
            .attr("height", plotObj.height)
            .attr("fill", "#000000");
        mask.append("rect")
            .attr("x", plotObj.margins.left)
            .attr("y", plotObj.margins.top)
            .attr("width", plotObj.width - plotObj.margins.left - plotObj.margins.right)
            .attr("height", plotObj.height - plotObj.margins.top - plotObj.margins.bottom)
            .attr("fill", "#FFFFFF");
        this.nucleosomeGroup = this.mainPlot.append("g")
            .attr("mask", "url(#nucleosome-mask)");
        this.nucleosomeRect = this.nucleosomeGroup.append("rect")
            .attr("id", "nucleosome-rect")
            .attr("width", this.width / (dataObj.globalSettings.xmax - dataObj.globalSettings.xmin) *
                (plotObj.width - plotObj.margins.right - plotObj.margins.left))
            .attr("height", this.height)
            .on("mousedown", function(ev) {
                self.selectedElement = d3.select(this);
                const {x: plotX, width} = self.mainPlot.node().getBoundingClientRect(),
                    mouseX = (ev.clientX - plotX) * plotObj.width / width;
                self.xOffset = Math.round(plotObj.xscale.invert(mouseX)) - dataObj.nucleosomeSlider.x
            });
        this.nucleosomeLines = this.nucleosomeGroup.append("g");

        $(this.mainPlot.node()).on("mousemove", function(ev) {
            if (self.selectedElement === null) {
                return
            };
            const {x: plotX, width} = self.mainPlot.node().getBoundingClientRect(),
                mouseX = (ev.clientX - plotX) * plotObj.width / width;
            if (self.selectedElement.attr("id") === "nucleosome-rect") {
                const x = Math.round(plotObj.xscale.invert(mouseX)) - self.xOffset;
                dataObj.nucleosomeSlider.x = Math.max(dataObj.globalSettings.xmin,
                    Math.min(dataObj.globalSettings.xmax - self.width, x));
            } else {
                const idx = self.selectedElement.attr("index"),
                    x = Math.round(plotObj.xscale.invert(mouseX)) - dataObj.nucleosomeSlider.x;
                dataObj.nucleosomeSlider.lines[idx] = Math.max(0, Math.min(self.width, x))
            };
            self.updateNucleosomeSlider();
            nucleosomeSliderInputObj.update()
        }).on("mouseup", function() {
            self.selectedElement = null;
            self.xOffset = null
        });

        this.updateNucleosomeSlider()
    }

    updateNucleosomeSlider() {
        const self = this;
        this.nucleosomeGroup.attr("display", nucleosomeSliderActive ? null : "none");
        this.nucleosomeRect
            .attr("x", plotObj.xscale(dataObj.nucleosomeSlider.x))
            .attr("y", plotObj.yscale(0) - this.height / 2);
        this.nucleosomeLines.selectAll("rect").data(dataObj.nucleosomeSlider.lines).join("rect")
            .classed("nucleosome-marker", true)
            .attr("index", (d, i) => i)
            .attr("x", d => plotObj.xscale(dataObj.nucleosomeSlider.x + d - 1) - 1)
            .attr("y", plotObj.yscale(0) - this.height / 2)
            .attr("width", 2)
            .attr("height", this.height)
            .attr("fill", this.lineColor)
            .attr("stroke", "#000000")
            .attr("stroke-width", .5)
            .on("mousedown", function() {self.selectedElement = d3.select(this)});
    }
};

const nucleosomeSliderObj = new nucleosomeSlider();