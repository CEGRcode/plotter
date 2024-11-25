const compositeRow = class {
    constructor({row, idx, primaryColor, name=null, separateColors=false, secondaryColor=null, scale=1,
        minOpacity=null, maxOpacity=null, smoothing=null, bpShift=null, shiftOccupancy=0, hideSense=false,
        hideAnti=false, swap=false, ids=[]}) {
        this.row = row;
        this.idx = idx;
        this.name = name || "Composite " + idx;
        this.primaryColor = primaryColor;
        this.secondaryColor = secondaryColor || primaryColor;
        this.scale = scale;
        this.minOpacity = minOpacity;
        this.maxOpacity = maxOpacity;
        this.smoothing = smoothing;
        this.bpShift = bpShift;
        this.shiftOccupancy = shiftOccupancy;
        this.hideSense = hideSense;
        this.hideAnti = hideAnti;
        this.swap = swap;
        this.ids = ids;
        this.filesLoaded = this.ids.length;
        
        const self = this;
        this.row
            .attr("draggable", true)
            .on("dragstart", function() {e.dataTransfer.setData("text/plain", self.idx)});

        // Add the drag column
        this.row.append("td").append("div")
            .classed("drag-col", true)
            .attr("title", "Drag to reorder")
            .append("svg")
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
            .attr("contenteditable", true)
            .text(this.name)
            .style("min-width", "5px");

        // Add the color column
        const color_col = this.row.append("td");
        color_col.append("input")
            .attr("type", "color")
            .classed("color-1", true)
            .attr("value", this.primaryColor);
        if (separateColors) {
            color_col.append("input")
                .attr("type", "color")
                .classed("color-2", true)
                .attr("value", this.secondaryColor)
        };
        
        // Add the scale column
        const scale_div = this.row.append("td").append("div")
            .classed("slider-div", true);
            scale_div.append("label")
            .text("Scale:");
        scale_div.append("input")
            .attr("type", "text")
            .classed("setting-text", true)
            .attr("value", this.scale);
        scale_div.append("input")
            .attr("type", "range")
            .classed("scale-slider", true)
            .attr("value", Math.log10(this.scale) * 50 + 50)
            .attr("min", 0)
            .attr("max", 100);
        
        // Add the opacity column
        const opacity_col = this.row.append("td");
        opacity_col.append("label")
            .text("Opacity:");
        opacity_col.append("input")
            .attr("type", "text")
            .classed("setting-text", true)
            .attr("value", this.minOpacity || "");
        opacity_col.append("input")
            .attr("type", "text")
            .classed("setting-text", true)
            .attr("value", this.maxOpacity || "");
        
        // Add the smoothing column
        const smoothing_col = this.row.append("td");
        smoothing_col.append("label")
                .text("Smoothing:");
        smoothing_col.append("input")
            .attr("type", "text")
            .classed("setting-text", true);
        
        // Add the bp shift column
        const bpShift_col = this.row.append("td");
        bpShift_col.append("label")
            .text("BP Shift:");
        bpShift_col.append("input")
            .attr("type", "text")
            .classed("setting-text", true);

        // Add hide icon
        const hide_col = this.row.append("td"),
            eye_open_icon = hide_col.append("div")
                .attr("title", "Hide")
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
            .attr("title", "Show")
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
                .style("display", "none");
        upload_col.append("button")
            .attr("title", "Upload file(s)")
            .style("width", "35px")
            .style("height", "30px")
            .style("position", "relative")
            .style("text-align", "center")
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
            .style("padding-left", "10px")
            .text(this.filesLoaded === 1 ? this.filesLoaded + " file loaded" : this.filesLoaded + " files loaded");
    }

    loadFiles(files) {

    }
}