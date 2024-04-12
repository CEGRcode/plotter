$(function() {
    // Reference axes widget
    $.widget("composite_plot.reference_axes", {
        _elements: {
            y_lines:[],
            x_lines:[],
            styles: {
                dashed : "5,5",
                solid : "0",
                dotted : "2,1",
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
            this.dragging_rect_width = 4;

            //Attach drag event handlers
            d3.select("#main-plot-div").on("mousemove", function(e) {
                self.drag_plot_element(e);
            });
            d3.select("#main-plot-div").on("mouseup", function() {
                self.end_dragging();
            });
            this.y_table.append("tbody");
            this.x_table.append("tbody");
            this.add_row(0, "#FF0000", this._elements.styles.dashed, this.y_table);
            this.add_row(0, "#FF0000", this._elements.styles.dashed, this.x_table);

            //Hide axes until tab is selected
            d3.select("#reference-axes-layer")
                .selectAll("*")
                .remove();
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
            //Assign selected element
            this.selected_element = element;
            this.offset = this.get_mouse_pos(e);
        },

        drag_plot_element: function(e){
            self = this;
            //If element is being dragged
            if (self.selected_element){
                let marginLeft = this.main_plot.margins.left;
                let marginRight = this.main_plot.width - this.main_plot.margins.right;
                let marginTop = this.main_plot.height - this.main_plot.margins.bottom;
                let marginBottom = this.main_plot.margins.top;
                let buffer = 2;
                var mousePos = this.get_mouse_pos(e);
                if (this.selected_element.getAttribute("class").includes("x-reference")){
                    var currentX = parseFloat(this.selected_element.getAttribute("x1"));
                    //Check that line is still on plot, if outside of plot end dragging
                    if (marginLeft <= currentX &&  currentX <= marginRight){
                        var newX = currentX + (mousePos.x - this.offset.x);
                        this.move_plot_group(newX);
                    } else if (currentX > marginRight) {
                        this.move_plot_group(marginRight - buffer);
                        this.end_dragging();
                    } else if (currentX < marginLeft) {
                        this.move_plot_group(marginLeft + buffer);
                        this.end_dragging();
                    }
                    //Find the corresponding element in the array and update coordinate
                    var array = this._elements.x_lines.find(x => {
                        if (x !== undefined) {
                            return x.number === parseInt(self.selected_element.getAttribute("number"));
                        }
                    });
                    array.coordinate = parseInt(this.main_plot.xscale.invert(currentX));
                } else if (this.selected_element.getAttribute("class").includes("y-reference")) {
                    var currentY = parseFloat(this.selected_element.getAttribute("y2"));
                    //Check that line is still on plot, if outside of plot end dragging
                    if(currentY > marginBottom && currentY < marginTop){
                        var newY = currentY + (mousePos.y - this.offset.y);
                        this.move_plot_group(newY);
                    } else if (currentY > marginBottom) {
                        this.move_plot_group(marginTop - buffer);
                        this.end_dragging();
                    } else if (currentY < marginTop) {
                        this.move_plot_group(marginBottom + buffer);
                        this.end_dragging();
                    }
                    //Find the corresponding element in the array and update coordinate
                    var array = this._elements.y_lines.find(y => {
                        if (y !== undefined) {
                            return y.number === parseInt(self.selected_element.getAttribute("number"));
                        }
                    });
                    array.coordinate = this.main_plot.yscale.invert(Math.abs(currentY)).toFixed(2);
                }
                //Update offset, tables, and add numbers to plot
                this.offset = this.get_mouse_pos(e);
                this.update_tables();
                this.add_plot_numbers();
            }
        },

        end_dragging: function() {
            //Reset selected element and update all text and figures
            this.selected_element = null;
        },

        move_plot_group: function(pos) {
            //Move plotted line group to a position
            if (this.selected_element.getAttribute("class").includes("x-reference")) {
                this.selected_element.setAttribute("x1", pos + "px");
                this.selected_element.setAttribute("x2", pos + "px");
                d3.select(this.selected_element.parentNode).select("rect").attr("x", (pos - this.dragging_rect_width / 2) + "px");
            } else if (this.selected_element.getAttribute("class").includes("y-reference")) {
                this.selected_element.setAttribute("y1", pos + "px");
                this.selected_element.setAttribute("y2", pos + "px");
                d3.select(this.selected_element.parentNode).select("rect").attr("y", (pos - this.dragging_rect_width / 2) + "px");
            }
        },

        attach_event_handlers: function() {
            let self = this;
            //Add default rows
            this.y_plus.on("click", function(){
                self.add_row(0, "#FF0000", self._elements.styles.dashed, self.y_table);
            })
            this.x_plus.on("click", function(){
                self.add_row(0, "#FF0000", self._elements.styles.dashed, self.x_table);
            })
        },
            
        //Adds a row to x or y table and plots line
        add_row: function(coord, col, style, table) {
            let self = this;
            let lines;
            //Use proper array
            if (table == this.y_table) {
                lines = this._elements.y_lines;
            } else {
                lines = this._elements.x_lines;
            }
            num_rows = table.selectAll("tr").size();
            //Limited to 4 rows so that style selectors are positioned properly
            if (num_rows <= 3) {
                //Assign array values
                let row_number = lines.length;
                lines.push({ coordinate: coord, color: col, style: style, number: row_number });
                let row = table.append("tr")
                    .attr("number", row_number);
                //Append text input
                row.append("td")
                    .style("width", "30%")
                    .append("input")
                    .style("width", "100%")
                    .classed("coord_input", true)
                    .style("text-align", "center")
                    .attr("value", coord)
                    .on("input", function() {
                        let val = parseFloat(this.value)
                        if (!(isNaN(val))){
                            lines[row_number].coordinate = val;
                            self.plot_lines();
                        }
                    });
                //Append color input
                row.append("td")
                    .style("width", "30%")
                    .append("input")
                    .attr("type", "color")
                    .attr("value", col)
                    .on("change", function() {
                        lines[row_number].color = this.value;
                        self.plot_lines();
                    });
                //Append style column with given style parameter
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
                //Append style selector with all styles
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
                //Append remove button
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
                        self.plot_lines();
                    });
                //If there are more than 4 rows, hide new row button
                if (num_rows >= 3) {
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
            //Remove old lines
            d3.select("#reference-axes-layer").selectAll("*").remove();
            let self = this;
            //Add x-axis lines to plot with drag event handlers and labels
            for (let line of self._elements.x_lines) {
                if (line != null && !isNaN(line.coordinate)) {
                    line_group = d3.select("#reference-axes-layer").append("g")
                    plotted_line = line_group.append("line")
                        .attr("x1", self.main_plot.xscale(line.coordinate))
                        .attr("x2", self.main_plot.xscale(line.coordinate))
                        .attr("y1", self.main_plot.yscale(self.main_plot.ymin))
                        .attr("y2", self.main_plot.yscale(self.main_plot.ymax))
                        .attr("stroke", line.color)
                        .attr("stroke-width", 1)
                        .attr("stroke-dasharray", line.style)
                        .attr("number", line.number)
                        .classed("x-reference", true);
                    dragging_rect = line_group.append("rect")
                        .attr("width", this.dragging_rect_width)
                        .attr("x", self.main_plot.xscale(line.coordinate) - this.dragging_rect_width / 2)
                        .attr("y", self.main_plot.yscale(self.main_plot.ymax))
                        .attr("height", (self.main_plot.yscale(self.main_plot.ymin) - self.main_plot.yscale(self.main_plot.ymax)) + "px")
                        .attr("opacity", "0")
                        .style("cursor", "ew-resize");
                    dragging_rect.on("mousedown", function(e) {
                        self.selected_element = plotted_line;
                        self.start_dragging(e, d3.select(this.parentNode).select("line").node());
                    });
                }
            }
            //Add y-axis lines to plot with event handlers and labels
            for (let line of self._elements.y_lines) {
                if (line != null && !isNaN(line.coordinate)){
                    line_group = d3.select("#reference-axes-layer").append("g")
                    plotted_line = line_group.append("line")
                        .attr("y1", self.main_plot.yscale(line.coordinate))
                        .attr("y2", self.main_plot.yscale(line.coordinate))
                        .attr("x1", self.main_plot.xscale(self.main_plot.xmin))
                        .attr("x2", self.main_plot.xscale(self.main_plot.xmax))
                        .attr("stroke", line.color)
                        .attr("stroke-width", 1)
                        .attr("stroke-dasharray", line.style)
                        .attr("number", line.number)
                        .classed("y-reference", true);
                    dragging_rect = line_group.append("rect")
                        .attr("height", this.dragging_rect_width)
                        .attr("x", self.main_plot.xscale(self.main_plot.xmin))
                        .attr("y", self.main_plot.yscale(line.coordinate) - this.dragging_rect_width / 2)
                        .attr("width", (self.main_plot.xscale(self.main_plot.xmax) - self.main_plot.xscale(self.main_plot.xmin)) + "px")
                        .attr("opacity", "0")
                        .style("cursor", "ns-resize");
                    dragging_rect.on("mousedown", function(e) {
                        self.selected_element = plotted_line;
                        self.start_dragging(e, d3.select(this.parentNode).select("line").node());
                    });
                }
            }
            this.add_plot_numbers();
        },

        add_plot_numbers: function(){
            self = this;
            //Adds coord labels to x-axis lines
            d3.select("#reference-axes-layer").selectAll("text").remove();
            for (let line of self._elements.x_lines) {
                if (line !== undefined){
                    d3.select("#reference-axes-layer").append("text")
                        .attr("x", self.main_plot.xscale(line.coordinate) - 4)
                        .attr("y", self.main_plot.yscale(self.main_plot.ymin) + 8)
                        .style("text-align", "middle")
                        .style("fill", line.color)
                        .attr("font-size", "8px")
                        .text(line.coordinate);
                }
            }
            //Adds occupancy labels to y-axis lines
            for (let line of self._elements.y_lines) {
                if (line !== undefined){
                d3.select("#reference-axes-layer").append("text")
                    .attr("x", self.main_plot.xscale(self.main_plot.xmax) + 5)
                    .attr("y", self.main_plot.yscale(line.coordinate) + 4)
                    .style("text-align", "middle")
                    .style("fill", line.color)
                    .attr("font-size", "8px")
                    .text(line.coordinate);
                }
            }
        },

        update_tables:function(){
            //Updates tables based on line's position on plot
            for (var line of this._elements.x_lines) {
                if (line !== undefined){
                row = this.x_table.selectAll("tr").filter(function() {return parseInt(d3.select(this).attr("number")) == parseInt(line.number);});
                row.select(".coord_input").attr("value", line.coordinate);
                }
            }
            for (var line of this._elements.y_lines) {
                if (line !== undefined){
                row = this.y_table.selectAll("tr").filter(function() {return parseInt(d3.select(this).attr("number")) == parseInt(line.number);});
                row.select(".coord_input").attr("value", line.coordinate);
                }
            }
        },

        update_all:function(){
            if (d3.select("#keep-reference-lines").property("checked") || d3.select("#reference-axes-tab").classed("selected-tab")){
                this.plot_lines();
                this.update_tables();
                this.add_plot_numbers();
            }
        },

        export: function(){
            return{
                y_lines: this._elements.y_lines,
                x_lines: this._elements.x_lines,
            }
        },

        import: function(data){
            if ("y_lines" in data){
                this._elements.y_lines = data.y_lines;
            }
            if ("x_lines" in data){
                this._elements.x_lines = data.x_lines;
            }
            this.update_all();
        }
    });
    $("#reference-axes-pane").reference_axes();
})