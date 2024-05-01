import numpy as np
import re
import xml.dom.minidom as dom
import argparse
import copy
import slidingWindow

class Composite:
    pass

class XScale:
    def __init__(self, plot):
        self.domain = [plot.xmin, plot.xmax, plot.xmax - plot.xmin]
        self.range = [plot.margins.get('left'), plot.width - plot.margins.get('right'), plot.width - (plot.margins.get('right') + plot.margins.get('left'))]
        self.zero = (plot.width - (plot.margins.get('right') + plot.margins.get('left'))) * (abs(plot.xmin) / (abs(plot.xmin) + abs(plot.xmax))) + plot.margins.get('left')
    
    def get(self, value):
        return (self.range[2] / self.domain[2]) * value + self.zero
    
    def inverse(self, value):
        return (value - self.zero) * (self.domain[2] / self.range[2])

class yScale:
    def __init__(self, plot):
        self.domain = [plot.ymin, plot.ymax, plot.ymax - plot.ymin]
        self.range = [plot.margins.get('top'), plot.height - plot.margins.get('bottom'), plot.height - (plot.margins.get('top') + plot.margins.get('bottom'))]
        self.zero = (plot.height - (plot.margins.get('bottom') + plot.margins.get('top'))) / 2 + plot.margins.get('top') if plot.combined is False else self.range[1]
    
    def get(self, value):
        return (self.range[2] / self.domain[2]) * value + self.zero
    
    def inverse(self, value):
        return (value - self.zero) * (self.domain[2] / self.range[2])
    
class Plot:
    def __init__(self, title="Composite plot", xmin=-500, xmax=500, ymin=-1, ymax=1, xlabel="Position (bp)", ylabel="Occupancy (AU)", 
                 opacity=1, smoothing=7, bp_shift=0, combined=False, color_trace=False, show_legend=True):
        self.title = title
        self.xmin = xmin
        self.xmax = xmax
        self.ymin = ymin
        self.ymax = ymax
        self.xlabel = xlabel
        self.ylabel = ylabel
        self.width = 460
        self.height = 300
        self.margins = {'top': 30, 'right': 170, 'bottom': 35, 'left': 40}
        self.opacity = opacity
        self.smoothing = smoothing
        self.bp_shift = bp_shift
        self.combined = combined
        self.color_trace = color_trace
        self.show_legend = show_legend
        document = dom.Document()
        self.composite_group = document.createElement("g")
        self.composite_group.setAttribute("class", "composite plotted")
        self.gradients_group = document.createElement("defs")
        self.super_group = document.createElement("g")
        self.xscale = XScale(self)
        self.yscale = yScale(self)
        self.num_composites = 0

    
    def plot_composite(self, xmin, xmax, sense, anti, scale=1, color=None, secondary_color=None, i=None, opacity=None, smoothing=None, bp_shift=None, hide_sense=False, hide_anti=False, baseline=0):
        document = dom.Document()
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
            composite_fill_top.setAttribute("points", " ".join(points := [f"{self.xscale.get(d)},{self.yscale.get(-scaled_occupancy[j])}" for j, d in enumerate(truncated_xdomain)]) + f" {self.xscale.get(truncated_xdomain[-1])},{self.yscale.get(0)} {self.xscale.get(truncated_xdomain[0])},{self.yscale.get(0)}")
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
                composite_fill_top.setAttribute("points", " ".join(sense_points := [f"{self.xscale.get(d)},{self.yscale.get(-scaled_sense[j])}" for j, d in enumerate(truncated_sense_domain)]) + f" {self.xscale.get(truncated_sense_domain[-1])},{self.yscale.get(0)} {self.xscale.get(truncated_sense_domain[0])},{self.yscale.get(0)}")
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
                composite_fill_bottom.setAttribute("points", " ".join(anti_points := [f"{self.xscale.get(d)},{self.yscale.get(scaled_anti[j])}" for j, d in enumerate(truncated_anti_domain)]) + f" {self.xscale.get(truncated_anti_domain[-1])},{self.yscale.get(0)} {self.xscale.get(truncated_anti_domain[0])},{self.yscale.get(0)}")
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
        self.super_group.appendChild(self.gradients_group)
        self.super_group.appendChild(self.composite_group)
        return self.super_group
    
    def generateGradients(self, opacity, i, color, secondary_color=None):
        # Creates DOM elements for top and bottom gradients
        secondary_color = secondary_color if secondary_color is not None else color

        document = dom.Document()
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
