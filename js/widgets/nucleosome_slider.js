$(function() {
    $.widget("composite_plot.nucleosome_slider", {
        _create: function() {
            this.projection_text = d3.select("#nucleosome-projection-text");
            this.mark_text = d3.select("#mark-nucleosome-text");
            this.start_text = d3.select("#nucleosome-start-text");
            this.svg = d3.select("#nucleosome-svg");
            this.start_coord = 0;
            this.nucleosome_length = 146;
            this.plot_svg_height = 18;
            this.main_plot = $("#main-plot").main_plot("instance");
            this.plot_points = null;
            this.projection_coords = [];
            this.mark_coords = [];

            this.attach_event_handlers();

            this.selected_element = null;
            this.offset = { x: 0, y: 0 };
        },

        attach_event_handlers: function() {
            let self = this;
            this.projection_text.on("input", function() {
                self.svg_projection_coords();
                self.plot_projection_coords();
            });
            this.mark_text.on("input", function() {
                self.svg_mark_coords();
            });
            this.start_text.on("input", function() {
                self.plot_nucleosome();
            });
            d3.select("#main-plot")
                .on("mousemove", function(e) {
                    self.drag_plot_element(e);
                })
                .on("mouseup", function() {
                    self.end_dragging();
                });
            self.svg.on("mousemove", function(e) {
                    self.drag_svg_element(e);
                })
                .on("mouseup", function() {
                    self.end_dragging();
                })
                .on("mouseleave", function() {
                    self.end_dragging();
                });
        },

        get_mouse_pos: function(e) {
            //Get mouse position based on selected element
            if (this.selected_element.getAttribute("class").includes("nucleosome-coord")){
                let CTM = this.svg.node().getScreenCTM();
                return {
                    x: (e.clientX - CTM.e) / CTM.a,
                }; 
            } else {
                let plot_CTM = d3.select("#main-plot").node().getScreenCTM();
                return {
                    x: (e.clientX - plot_CTM.e) / plot_CTM.a,
                }
            }
        },

        start_dragging: function(e, element) {
            //Update plot stats and assign selected element
            this.update_plot_stats();
            this.selected_element = element;
            this.offset = this.get_mouse_pos(e);
        },

        drag_svg_element: function(e) {
            if (this.selected_element) {
                var mousePos = this.get_mouse_pos(e);
                var currentX = parseFloat(this.selected_element.getAttribute("x"));
                var newX = currentX + (mousePos.x - this.offset.x) / (this.nucleosome_length * .01);
                this.selected_element.setAttribute("x", newX + "%");
                //Update plot and text box
                if (this.selected_element.getAttribute("class").includes("mark-coord")){
                    this.plot_nucleosome();
                }
                this.update_text_box();
                this.plot_projection_coords();
                this.offset = this.get_mouse_pos(e);
            }
        },

        drag_plot_element: function(e){
            if (this.selected_element){
                var mousePos = this.get_mouse_pos(e);
                var currentX = parseFloat(this.selected_element.getAttribute("x"));
                var newX = currentX + (mousePos.x - this.offset.x);
                //Only drag if valid coord on composite
                if (this.plot_points.get(parseInt(newX))){
                    this.selected_element.setAttribute("x", newX + "px");
                    if (this.selected_element.getAttribute("class").includes("nucleosome-svg")) {
                        //Update start text if selected element is nucleosome
                        this.start_coord = this.main_plot.xscale.invert(newX);
                        this.start_text.property("value", this.start_coord.toFixed(0));
                    } else if (this.selected_element.getAttribute("class").includes("plotted-coord")) {
                        //Otherwise use generic method
                        this.update_text_box();
                    }
                    this.plot_pointers();
                    this.svg_projection_coords();
                    this.offset = this.get_mouse_pos(e);
                } else {
                    //End dragging if not on composite
                    this.end_dragging();
                }
            }
        },

        end_dragging: function() {
            //Reset selected element and update all text and figures
            this.selected_element = null;
            this.update_all();
        },

        update_text_box: function() {
            //Update text values based on selected element
            if (this.selected_element){
                let start = this.start_coord;
                if (this.selected_element.getAttribute("class").includes("svg-coord")){
                    if (this.selected_element.getAttribute("class").includes("mark-coord")){
                        let svg_coords = this.svg.selectAll(".mark-coord");
                        this.mark_coords = svg_coords.nodes().map((element) => parseInt(parseFloat(element.getAttribute("x")) * this.nucleosome_length * .01));
                        this.mark_text.property("value", this.mark_coords.join(","));
                    } else if (this.selected_element.getAttribute("class").includes("projection-coord")){
                        let svg_coords = this.svg.selectAll(".projection-coord");
                        this.projection_coords = svg_coords.nodes().map((element) => parseInt(parseFloat(element.getAttribute("x")) * this.nucleosome_length * .01 + parseInt(start)));
                        this.projection_text.property("value", this.projection_coords.join(","));
                    }
                } else if (this.selected_element.getAttribute("class").includes("plotted-coord")) {
                    let plottedCoords = d3.select("#coord-svg-layer").selectAll(".plotted-coord");
                    this.projection_coords = plottedCoords.nodes().map((element) => this.main_plot.xscale.invert(parseInt(element.getAttribute("x"))).toFixed(0));
                    this.projection_text.property("value", this.projection_coords.join(","));
                }
            }
        },

        plot_nucleosome: function() {
            let self = this;
            //Remove existing images
            d3.select("#nucleosome-svg-layer")
                .selectAll(".nucleosome-svg")
                .remove();
            //Clone svg
            let nucleosome_svg = this.svg.node();
            let new_nucleosome = d3.select(nucleosome_svg.cloneNode(true));
            //Calculate dimensions
            this.start_coord = d3.select("#nucleosome-start-text").property("value");
            let new_width = this.nucleosome_length * (this.main_plot.xscale(1) - this.main_plot.xscale(0));
            let starting_pos = this.main_plot.xscale(this.start_coord);
            new_nucleosome.attr("height", self.plot_svg_height + "px")
                .attr("width", new_width + "px")
                .attr("x", starting_pos + "px")
                .attr("id", "nucleosome-svg-plot")
                .attr("y", this.main_plot.yscale(0) - self.plot_svg_height / 2)
                .selectAll(".mark-coord")
                    .attr("width", "2px")
                    .attr("stroke-width", "1px")
            new_nucleosome.selectAll(".projection-coord")
                    .remove();
            //Add dragging listeners
            new_nucleosome.on("mousedown", function(e) {
                self.start_dragging(e, d3.select("#nucleosome-svg-plot").node());
            });
            d3.select("#main-plot").on("mousemove", function(e) {
                self.drag_plot_element(e);
            });
            d3.select("#main-plot").on("mouseup", function() {
                self.end_dragging();
            });
            //Add to plot
            d3.select("#nucleosome-svg-layer")
                .node()
                .appendChild(new_nucleosome.node());    
            //Plot all pointers
            self.plot_pointers();
        },

        plot_projection_coords(){
            //Get new values and remove old coords
            let self = this;
            this.projection_coords = this.projection_text.property("value").split(",");
            d3.select("#coord-svg-layer").selectAll(".plotted-coord").remove();
            if (this.projection_text.property("value") !== "") {
                let i = 0;
                for (var coord of this.projection_coords) {
                    let coordElement = d3.select("#coord-svg-layer").append("rect")
                            .attr("id", "projection-coord-" + i)
                            .attr("class", "projection-coord plotted-coord")
                            .attr("width", "2px")
                            .attr("stroke-width", "1px")
                            .attr("stroke", "black")
                            .attr("x", self.main_plot.xscale(coord))
                            .attr("y", self.main_plot.yscale(0) - self.plot_svg_height / 2) // 2px subtracted to account for outline 
                            .attr("height", self.plot_svg_height + "px")
                            .style("fill", "rgb(255, 252, 97)")
                            .on("mousedown", function(e) {
                                self.start_dragging(e, d3.select(this).node());
                            })
                    i += 1;
                }
            }
            self.plot_nucleosome();
        },

        plot_pointers() {
            //Remove old pointers and add new ones to plot based on widget arrays
            let self = this; 
            d3.select("#coord-svg-layer").selectAll(".pointer").remove();
            if (this.plot_points) {
                let i = 0;
                for (var coord of this.projection_coords) {
                    if (coord != "" && !isNaN(coord)){
                        let x = this.main_plot.xscale(parseInt(coord));
                        let y = this.plot_points.get(parseInt(x));
                        d3.select("#coord-svg-layer").append("circle")
                            .attr("id", "projection-" + i)
                            .attr("cx", x + "px")
                            .attr("cy", y + "px")
                            .style("fill", "rgb(255, 252, 97)");
                        i += 1;
                    }
                }
                i = 0;
                for (var coord of this.mark_coords) {
                    if (coord != "" && !isNaN(coord)) {
                    let x = this.main_plot.xscale(parseInt(coord));
                    let y = this.plot_points.get(parseInt(x));
                    d3.select("#coord-svg-layer").append("circle")
                        .attr("id", "mark-" + i)
                        .attr("cx", x + "px")
                        .attr("cy", y + "px")
                        .style("fill", "rgb(205, 233, 255)");
                    i += 1;
                    }
                }
                d3.select("#coord-svg-layer").selectAll("circle")
                    .attr("class", "pointer")
                    .attr("r", "3px")
                    .attr("stroke-width", "1px")
                    .attr("stroke", "black");
            }
        },
        

        svg_projection_coords(){
            //Update projection coords on large nucleosome svg
            let self = this;
            self.svg.selectAll(".projection-coord").remove();
            if (self.projection_text.property("value") !== "") {
                let projections = self.projection_text.property("value").split(",");
                let i = 0;
                for (var coord of projections) {
                    self.svg.append("rect")
                        .attr("id", "mark-coord-" + i)
                        .attr("class", "projection-coord svg-coord")
                        .attr("width", "5px")
                        .attr("stroke-width", "2px")
                        .attr("stroke", "black")
                        .attr("x", (coord - self.start_coord) / self.nucleosome_length * 100 - 2 + "%")
                        .attr("height", "100%")
                        .style("fill", "rgb(255, 252, 97)")
                        .on("mousedown", function(e) {
                            self.start_dragging(e, this);
                        });
                    i += 1;
                }

            }
        },

        svg_mark_coords() {
            //Update mark coords large on large nucleosome svg
            let self = this;
            this.mark_text.on("input", function() {
                self.svg.selectAll(".mark-coord").remove();
                if (self.mark_text.property("value") !== "") {
                    self.mark_coords = self.mark_text.property("value").split(",");
                    let i = 0;
                    for (var coord of self.mark_coords) {
                        if (coord > -1) {
                            self.svg.append("rect")
                                .attr("id", "mark-coord-" + i)
                                .attr("class", "mark-coord svg-coord")
                                .attr("width", "5px")
                                .attr("stroke-width", "2px")
                                .attr("stroke", "black")
                                .attr("x", coord / self.nucleosome_length * 100 - 2.5 + "%")
                                .attr("height", "100%")
                                .style("fill", "rgb(205, 233, 255)")
                                .on("mousedown", function(e) {
                                    self.start_dragging(e, this);
                                });
                        }
                        i += 1;
                    }
                }
                self.plot_nucleosome();
            });
        },

        update_plot_stats(){
            //Points on the composite plot
            this.get_plot_points();
        },

        get_plot_points() {
            //Map points from the composite on the first layer (index 0) to map
            let all_composites = d3.select("#main-plot").selectAll(".composite-fill-top")._groups[0];
            let last_composite = all_composites[all_composites.length - 1];
            if (last_composite){
                let points = last_composite.getAttribute("points").split(" ");
                let map = points.reduce((result, point) => {
                    let pair = point.split(",");
                    result.set(parseInt(pair[0]), parseInt(pair[1]));
                    return result;
                }, new Map());
                this.plot_points = map;
            }
        },
        

        update_all(){
            //Update all plots and figures if a valid composite is loaded
            this.update_plot_stats();
            if (this.plot_points && (d3.select("#keep-nucleosome").property("checked") == true || d3.select("#nucleosome-slider-tab").classed("selected-tab"))){
                this.svg_mark_coords();
                this.svg_mark_coords();
                this.plot_projection_coords();
                this.plot_nucleosome();
                this.plot_pointers();
                this.update_text_box();
            }
        },

        get_projection_coords(){
            return this.projection_coords;
        },

        get_mark_coords(){
            return this.mark_coords;
        },

        get_starting_coord(){
            return this.start_coord;
        },

        get_length(){
            return this.nucleosome_length;
        }
    });
    $("#nucleosome-slider").nucleosome_slider();
});
