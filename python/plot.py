import xml.dom.minidom as dom
import copy
import slidingWindow
import math
import json
import composite

"""
This script defines a class Plot that allows the creation of a composite plot with support for scaling, 
plotting composite data, reference lines, and generating an SVG representation of the plot.The plot supports both combined and 
individual strand representations of the data.

The key functions in the script (Most of these functions are helper methods for managing SVG elements and data transformations.):
1. plot_composite
2. scale axes
3. autoscale_axes
4. add_composite_group
5. plot_composites
6. plot_reference_line
7. create_legend 
8. get_plot
9. expot
10. import_data
11. generateGradients

"""


document = dom.Document()

# Class that generates composite and reference lines svg elements
class Plot:
    def __init__(self, title=None, xmin=None, xmax=None, ymin=None, ymax=None, xlabel=None, ylabel=None, 
                 opacity=None, smoothing=None, bp_shift=None, combined=False, color_trace=False, hide_legend=False):
        # Set variables to defaults if argument passed into constructor was None
        self.title = title if title is not None else "Composite plot"
        self.xmin = xmin if xmin is not None else -500
        self.xmax = xmax if xmax is not None else 500
        self.ymin = ymin if ymin is not None else -1
        self.ymax = ymax if ymax is not None else 1
        self.xlabel = xlabel if xlabel is not None else "Position (bp)"
        self.ylabel = ylabel if ylabel is not None else "Occupancy (AU)"
        self.opacity = opacity if opacity is not None else 1
        self.smoothing = smoothing if smoothing is not None else 7
        self.bp_shift = bp_shift if bp_shift is not None else 0
        self.combined = combined
        self.color_trace = color_trace
        self.hide_legend = hide_legend
        # Set dimensions to same constants as plotter
        self.width = 460
        self.height = 300
        self.margins = {'top': 30, 'right': 170, 'bottom': 35, 'left': 40}
        # Create groups for adding composites and reference lines
        self.plot = document.createElement("g")
        self.composite_group = document.createElement("g")
        self.composite_group.setAttribute("class", "composite plotted")
        self.gradients_group = document.createElement("defs")
        self.reference_group = document.createElement("g")
        self.xscale = XScale(self)
        self.yscale = YScale(self)
        self.num_composites = 0
        self.composites = []
        self.styles ={"dashed" : "5,5",
                      "solid" : "0",
                      "dotted" : "2,1"}

    # Creates a composite svg element from separate sense and anti arrays - mimics plot_composite from plotter
    def plot_composite(self, xmin, xmax, sense, anti, scale=1, color=None, secondary_color=None, i=None, opacity=None, smoothing=None, bp_shift=None, hide_sense=False, hide_anti=False, baseline=0):
        # Set parameters to global values if not specified
        opacity = opacity if opacity is not None else self.opacity
        smoothing = smoothing if smoothing is not None else self.smoothing
        bp_shift = bp_shift if bp_shift is not None else self.bp_shift
        if (i is None): 
            i = self.num_composites
            self.num_composites += 1
        else:
            i = i
        # Set x domain as array of integers from xmin to xmax
        xdomain = [i + xmin for i in range(xmax - xmin + 1)]
        if (self.combined):
            # Calculate defined x domain after shifting
            shifted_xdomain = [x for x in xdomain if x - bp_shift >= xdomain[0] and x - bp_shift <= xdomain[-1]
                    and x + bp_shift >= xdomain[0] and x + bp_shift <= xdomain[-1]]
            shifted_sense = [sense[j] for j in range(len(sense)) if xdomain[j] + bp_shift >= shifted_xdomain[0]
                    and xdomain[j] + bp_shift <= shifted_xdomain[-1]]
            shifted_anti = [anti[j] for j in range(len(anti)) if xdomain[j] + bp_shift >= shifted_xdomain[0]
                    and xdomain[j] + bp_shift <= shifted_xdomain[-1]]
            # Add occupancy for sense and anti
            combined_occupancy = [shifted_sense[j] + shifted_anti[j] for j in range(len(shifted_sense))]
            # Smooth occupancy with moving average
            new_xdomain, smoothed_occupancy = slidingWindow.sliding_window(shifted_xdomain, combined_occupancy, smoothing).values()
            # Truncate x domain to x axis limits
            truncated_xdomain = [x for x in new_xdomain if x >= self.xmin and x <= self.xmax]
            # Truncate occupancy and scale by scale factor, adding baseline value
            scaled_occupancy = [value if (value := d * scale + baseline) > 0 else 0 for j, d in enumerate(smoothed_occupancy) 
                    if int(new_xdomain[j]) >= self.xmin and int(new_xdomain[j]) <= self.xmax]
            composite_fill_top = document.createElement("polygon")
            composite_fill_top.setAttribute("points", " ".join(points := [f"{self.xscale.get(d)},{self.yscale.get(scaled_occupancy[j])}" for j, d in enumerate(truncated_xdomain)]) + f" {self.xscale.get(truncated_xdomain[-1])},{self.yscale.get(0)} {self.xscale.get(truncated_xdomain[0])},{self.yscale.get(0)}")
            composite_fill_top.setAttribute("fill", "url(#composite-gradient-top" + str(i) + ")")
            self.composite_group.appendChild(composite_fill_top)
            #Create outline
            wide_trace = document.createElement("path")
            wide_trace.setAttribute("stroke-width", "1")
            wide_trace.setAttribute("stroke", color)
            wide_trace.setAttribute("fill", "none")
            wide_trace.setAttribute("d", "M" + "L".join(points))
            self.composite_group.appendChild(wide_trace)
            if not self.color_trace:
                wide_trace.setAttribute("stroke", "#FFFFFF")
                narrow_trace = copy.deepcopy(wide_trace)
                narrow_trace.setAttribute("stroke-width", "0.5")
                narrow_trace.setAttribute("stroke", "#000000")
                narrow_trace.setAttribute("d", "M" + "L".join(points))
                self.composite_group.appendChild(narrow_trace)
        else:
            # Smooth sense and anti occupancy with moving average
            new_xdomain, smoothed_sense = slidingWindow.sliding_window(xdomain, sense, smoothing).values()
            smoothed_anti = list(slidingWindow.sliding_window(xdomain, anti, smoothing).values())[1]
            # Truncate x domain to x axis limits
            truncated_sense_domain = [j for x in new_xdomain if (j := x + bp_shift) >= self.xmin and j <= self.xmax]
            truncated_anti_domain = [j for x in new_xdomain if (j := x - bp_shift) >= self.xmin and j <= self.xmax]
            # Truncate sense and anti occupancy and scale by scale factor
            scaled_sense = [value if (value := d * scale + baseline) > 0 else 0 for j, d in enumerate(smoothed_sense) 
                    if int(new_xdomain[j] + bp_shift) >= self.xmin and int(new_xdomain[j] + bp_shift) <= self.xmax]
            scaled_anti = [value if (value := d * scale + baseline) > 0 else 0 for j, d in enumerate(smoothed_anti) 
                    if int(new_xdomain[j] - bp_shift) >= self.xmin and int(new_xdomain[j] - bp_shift) <= self.xmax]
            # Create sense trace and polygon if not hidden
            if not hide_anti:
                # Create top polygon
                composite_fill_top = document.createElement("polygon")
                composite_fill_top.setAttribute("points", " ".join(sense_points := [f"{self.xscale.get(d)},{self.yscale.get(scaled_sense[j])}" for j, d in enumerate(truncated_sense_domain)]) + f" {self.xscale.get(truncated_sense_domain[-1])},{self.yscale.get(0)} {self.xscale.get(truncated_sense_domain[0])},{self.yscale.get(0)}")
                composite_fill_top.setAttribute("fill", "url(#composite-gradient-top" + str(i) + ")")
                self.composite_group.appendChild(composite_fill_top)
                #Create trace
                top_wide_trace = document.createElement("path")
                top_wide_trace.setAttribute("stroke-width", "1")
                top_wide_trace.setAttribute("stroke", color)
                top_wide_trace.setAttribute("fill", "none")
                top_wide_trace.setAttribute("d", "M" + "L".join(sense_points))
                self.composite_group.appendChild(top_wide_trace)
                if not self.color_trace:
                    top_wide_trace.setAttribute("stroke", "#FFFFFF")
                    top_narrow_trace = copy.deepcopy(top_wide_trace)
                    top_narrow_trace.setAttribute("stroke-width", "0.5")
                    top_narrow_trace.setAttribute("stroke", "#000000")
                    top_narrow_trace.setAttribute("d", "M" + "L".join(sense_points))
                    self.composite_group.appendChild(top_narrow_trace)
            # Create anti trace and polygon if not hidden
            if not hide_anti:
                # Create polygon
                composite_fill_bottom = document.createElement("polygon")
                composite_fill_bottom.setAttribute("points", " ".join(anti_points := [f"{self.xscale.get(d)},{self.yscale.get(-scaled_anti[j])}" for j, d in enumerate(truncated_anti_domain)]) + f" {self.xscale.get(truncated_anti_domain[-1])},{self.yscale.get(0)} {self.xscale.get(truncated_anti_domain[0])},{self.yscale.get(0)}")
                composite_fill_bottom.setAttribute("fill", "url(#composite-gradient-bottom" + str(i) + ")")
                self.composite_group.appendChild(composite_fill_bottom)
                #Create trace
                bottom_wide_trace = document.createElement("path")
                bottom_wide_trace.setAttribute("stroke-width", "1")
                bottom_wide_trace.setAttribute("stroke", secondary_color)
                bottom_wide_trace.setAttribute("fill", "none")
                bottom_wide_trace.setAttribute("d", "M" + "L".join(anti_points))
                self.composite_group.appendChild(bottom_wide_trace)
                if not self.color_trace:
                    bottom_wide_trace.setAttribute("stroke", "#FFFFFF")
                    bottom_narrow_trace = copy.deepcopy(bottom_wide_trace)
                    bottom_narrow_trace.setAttribute("stroke-width", "0.5")
                    bottom_narrow_trace.setAttribute("stroke", "#000000")
                    bottom_narrow_trace.setAttribute("d", "M" + "L".join(anti_points))
                    self.composite_group.appendChild(bottom_narrow_trace)
        self.generateGradients(opacity, i, color, secondary_color=secondary_color)
        self.plot.appendChild(self.gradients_group)
        self.plot.appendChild(self.composite_group)
    
    # Creates a composite svg element from a composite object, like plotting a row form the settings table
    def plot_composite(self, composite):
        # Set parameters to global values if not specified
        opacity = composite.opacity if composite.opacity is not None else self.opacity
        smoothing = composite.smoothing if composite.smoothing is not None else self.smoothing
        bp_shift = composite.bp_shift if composite.bp_shift is not None else self.bp_shift
        i = self.num_composites
        self.num_composites += 1
        # Set x domain as array of integers from xmin to xmax
        xdomain = [i + composite.xmin for i in range(composite.xmax - composite.xmin + 1)]
        if (self.combined):
            # Calculate defined x domain after shifting
            shifted_xdomain = [x for x in xdomain if x - bp_shift >= xdomain[0] and x - bp_shift <= xdomain[-1]
                    and x + bp_shift >= xdomain[0] and x + bp_shift <= xdomain[-1]]
            shifted_sense = [composite.sense[j] for j in range(len(composite.sense)) if xdomain[j] + bp_shift >= shifted_xdomain[0]
                    and xdomain[j] + bp_shift <= shifted_xdomain[-1]]
            shifted_anti = [composite.anti[j] for j in range(len(composite.anti)) if xdomain[j] + bp_shift >= shifted_xdomain[0]
                    and xdomain[j] + bp_shift <= shifted_xdomain[-1]]
            # Add occupancy for sense and anti
            combined_occupancy = [shifted_sense[j] + shifted_anti[j] for j in range(len(shifted_sense))]
            # Smooth occupancy with moving average
            new_xdomain, smoothed_occupancy = slidingWindow.sliding_window(shifted_xdomain, combined_occupancy, smoothing).values()
            # Truncate x domain to x axis limits
            truncated_xdomain = [x for x in new_xdomain if x >= self.xmin and x <= self.xmax]
            # Truncate occupancy and scale by scale factor, adding baseline value
            scaled_occupancy = [value if (value := d * composite.scale + composite.baseline) > 0 else 0 for j, d in enumerate(smoothed_occupancy) 
                    if int(new_xdomain[j]) >= self.xmin and int(new_xdomain[j]) <= self.xmax]
            composite_fill_top = document.createElement("polygon")
            composite_fill_top.setAttribute("points", " ".join(points := [f"{self.xscale.get(d)},{self.yscale.get(scaled_occupancy[j])}" for j, d in enumerate(truncated_xdomain)]) + f" {self.xscale.get(truncated_xdomain[-1])},{self.yscale.get(0)} {self.xscale.get(truncated_xdomain[0])},{self.yscale.get(0)}")
            composite_fill_top.setAttribute("fill", "url(#composite-gradient-top" + str(i) + ")")
            self.composite_group.appendChild(composite_fill_top)
            #Create outline
            wide_trace = document.createElement("path")
            wide_trace.setAttribute("stroke-width", "1")
            wide_trace.setAttribute("stroke", composite.color)
            wide_trace.setAttribute("fill", "none")
            wide_trace.setAttribute("d", "M" + "L".join(points))
            self.composite_group.appendChild(wide_trace)
            if not self.color_trace:
                wide_trace.setAttribute("stroke", "#FFFFFF")
                narrow_trace = copy.deepcopy(wide_trace)
                narrow_trace.setAttribute("stroke-width", "0.5")
                narrow_trace.setAttribute("stroke", "#000000")
                narrow_trace.setAttribute("d", "M" + "L".join(points))
                self.composite_group.appendChild(narrow_trace)
        else:
            # Smooth sense and anti occupancy with moving average
            new_xdomain, smoothed_sense = slidingWindow.sliding_window(xdomain, composite.sense, smoothing).values()
            smoothed_anti = list(slidingWindow.sliding_window(xdomain, composite.anti, smoothing).values())[1]
            # Truncate x domain to x axis limits
            truncated_sense_domain = [j for x in new_xdomain if (j := x + bp_shift) >= self.xmin and j <= self.xmax]
            truncated_anti_domain = [j for x in new_xdomain if (j := x - bp_shift) >= self.xmin and j <= self.xmax]
            # Truncate sense and anti occupancy and scale by scale factor
            scaled_sense = [value if (value := d * composite.scale + composite.baseline) > 0 else 0 for j, d in enumerate(smoothed_sense) 
                    if int(new_xdomain[j] + bp_shift) >= self.xmin and int(new_xdomain[j] + bp_shift) <= self.xmax]
            scaled_anti = [value if (value := d * composite.scale + composite.baseline) > 0 else 0 for j, d in enumerate(smoothed_anti) 
                    if int(new_xdomain[j] - bp_shift) >= self.xmin and int(new_xdomain[j] - bp_shift) <= self.xmax]
            # Create sense trace and polygon if not hidden
            if not composite.hide_sense:
                # Create top polygon
                composite_fill_top = document.createElement("polygon")
                composite_fill_top.setAttribute("points", " ".join(sense_points := [f"{self.xscale.get(d)},{self.yscale.get(scaled_sense[j])}" for j, d in enumerate(truncated_sense_domain)]) + f" {self.xscale.get(truncated_sense_domain[-1])},{self.yscale.get(0)} {self.xscale.get(truncated_sense_domain[0])},{self.yscale.get(0)}")
                composite_fill_top.setAttribute("fill", "url(#composite-gradient-top" + str(i) + ")")
                self.composite_group.appendChild(composite_fill_top)
                #Create trace
                top_wide_trace = document.createElement("path")
                top_wide_trace.setAttribute("stroke-width", "1")
                top_wide_trace.setAttribute("stroke", composite.color)
                top_wide_trace.setAttribute("fill", "none")
                top_wide_trace.setAttribute("d", "M" + "L".join(sense_points))
                self.composite_group.appendChild(top_wide_trace)
                if not self.color_trace:
                    top_wide_trace.setAttribute("stroke", "#FFFFFF")
                    top_narrow_trace = copy.deepcopy(top_wide_trace)
                    top_narrow_trace.setAttribute("stroke-width", "0.5")
                    top_narrow_trace.setAttribute("stroke", "#000000")
                    top_narrow_trace.setAttribute("d", "M" + "L".join(sense_points))
                    self.composite_group.appendChild(top_narrow_trace)
            # Create anti trace and polygon if not hidden
            if not composite.hide_anti:
                # Create polygon
                composite_fill_bottom = document.createElement("polygon")
                composite_fill_bottom.setAttribute("points", " ".join(anti_points := [f"{self.xscale.get(d)},{self.yscale.get(-scaled_anti[j])}" for j, d in enumerate(truncated_anti_domain)]) + f" {self.xscale.get(truncated_anti_domain[-1])},{self.yscale.get(0)} {self.xscale.get(truncated_anti_domain[0])},{self.yscale.get(0)}")
                composite_fill_bottom.setAttribute("fill", "url(#composite-gradient-bottom" + str(i) + ")")
                self.composite_group.appendChild(composite_fill_bottom)
                #Create trace
                bottom_wide_trace = document.createElement("path")
                bottom_wide_trace.setAttribute("stroke-width", "1")
                bottom_wide_trace.setAttribute("stroke", composite.secondary_color)
                bottom_wide_trace.setAttribute("fill", "none")
                bottom_wide_trace.setAttribute("d", "M" + "L".join(anti_points))
                self.composite_group.appendChild(bottom_wide_trace)
                if not self.color_trace:
                    bottom_wide_trace.setAttribute("stroke", "#FFFFFF")
                    bottom_narrow_trace = copy.deepcopy(bottom_wide_trace)
                    bottom_narrow_trace.setAttribute("stroke-width", "0.5")
                    bottom_narrow_trace.setAttribute("stroke", "#000000")
                    bottom_narrow_trace.setAttribute("d", "M" + "L".join(anti_points))
                    self.composite_group.appendChild(bottom_narrow_trace)
        self.generateGradients(opacity, i, composite.color, secondary_color=composite.secondary_color)
        self.plot.appendChild(self.gradients_group)
        self.plot.appendChild(self.composite_group)
    
    # Changes values and updates scale objects
    def scale_axes(self, xmin=None, xmax=None, ymin=None, ymax=None):
        self.xmin = xmin if xmin is not None else self.xmin
        self.xmax = xmax if xmax is not None else self.xmax
        self.ymin = ymin if ymin is not None else self.ymin
        self.ymax = ymax if ymax is not None else self.ymax
        self.xscale = XScale(self)
        self.yscale = YScale(self)

    # Finds the max/min x and y values from composites on plot and scales axes accordingly
    def autoscale_axes(self, allow_shrink):
        xmin = min([group.xmin for group in self.composites])
        xmax = max([group.xmax for group in self.composites])
        if self.combined:
            ymin = 0
            ymax = round(max([(group.sense[i] + group.sense[i]) * group.scale for group in self.composites for i in range(min(len(group.sense), len(group.anti)))]), 2)
        else:
            ymin = min([-val * group.scale for group in self.composites for val in group.anti])
            ymax = max([val * group.scale for group in self.composites for val in group.sense])
        self.scale_axes(xmin,xmax,ymin if allow_shrink else None,ymax if allow_shrink else None)

    # Adds composite group object to plot
    def add_composite_group(self, composite_group):
        if composite_group.name == None:
            composite_group.name = self.num_composites + 1
        self.composites.append(composite_group)

    # Plots all composites on plot
    def plot_composites(self):
        for group in self.composites:
            self.plot_composite(group)
        return self.plot
    
    # Adds reference lines to plot
    def plot_reference_line(self, axis=None, val=None, style=None, color=None, opacity=None):
        # Sets default values for reference lines
        axis = axis if axis is not None else "x"
        val = val if val is not None else 0
        style = style if style is not None else "dashed"
        color = color if color is not None else "#FF0000"
        opacity = opacity if opacity is not None else 1
        bottom = self.height - self.margins.get('bottom')
        top = self.margins.get("top")
        right = self.width - (self.margins.get('right'))
        left = self.margins.get("left")
        # Draws reference lines on plot
        line = document.createElement("line")
        label = document.createElement("text") 
        if axis == "x":
            val = int(val)
            line = document.createElement("line")
            line.setAttribute("x1", str(self.xscale.get(val)))
            line.setAttribute("x2", str(self.xscale.get(val)))
            line.setAttribute("y1", str(top))
            line.setAttribute("y2", str(bottom))
            label.setAttribute("x", str(self.xscale.get(val) - 4))
            label.setAttribute("y", str(bottom + 8))
            label.appendChild(document.createTextNode(str(val)))
        elif axis == "y":
            line = document.createElement("line")
            line.setAttribute("x1", str(left))
            line.setAttribute("x2", str(right))
            line.setAttribute("y1", str(self.yscale.get(val)))
            line.setAttribute("y2", str(self.yscale.get(val)))
            label.setAttribute("x", str(right + 5))
            label.setAttribute("y", str(self.yscale.get(val) + 4))
            label.appendChild(document.createTextNode(str(val)))    
        line.setAttribute("stroke-dasharray", self.styles.get(style))
        line.setAttribute("stroke-width", "1")
        line.setAttribute("stroke", color)
        line.setAttribute("opacity", str(opacity))
        label.setAttribute("text-align", "middle")
        label.setAttribute("fill", color)
        label.setAttribute("font-size", "8px")
        self.reference_group.appendChild(line)
        self.reference_group.appendChild(label)
        self.plot.appendChild(self.reference_group)
    
    # Creates legend for plot
    def create_legend(self):
        if not self.hide_legend:
            legend = document.createElement('g')
            legend.setAttribute("transform", "translate(" + str(self.width - self.margins.get("right") + 25) + " " + str(self.margins.get("top")) + ")")
            i = 0
            for composite in self.composites:
                # Creates legend entries for each composite
                legend_element = document.createElement("g")
                legend_element.setAttribute("transform", "translate(0," + str(24 * i) + ")")
                legend_color_sense = document.createElement("polygon")
                legend_color_sense.setAttribute("points", "0,0 15,0 15,15 0,15")
                legend_color_sense.setAttribute("fill", composite.color)
                legend_element.appendChild(legend_color_sense)
                legend_color_anti = document.createElement("polygon")
                legend_color_anti.setAttribute("points", "0,0 15,0 15,15 0,15")
                legend_element.appendChild(legend_color_anti)
                legend_color_anti.setAttribute("fill", composite.secondary_color)
                legend_border = document.createElement("rect")
                legend_border.setAttribute("width", "15")
                legend_border.setAttribute("height", "15")
                legend_border.setAttribute("stroke", "#000000")
                legend_border.setAttribute("fill", "none")
                legend_element.appendChild(legend_border)
                id = document.createElement("text")
                id.setAttribute("x", "20")
                id.setAttribute("y", "10")
                id.setAttribute("font-size", "10")
                id.appendChild(document.createTextNode(str(composite.name)))
                legend_element.appendChild(id)
                legend.appendChild(legend_element)
                i += 1
            self.plot.appendChild(legend)

    # Returns svg group with all composites and reference lines
    def get_plot(self):
        return self.plot
    
    # Exports json of all composites and plot attributes
    def export(self):
        composite_arr = []
        for composite in self.composites:
            composite_arr.append({
                'name': composite.name,
                'xmin': composite.xmin,
                'xmax': composite.xmax,
                'sense': composite.sense,
                'anti': composite.anti,
                'color': composite.color,
                'secondary-color': composite.secondary_color,
                'scale': composite.scale,
                'opacity': composite.opacity,
                'smoothing': composite.smoothing,
                'bp_shift': composite.bp_shift,
                'hide_sense': composite.hide_sense,
                'hide_anti': composite.hide_anti,
                'files_loaded': composite.files_loaded
            })
        return {
            'settings' :composite_arr,
            'plot' : {'title': self.title, 'xlabel': self.xlabel, 'ylabel': self.ylabel, 'opacity': self.opacity,
                'smoothing': self.smoothing, 'bp_shift': self.bp_shift, 'xmin': self.xmin, 'xmax': self.xmax, 'ymin': self.ymin,
                'ymax': self.ymax, 'combined': self.combined, 'color_trace': self.color_trace, 'hide_legend': self.hide_legend}
            }
    
    # Imports JSON with plot attributes and composites if desired.  Preserves plot options specified by most recent call
    def import_data(self, file, args, import_composites):
        with open(file) as f:            
            data = json.load(f)
            if import_composites:
                for c in data['settings']:
                    n = c.get('name')
                    # Add _imported to composite name if duplicate of existing composite
                    if any(n == self.composites[j].name for j in range(len(self.composites))):
                        n = str(n) + "_imported"
                    self.composites.append(composite.Composite(scale=float(c.get('scale')) if c.get('scale') is not None else None, 
                                                               color=c.get('color'), 
                                                               secondary_color=c.get('secondary_color'), 
                                                               opacity=c.get('opacity') if c.get('smoothing') != False else None,
                                                               smoothing=c.get('smoothing') if c.get('smoothing') != False else None, 
                                                               bp_shift=c.get('bp_shift') if c.get('bp_shift') != False else None, 
                                                               hide_sense=hide if (hide := c.get('hide')) == True else c.get('hide_forward'),
                                                               hide_anti=hide if hide == True else c.get('hide_reverse'),
                                                               baseline=c.get('baseline'), 
                                                               name=n, 
                                                               sense=c.get('sense'), 
                                                               anti=c.get('anti'), 
                                                               xmin=c.get('xmin'), 
                                                               xmax=c.get('xmax')))
            plot_data = data['plot']
            # Add plot variables
            self.title = plot_data.get('title', self.title) if args.title is None else self.title
            self.xmin = plot_data.get('xmin', self.xmin) if args.xmin is None else self.xmin
            self.xmax = plot_data.get('xmax', self.xmax) if args.xmax is None else self.xmax
            self.ymin = plot_data.get('ymin', self.ymin) if args.ymin is None else self.ymin
            self.ymax = plot_data.get('ymax', self.ymax) if args.ymax is None else self.ymax
            self.xlabel = plot_data.get('xlabel', self.xlabel) if args.xlabel is None else self.xlabel
            self.ylabel = plot_data.get('ylabel', self.ylabel) if args.ylabel is None else self.ylabel
            self.opacity = plot_data.get('opacity', self.opacity) if args.opacity is None else self.opacity
            self.smoothing = plot_data.get('smoothing', self.smoothing) if args.smoothing is None else self.smoothing
            self.bp_shift = plot_data.get('bp_shift', self.bp_shift) if args.bp_shift is None else self.bp_shift
            self.combined = plot_data.get('combined', self.combined) if args.combined is None else self.combined
            self.color_trace = plot_data.get('color_trace', self.color_trace) if args.color_trace is None else self.color_trace
            self.hide_legend = plot_data.get('hide_legend', self.hide_legend) if args.hide_legend is None else self.hide_legend
            self.xscale = XScale(self)
            self.yscale = YScale(self)

    def generateGradients(self, opacity, i, color, secondary_color=None):
        # Creates DOM elements for top and bottom gradients
        secondary_color = secondary_color if secondary_color is not None else color
        # Generates top gradient
        composite_gradient_top = document.createElement("linearGradient")
        composite_gradient_top.setAttribute("class", "composite-gradient-top")
        composite_gradient_top.setAttribute("x1", "0%")
        composite_gradient_top.setAttribute("x2", "0%")
        composite_gradient_top.setAttribute("y1", "0%")
        composite_gradient_top.setAttribute("y2", "100%")
        composite_gradient_top.setAttribute("id", "composite-gradient-top" + str(i))
        top_stop_one = document.createElement("stop")
        top_stop_one.setAttribute("offset", "0")
        top_stop_one.setAttribute("stop-color", color)
        top_stop_one.setAttribute("stop-opacity", str(opacity))
        top_stop_two = document.createElement("stop")
        top_stop_two.setAttribute("offset", "1")
        top_stop_two.setAttribute("stop-color", color)
        top_stop_two.setAttribute("stop-opacity", "0")
        composite_gradient_top.appendChild(top_stop_one)
        composite_gradient_top.appendChild(top_stop_two)
        self.gradients_group.appendChild(composite_gradient_top)
        # Generates bottom gradient
        composite_gradient_bottom = document.createElement("linearGradient")
        composite_gradient_bottom.setAttribute("class", "composite-gradient-bottom")
        composite_gradient_bottom.setAttribute("x1", "0%")
        composite_gradient_bottom.setAttribute("x2", "0%")
        composite_gradient_bottom.setAttribute("y1", "100%")
        composite_gradient_bottom.setAttribute("y2", "0%")
        composite_gradient_bottom.setAttribute("id", "composite-gradient-bottom" + str(i))
        bottom_stop_one = document.createElement("stop")
        bottom_stop_one.setAttribute("offset", "0")
        bottom_stop_one.setAttribute("stop-color", secondary_color)
        bottom_stop_one.setAttribute("stop-opacity", str(opacity))
        bottom_stop_two = document.createElement("stop")
        bottom_stop_two.setAttribute("offset", "1")
        bottom_stop_two.setAttribute("stop-color", secondary_color)
        bottom_stop_two.setAttribute("stop-opacity", "0")
        composite_gradient_bottom.appendChild(bottom_stop_one)
        composite_gradient_bottom.appendChild(bottom_stop_two)            
        self.gradients_group.appendChild(composite_gradient_bottom)

# Class that mimics d3 scaleLinear() for x-axis of plot
class XScale:
    def __init__(self, plot):
        self.plot = plot
        self.domain = [plot.xmin, plot.xmax, plot.xmax - plot.xmin]
        self.range = [plot.margins.get('left'), plot.width - plot.margins.get('right'), plot.width - (plot.margins.get('right') + plot.margins.get('left'))]
        self.zero = (plot.width - (plot.margins.get('right') + plot.margins.get('left'))) * (abs(plot.xmin) / (abs(plot.xmin) + abs(plot.xmax))) + plot.margins.get('left')
    # Returns position given bp
    def get(self, value):
        return (self.range[2] / self.domain[2]) * value + self.zero
    # Returns bp given position
    def inverse(self, value):
        return (value - self.zero) * (self.domain[2] / self.range[2])
# Class that mimics d3 scaleLinear() for y-axis of plot
class YScale:
    def __init__(self, plot):
        self.domain = [plot.ymin, plot.ymax, abs(plot.ymax) + abs(plot.ymin)]
        self.range = [plot.margins.get('top'), plot.height - plot.margins.get('bottom'), plot.height - (plot.margins.get('top') + plot.margins.get('bottom'))]
        self.zero = (plot.height - (plot.margins.get('top') + plot.margins.get('bottom'))) * (0.5) + plot.margins.get('top') if plot.combined is False else self.range[1]
    # Returns position on svg given occupancy
    def get(self, value):
        return  self.zero - (self.range[2] / self.domain[2]) * value
    # Returns occupancy given position
    def inverse(self, value):
        return (value - self.zero) * (self.domain[2] / self.range[2])
