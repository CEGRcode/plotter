$(function() {
    // Reference axes widget
    $.widget("composite_plot.reference_axes", {
        _elements: {
            y_lines:[],
            x_lines:[],
            styles: {
                dashed : "5,5",
                solid : "0",
                dotted : "2,1"
            }
        },

        _create: function() {
            let self = this;
            this.box_path = "M 0 4 C 0 0 0 0 4 0 C 7.3333 0 12.6667 0 16 0 C 20 0 20 0 20 4 L 20 16 C 20 20 20 20 16 20 L 4 20 C 0 20 0 20 0 16 L 0 4";
            this.y_plus = d3.select("#y-plus");
            this.x_plus = d3.select("#x-plus");
            this.y_table = d3.select("#y-axis-lines");
            this.x_table = d3.select("#x-axis-lines");
            this.selected_element = null;
            this.offset = { x: 0, y: 0 };

            this.main_plot = $("#main-plot").main_plot("instance");

            d3.select("body").on("mousemove", function(e) {
                self.drag_plot_element(e);
            });
            d3.select("body").on("mouseup", function() {
                self.end_dragging();
            });

            this.y_table.append("tbody");
            this.x_table.append("tbody");
            console.log(this._elements.styles.dashed);
            this.add_row(0, "#FF0000", this._elements.styles.dashed, this.y_table);
            this.add_row(0, "#FF0000", this._elements.styles.dashed, this.x_table);

            this.attach_event_handlers();
        },

        get_mouse_pos: function(e) {
            //Get mouse position based on selected element
            let plot_CTM = d3.select("#main-plot").node().getScreenCTM();
            return {
                x: (e.clientX - plot_CTM.e) / plot_CTM.a,
                y: (e.clientY - plot_CTM.e) / plot_CTM.a,
            }
        },

        start_dragging: function(e, element) {
            //Update plot stats and assign selected element
            this.selected_element = element;
            this.offset = this.get_mouse_pos(e);
        },

        drag_plot_element: function(e){
            self = this;
            if (self.selected_element){
                var mousePos = this.get_mouse_pos(e);
                if (mousePos.y >= 0){
                    valid_y = (mousePos.y < this.main_plot.margins.bottom);
                } else {
                    valid_y = (mousePos.y * -1 < this.main_plot.height - (this.main_plot.margins.top + this.main_plot.margins.bottom * 2));
                }
                valid_x = this.main_plot.margins.left < mousePos.x &&  mousePos.x < this.main_plot.width - this.main_plot.margins.right
                if (valid_x && valid_y){
                    if (this.selected_element.getAttribute("class").includes("x-reference")){
                        var currentX = parseFloat(this.selected_element.getAttribute("x1"));
                        var newX = currentX + (mousePos.x - this.offset.x);
                        this.selected_element.setAttribute("x1", newX + "px");
                        this.selected_element.setAttribute("x2", newX + "px");
                        var array  = this._elements.x_lines.find(x => x.number === parseInt(self.selected_element.getAttribute("number")));
                        array.coordinate = parseInt(this.main_plot.xscale.invert(newX));
                    } else if (this.selected_element.getAttribute("class").includes("y-reference")) {
                        var currentY = parseFloat(this.selected_element.getAttribute("y2"));
                        var newY = currentY + (mousePos.y - this.offset.y);
                        this.selected_element.setAttribute("y1", newY + "px");
                        this.selected_element.setAttribute("y2", newY + "px");
                        var array  = this._elements.y_lines.find(y => y.number === parseInt(self.selected_element.getAttribute("number")));
                        array.coordinate = this.main_plot.yscale.invert(Math.abs(newY)).toFixed(2);
                    }
                    this.offset = this.get_mouse_pos(e);
                    this.update_tables();
                    this.add_plot_numbers();
                }
                else {
                    //End dragging if not on composite
                    this.end_dragging();
                }
            }
        },

        end_dragging: function() {
            //Reset selected element and update all text and figures
            this.selected_element = null;
        },

        attach_event_handlers: function() {
            let self = this;
            this.y_plus.on("click", function(){
                self.add_row(0, "#FF0000", self._elements.styles.dashed, self.y_table);
            })
            this.x_plus.on("click", function(){
                self.add_row(0, "#FF0000", self._elements.styles.dashed, self.x_table);
            })
        },
            
        add_row: function(coord, col, style, table) {
            let self = this;
            let lines;

            if (table == this.y_table) {
                lines = this._elements.y_lines;
            } else {
                lines = this._elements.x_lines;
            }
            num_rows = table.selectAll("tr").size();
            if (num_rows <= 3) {
                let row_number = lines.length;
                lines.push({ coordinate: coord, color: col, style: style, number: row_number });
                let row = table.append("tr")
                    .attr("number", row_number);
                row.append("td")
                    .style("width", "30%")
                    .append("input")
                    .style("width", "100%")
                    .classed("coord_input", true)
                    .style("text-align", "center")
                    .attr("value", coord)
                    .on("input", function() {
                        lines[row_number].coordinate = parseFloat(this.value);
                        self.plot_lines();
                    });
                row.append("td")
                    .style("width", "30%")
                    .append("input")
                    .attr("type", "color")
                    .attr("value", col)
                    .on("change", function() {
                        lines[row_number].color = this.value;
                        self.plot_lines();
                    });
                style_col = row.append("td")
                    .style("width", "30%");
                style_div = style_col.append("div")
                    .style("display", "flex")
                    .style("justify-content", "center")
                    .style("align-items", "center");
                let style_svg = style_div.append("svg")
                    .style("margin-bottom", "5px")
                    .attr("viewBox", "-4 -4 26 26")
                    .attr("xmlns", "http://www.w3.org/2000/svg")
                    .style("width", "35px")
                    .style("height", "35px")
                    .style("cursor", "pointer")
                style_svg.append("path")
                    .attr("d", self.box_path)
                    .attr("stroke", "black")
                    .attr("stroke-width", "1.5px")
                    .attr("fill", "none");
                style_svg.append("path")
                    .attr("d", "M 1 19 L 19 1")
                    .attr("stroke-dasharray", style)
                    .attr("stroke", "black")
                    .attr("stroke-width", "1.5px")
                    .attr("fill", "none")
                    .attr("id", "diagonal-line");
                let style_selector = style_div.append("div")
                    .classed("style-selector", true);
                for (let s in self._elements.styles) {
                    let option  = style_selector.append("svg")
                        .attr("viewBox", "-4 -4 26 26")
                        .attr("xmlns", "http://www.w3.org/2000/svg")
                        .style("width", "35px")
                        .style("height", "35px")
                        .style("cursor", "pointer")
                    let box = option.append("path")
                        .attr("d", self.box_path)
                        .attr("stroke", "black")
                        .attr("stroke-width", "1.5px")
                        .attr("fill", "none")
                    option.append("path")
                        .attr("d", "M 1 19 L 19 1")
                        .attr("stroke-dasharray", self._elements.styles[s])
                        .attr("stroke", "black")
                        .attr("stroke-width", "1.5px")
                        .attr("fill", "none")
                        .attr("id", "diagonal-line");
                    if (self._elements.styles[s] == style) {
                        box.style("fill", "lightgrey");
                    }
                    option.on("click", function(){
                        stroke_array = self._elements.styles[s];
                        style_svg.select("#diagonal-line").style("stroke-dasharray", stroke_array);
                        style_selector.selectAll("path").style("fill", "none");
                        box.style("fill", "lightgrey");
                        lines[row_number].style = self._elements.styles[s];
                        style_selector.style("display", "none");
                        self.plot_lines();
                    })
                }     
                style_svg.on("click", function(){
                   style_selector.style("display", "block");
                });
                remove = row.append("td")
                    .style("width", "10%")
                    .append("svg")
                    .classed("remove-row-icon", true)
                    .attr("baseProfile", "full")
                    .attr("viewBox", "-200 -200 400 400")
                    .attr("version", "1.1")
                    .attr("xmlns", "http://www.w3.org/2000/svg")
                    .style("height", "20px")
                    .style("width", "20px")
                    .append("g");
                remove.append("circle")
                    .attr("cx", 0)
                    .attr("cy", 0)
                    .attr("r", 200)
                    .attr("fill", "#DD0000");
                remove.append("polygon")
                    .attr("points", "-130,30 -30,30 -30,130 30,130 30,30 130,30 130,-30 30,-30 30,-130 -30,-130 -30,-30 -130,-30")
                    .attr("fill", "#FFFFFF")
                    .attr("transform", "rotate(45)");
                remove.on("click", function() {
                        delete lines[row_number];
                        row.remove();
                        number_rows = table.selectAll("tr").size();
                        if (number_rows <= 3) {
                            if (lines == self._elements.y_lines){
                                self.y_plus.style("display", "block");
                            } else if (lines == self._elements.x_lines){
                                self.x_plus.style("display", "block");
                            }
                        }
                        console.log(number_rows); 
                        self.plot_lines();
                    });
                if (num_rows >= 3) {
                    console.log(num_rows);
                    if (lines == self._elements.y_lines){
                        self.y_plus.style("display", "none");
                    } else if (lines === self._elements.x_lines){
                        self.x_plus.style("display", "none");
                    }
                }
                this.plot_lines();
            } 
        },
        

        plot_lines:function(){
            d3.select("#reference-axes-layer").selectAll("*").remove();
            let self = this;
            for (let line of self._elements.x_lines) {
                if (line != null && !isNaN(line.coordinate)) {
                    plotted_line = d3.select("#reference-axes-layer").append("line")
                        .attr("x1", self.main_plot.xscale(line.coordinate))
                        .attr("x2", self.main_plot.xscale(line.coordinate))
                        .attr("y1", self.main_plot.yscale(self.main_plot.ymin))
                        .attr("y2", self.main_plot.yscale(self.main_plot.ymax))
                        .attr("stroke", line.color)
                        .attr("stroke-width", 1)
                        .attr("stroke-dasharray", line.style)
                        .attr("number", line.number)
                        .classed("x-reference", true);
                    plotted_line.on("mousedown", function(e) {
                        self.selected_element = this;
                        self.start_dragging(e, d3.select(this).node());
                    });
                    d3.select("#reference-axes-layer").append("text")
                        .attr("x", self.main_plot.xscale(line.coordinate) - 4)
                        .attr("y", self.main_plot.yscale(self.main_plot.ymin) + 8)
                        .style("text-align", "middle")
                        .style("fill", line.color)
                        .attr("font-size", "8px")
                        .text(line.coordinate);
                }
            }
            for (let line of self._elements.y_lines) {
                if (line != null && !isNaN(line.coordinate)){
                    plotted_line = d3.select("#reference-axes-layer").append("line")
                        .attr("y1", self.main_plot.yscale(line.coordinate))
                        .attr("y2", self.main_plot.yscale(line.coordinate))
                        .attr("x1", self.main_plot.xscale(self.main_plot.xmin))
                        .attr("x2", self.main_plot.xscale(self.main_plot.xmax))
                        .attr("stroke", line.color)
                        .attr("stroke-width", 1)
                        .attr("stroke-dasharray", line.style)
                        .attr("number", line.number)
                        .classed("y-reference", true);
                        plotted_line.on("mousedown", function(e) {
                            self.selected_element = this;
                            self.start_dragging(e, d3.select(this).node());
                        });
                    d3.select("#reference-axes-layer").append("text")
                        .attr("x", self.main_plot.xscale(self.main_plot.xmax) + 5)
                        .attr("y", self.main_plot.yscale(line.coordinate) + 4)
                        .style("text-align", "middle")
                        .style("fill", line.color)
                        .attr("font-size", "8px")
                        .text(line.coordinate);
                }
            }
            //Fix the rest of the nucleosome slider to not save variables
        },

        add_plot_numbers: function(){
            d3.select("#reference-axes-layer").selectAll("text").remove();
            for (var line of self._elements.x_lines) {
                d3.select("#reference-axes-layer").append("text")
                    .attr("x", self.main_plot.xscale(line.coordinate) - 4)
                    .attr("y", self.main_plot.yscale(self.main_plot.ymin) + 8)
                    .style("text-align", "middle")
                    .style("fill", line.color)
                    .attr("font-size", "8px")
                    .text(line.coordinate);
            }
            for (var line of self._elements.y_lines) {
                d3.select("#reference-axes-layer").append("text")
                    .attr("x", self.main_plot.xscale(self.main_plot.xmax) + 5)
                    .attr("y", self.main_plot.yscale(line.coordinate) + 4)
                    .style("text-align", "middle")
                    .style("fill", line.color)
                    .attr("font-size", "8px")
                    .text(line.coordinate);
            }
        },

        update_tables:function(){
            for (var line of this._elements.x_lines) {
                row =this.x_table.selectAll("tr").filter(function() {return parseInt(d3.select(this).attr("number")) == parseInt(line.number);});
                row.select(".coord_input").attr("value", line.coordinate);
            }
            for (var line of this._elements.y_lines) {
                row =this.y_table.selectAll("tr").filter(function() {return parseInt(d3.select(this).attr("number")) == parseInt(line.number);});
                row.select(".coord_input").attr("value", line.coordinate);
            }
        }
    });



    $("#reference-axes-pane").reference_axes();
})