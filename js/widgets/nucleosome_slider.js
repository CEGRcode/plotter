$(function() {
    $.widget("composite_plot.nucleosome_slider", {
        _create: function() {
            this.projection_text = d3.select("#nucleosome-projection-text");
            this.mark_text = d3.select("#mark-nucleosome-text");
            this.start_text = d3.select("#nucleosome-start-text");
            this.svg = d3.select("#nucleosome-svg");
            this.CTM = this.svg.node().getScreenCTM();
            this.plot_CTM = d3.select("#main-plot").node().getScreenCTM();
            this.selectedElement = null;
            this.offset = { x: 0, y: 0 };
            this.startCoord = 0;
            this.bpToPx = 0;
            this.nucleosome_length = 146;
            this.plot_svg_height = 18;
            this.main_plot_scale = $("#main-plot").main_plot("get_xscale");
            this.plot_dimensions = $("#main-plot").main_plot("get_dimensions");
            this.attachEventHandlers();
            this.plotNucleosome();
        },

        getMousePosition: function(e) {
            if (this.selectedElement.getAttribute("class").includes("nucleosome-coord")){
                return {
                    x: (e.clientX - this.CTM.e) / this.CTM.a,
                }; 
            } else {
                return {
                    x: (e.clientX - this.plot_CTM.e) / this.plot_CTM.a,
                }
            }
        },

        startDragging: function(e, element) {
            this.selectedElement = element;
            this.offset = this.getMousePosition(e);
        },

        drag: function(e) {
            if (this.selectedElement) {
                var mousePos = this.getMousePosition(e);
                var currentX = parseFloat(this.selectedElement.getAttribute("x"));
                if (this.selectedElement.getAttribute("class").includes("svg-coord")){
                    if (this.selectedElement.getAttribute("class").includes("mark-coord")){
                        var newX = currentX + (mousePos.x - this.offset.x) / this.nucleosome_length * 100;
                        this.selectedElement.setAttribute("x", newX + "%");
                        this.updateCoordTextBox();
                    } else if (this.selectedElement.getAttribute("class").includes("projection-coord")){
                        var newX = currentX + (mousePos.x - this.offset.x) / this.nucleosome_length * 100;
                        this.selectedElement.setAttribute("x", newX + "%");
                        this.updateCoordTextBox();
                        this.plotProjectionCoords();
                    }
                } else if (this.selectedElement.getAttribute("class").includes("nucleosome-svg")) {
                    var newX = currentX + (mousePos.x - this.offset.x);
                    this.selectedElement.setAttribute("x", newX + "px");
                    this.startCoord = parseInt((newX - this.main_plot_scale(0)) * (1 / this.bpToPx));
                    this.start_text.property("value", this.startCoord);
                    this.updateCoordTextBox();
                    this.svgProjectionCoords();
                } else if (this.selectedElement.getAttribute("class").includes("plotted-coord")) {
                    var newX = currentX + (mousePos.x - this.offset.x);
                    this.selectedElement.setAttribute("x", newX + "px");
                    this.updateCoordTextBox();
                    this.svgProjectionCoords();
                }
                this.offset = this.getMousePosition(e);
            }
        },

        endDragging: function() {
            this.selectedElement = null;
        },

        updateCoordTextBox: function() {
            // let projectionCoords = this.svg.selectAll(".projection-coord");
            // let positions = projectionCoords.nodes().map((element) => parseInt(parseFloat(element.getAttribute("x")) * this.nucleosome_length * .01));
            // this.projection_text.property("value", positions.join(","));
            const self = this;
            let start = this.startCoord;
            if (this.selectedElement.getAttribute("class").includes("svg-coord")){
                if (this.selectedElement.getAttribute("class").includes("mark-coord")){
                    let markCoords = this.svg.selectAll(".mark-coord");
                    let positions = markCoords.nodes().map((element) => parseInt(parseFloat(element.getAttribute("x")) * this.nucleosome_length * .01));
                    this.mark_text.property("value", positions.join(","));
                } else if (this.selectedElement.getAttribute("class").includes("projection-coord")){
                    let plottedCoords = this.svg.selectAll(".projection-coord");
                    let positions = plottedCoords.nodes().map((element) => parseInt(parseFloat(element.getAttribute("x")) * this.nucleosome_length * .01 + parseInt(start)));
                    this.projection_text.property("value", positions.join(","));
                    console.log(self.startCoord)
                }
            } else if (this.selectedElement.getAttribute("class").includes("plotted-coord")) {
                let plottedCoords = d3.select("#coord-svg-layer").selectAll(".plotted-coord");
                let positions = plottedCoords.nodes().map((element) => parseInt(parseFloat(element.getAttribute("x")) - this.main_plot_scale(0)) * (1 / this.bpToPx));
                this.projection_text.property("value", positions.join(","));
            }
        },

        attachEventHandlers: function() {
            const self = this;
            this.projection_text.on("input", function() {
                self.plotProjectionCoords();
                self.svgProjectionCoords();
            });
            this.start_text.on("input", function() {
                self.plotNucleosome();
            });
            this.addSVGMarkCoords();
        },

        plotNucleosome: function() {
            let self = this;
            this.updatePlotStats();
            //Remove existing images
            d3.select("#nucleosome-svg-layer")
                .selectAll(".nucleosome-svg")
                .remove();
            
            //Clone existing svg
            let nucleosome_svg = this.svg.node();
            let newNucleosomeSvg = d3.select(nucleosome_svg.cloneNode(true));

            //Calculate dimensions
            this.startCoord = d3.select("#nucleosome-start-text").property("value");
            let newWidth = this.nucleosome_length * this.bpToPx;
            let startingPos = this.main_plot_scale(0) + this.startCoord * this.bpToPx;
            newNucleosomeSvg.attr("height", self.plot_svg_height + "px")
                .attr("width", newWidth + "px")
                .attr("y", (self.plot_dimensions[0] - self.plot_svg_height) / 2 - 2 + "px")
                .attr("x", (startingPos + "px"))
                .attr("id", "nucleosome-svg-plot")
                .selectAll(".mark-coord")
                    .attr("width", "2px")
            newNucleosomeSvg.selectAll(".projection-coord")
                    .remove();
            
            //Add dragging listeners
            newNucleosomeSvg.on("mousedown", function(e) {
                self.startDragging(e, d3.select("#nucleosome-svg-plot").node());
            });
            d3.select("#main-plot").on("mousemove", function(e) {
                self.drag(e);
            });
            d3.select("#main-plot").on("mouseup", function() {
                self.endDragging();
            });

            //Add to plot
            d3.select("#nucleosome-svg-layer")
                .node()
                .appendChild(newNucleosomeSvg.node());
        },

        updatePlotStats(){
            this.main_plot_scale = $("#main-plot").main_plot("get_xscale");
            this.plot_dimensions = $("#main-plot").main_plot("get_dimensions");
            this.bpToPx = (this.plot_dimensions[1] - this.plot_dimensions[2] - this.plot_dimensions[4]) / (this.main_plot_scale.domain()[1] - this.main_plot_scale.domain()[0]);
        },

        plotProjectionCoords(){
            const self = this;
            d3.select("#coord-svg-layer").selectAll(".plotted-coord").remove();
            if (self.projection_text.property("value") !== "") {
                let projections = self.projection_text.property("value").split(",");
                let i = 0;
                for (var coord of projections) {
                    d3.select("#coord-svg-layer").append("rect")
                            .attr("id", "projection-coord-" + i)
                            .attr("class", "projection-coord plotted-coord")
                            .attr("width", "2px")
                            .attr("stroke-width", "1px")
                            .attr("stroke", "black")
                            .attr("x", self.main_plot_scale(0) + coord * self.bpToPx - .5 + "px")
                            .attr("y", (self.plot_dimensions[0] - self.plot_svg_height) / 2 - 2 + "px")
                            .attr("height", self.plot_svg_height + "px")
                            .style("fill", "rgb(255, 252, 97)")
                            .on("mousedown", function(e) {
                                self.startDragging(e, d3.select(this).node());
                            })
                    i += 1;
                }
                d3.select("#main-plot")
                    .on("mousemove", function(e) {
                        self.drag(e);
                    })
                    .on("mouseup", function() {
                        self.endDragging();
                    });
            }
            self.plotNucleosome();
        },

        svgProjectionCoords(){
            const self = this;
            self.svg.selectAll(".projection-coord").remove();
            if (self.projection_text.property("value") !== "") {
                let projections = self.projection_text.property("value").split(",");
                let i = 0;
                for (var coord of projections) {
                    if (coord > -1) {
                        self.svg.append("rect")
                            .attr("id", "mark-coord-" + i)
                            .attr("class", "projection-coord svg-coord")
                            .attr("width", "5px")
                            .attr("x", (coord - self.startCoord) / self.nucleosome_length * 100 - 2.5 + "%")
                            .attr("height", "100%")
                            .style("fill", "rgb(255, 252, 97)")
                            .on("mousedown", function(e) {
                                self.startDragging(e, this);
                            });
                    }
                    i += 1;
                }

                self.svg.on("mousemove", function(e) {
                    self.drag(e);
                });
                self.svg.on("mouseup", function() {
                    self.endDragging();
                });
            }
        },

        addSVGMarkCoords() {
            const self = this;
            this.mark_text.on("input", function() {
                self.svg.selectAll(".mark-coord").remove();
                if (self.mark_text.property("value") !== "") {
                    let projections = self.mark_text.property("value").split(",");
                    let i = 0;
                    for (var coord of projections) {
                        if (coord > -1) {
                            self.svg.append("rect")
                                .attr("id", "mark-coord-" + i)
                                .attr("class", "mark-coord svg-coord")
                                .attr("width", "5px")
                                .attr("x", coord / self.nucleosome_length * 100 - 2.5 + "%")
                                .attr("height", "100%")
                                .style("fill", "rgb(205, 233, 255)")
                                .on("mousedown", function(e) {
                                    self.startDragging(e, this);
                                });
                        }
                        i += 1;
                    }
                    self.svg.on("mousemove", function(e) {
                        self.drag(e);
                    });
                    self.svg.on("mouseup", function() {
                        self.endDragging();
                    });
                }
                self.plotNucleosome();
            });
            this.start_text.on("input", function() {
                self.plotNucleosome();
            });
        }
    });
    $("#nucleosome-slider").nucleosome_slider();
});
