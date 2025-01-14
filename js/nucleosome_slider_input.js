const nucleosomeSliderInput = class {
    constructor(elementID) {
        if (document.getElementById(elementID) === null) {
            throw "Element ID " + elementID + " not found"
        };
        this.container = d3.select("#" + elementID);

        const self = this;
        this.nucleosomeMarkerSection = this.container.append("div")
            .classed("nucleosome-marker-section", true)
            .text("Mark positions in nucleosome slider:");
        this.nucleosomeMarkerSection.append("br");
        this.nucleosomeMarkerInput = this.nucleosomeMarkerSection.append("input")
            .attr("type", "text")
            .classed("nucleosome-marker-input", true)
            .on("change", function() {
                if (this.value.trim() === "") {
                    dataObj.nucleosomeSlider.lines = []
                } else {
                    dataObj.nucleosomeSlider.lines = this.value.split(",").map(x => parseInt(x))
                };
                nucleosomeSliderObj.updateNucleosomeSlider();
                self.update()
            });
        
        this.molVizSection = this.container.append("div")
            .classed("mol-viz-section", true);
        this.molVizSection.append("button")
            .text("Generate 3D visual")
            .on("click", this.generate3DVisual)
    }

    generate3DVisual() {
        const nucStart = dataObj.nucleosomeSlider.x,
            nucWidth = nucleosomeSliderObj.width,
            nucLinesI = dataObj.nucleosomeSlider.lines.map(d => d).join(","),
            nucLinesJ = dataObj.nucleosomeSlider.lines.map(d => 2 * nucWidth - d + 1).join(","),
            projectionLinesI = dataObj.referenceLines.verticalLines.map(d => d.x - nucStart + 1)
                .filter(d => d >= 0 && d <= nucWidth).join(","),
            projectionLinesJ = dataObj.referenceLines.verticalLines.map(d => 2 * nucWidth - d.x + nucStart)
                .filter(d => d >= nucWidth && d <= 2 * nucWidth).join(","),
            url = "https://3dmol.org/viewer.html?pdb=2cv5&select=all&style=cartoon:color~gray&select=resi:" + 
                projectionLinesI + ";chain:I&style=cartoon:color~red;stick&select=resi:" +
                projectionLinesJ + ";chain:J&style=cartoon:color~red;stick&select=resi:" +
                nucLinesI + ";chain:I&style=cartoon:color~yellow;stick&select=resi:" + 
                nucLinesJ + ";chain:J&style=cartoon:color~yellow;stick&select=resi:" +
                projectionLinesI + "," + nucLinesI + ";chain:I&labelres=backgroundOpacity:0.8;fontSize:14&select=resi:" + 
                projectionLinesJ + "," + nucLinesJ + ";chain:J&labelres=backgroundOpacity:0.8;fontSize:14";
        window.open(url)
    }

    update() {
        this.nucleosomeMarkerInput.node().value = dataObj.nucleosomeSlider.lines.join(",")
    }
};

const nucleosomeSliderInputObj = new nucleosomeSliderInput("nucleosome-slider-input")