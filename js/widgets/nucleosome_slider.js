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
            this.attachEventHandlers();
            this.plotNucleosome();
            this.start = 0;
            this.bpToPx = 0;
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
                if (this.selectedElement.getAttribute("class").includes("nucleosome-coord")){
                    var mousePos = this.getMousePosition(e);
                    var currentX = parseFloat(this.selectedElement.getAttribute("x"));
                    var newX = currentX + (mousePos.x - this.offset.x) / 146 * 100;
                    this.selectedElement.setAttribute("x", newX + "%");
                    this.offset = this.getMousePosition(e);
                    this._updateTextBox();
                    this.plotNucleosome();
                    console.log(newX)
                } else {
                    var mousePos = this.getMousePosition(e);
                    var currentX = parseFloat(this.selectedElement.getAttribute("x"));
                    var newX = currentX + (mousePos.x - this.offset.x);
                    console.log(this.selectedElement.getAttribute("id"));
                    this.selectedElement.setAttribute("x", newX + "px");
                    this.offset = this.getMousePosition(e);
                    this._updateTextBox();
                    this.start = parseInt((newX - 165) * (1 / this.bpToPx));
                }
                
            }
        },

        endDragging: function() {
            this.selectedElement = null;
        },

        _updateTextBox: function() {
            let projectionCoords = this.svg.selectAll(".projection-coord");
            let positions = projectionCoords.nodes().map((element) => parseInt(parseFloat(element.getAttribute("x")) * 1.46));
            this.projection_text.property("value", positions.join(","));
            let markCoords = this.svg.selectAll(".mark-coord");
            positions = markCoords.nodes().map((element) => parseInt(parseFloat(element.getAttribute("x")) * 1.46));
            this.mark_text.property("value", positions.join(","));
            this.start_text.property("value", this.start);
            this.plotNucleosome();
        },

        attachEventHandlers: function() {
            const self = this;
            this.projection_text.on("input", function() {
                self.svg.selectAll(".projection-coord").remove();
                if (self.projection_text.property("value") !== "") {
                    let projections = self.projection_text.property("value").split(",");
                    let i = 0;
                    for (var coord of projections) {
                        if (coord > -1) {
                            self.svg.append("rect")
                                .attr("id", "projection-coord-" + i)
                                .attr("class", "projection-coord nucleosome-coord")
                                .attr("width", "5px")
                                .attr("x", coord / 146 * 100 + "%")
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
                self.plotNucleosome();
            });

            this.mark_text.on("input", function() {
                self.svg.selectAll(".mark-coord").remove();
                if (self.mark_text.property("value") !== "") {
                    let projections = self.mark_text.property("value").split(",");
                    let i = 0;
                    for (var coord of projections) {
                        if (coord > -1) {
                            self.svg.append("rect")
                                .attr("id", "mark-coord-" + i)
                                .attr("class", "mark-coord nucleosome-coord")
                                .attr("width", "5px")
                                .attr("x", coord / 146 * 100 + "%")
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
        },

        plotNucleosome: function() {
            let self = this;
            d3.select("#main-plot")
                .selectAll(".nucleosome-svg")
                .remove();
            let nucleosome_svg = d3.select("#nucleosome-svg").node();
            let newNucleosomeSvg = d3.select(nucleosome_svg.cloneNode(true));
            let scale = $("#main-plot").main_plot("get_xscale");
            let dimensions = $("#main-plot").main_plot("get_dimensions");
            this.start = d3.select("#nucleosome-start-text").property("value");
            let newHeight = 18;
            this.bpToPx = (dimensions[1] - dimensions[2] - dimensions[4]) / (scale.domain()[1] - scale.domain()[0]);
            newWidth = 146 * this.bpToPx;
            let startingCoord = scale(0) + this.start * this.bpToPx;
            newNucleosomeSvg.attr("height", newHeight + "px")
                .attr("width", newWidth + "px")
                .attr("y", (dimensions[0] - newHeight) / 2 - 2 + "px")
                .attr("x", (startingCoord + "px"))
                .attr("id", "nucleosome-svg-plot")
                .selectAll(".nucleosome-coord")
                    .attr("width", "2px");
            newNucleosomeSvg.on("mousedown", function(e) {
                self.startDragging(e, d3.select("#nucleosome-svg-plot").node());
                console.log(d3.select("#nucleosome-svg-plot").node().getAttribute("x"));
            });
            newNucleosomeSvg.on("mousemove", function(e) {
                self.drag(e);
            });
            newNucleosomeSvg.on("mouseup", function() {
                self.endDragging();
            });
        
            d3.select("#main-plot")
                .node()
                .appendChild(newNucleosomeSvg.node());
        }
    });
    $("#nucleosome-slider").nucleosome_slider();
});
