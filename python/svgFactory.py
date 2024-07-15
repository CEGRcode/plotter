import plot
import composite
from composite import Composite
from composite import SimpleComposite
import re
import xml.dom.minidom as dom
import argparse
import math
import parseComposite
import sys
from enum import Enum

def generateSVG(plot):
    # Create svg with similar attributes to plotter
    document = dom.Document()
    svg = document.appendChild(document.createElement('svg'))
    svg.setAttribute("xmlns", "http://www.w3.org/2000/svg")
    svg.setAttribute("id", "main-plot")
    svg.setAttribute("font-family", "Helvetica")
    self.aspect_ratio = float(aspect_ratio.split(":")[0]) / float(aspect_ratio.split(":")[2])
    self.width = 160 + 300 * aspect_ratio
    self.height = 300 * (1 / aspect_ratio)
    svg.setAttribute("viewBox", "0 0 460 600")
    svg.setAttribute("style", "height: 50vh; max-width: 100%; overflow: hide;")
    svg.setAttribute("baseProfile", "full")
    # Create title
    title = document.createElement('text')
    title.setAttribute("font-size", "16")
    title.setAttribute("x", str((plot.width + plot.margins.get('left') - plot.margins.get('right')) / 2))
    title.setAttribute("y", "20")
    title.setAttribute("label", "title")
    title.setAttribute("id", "main-plot-title")
    title.setAttribute("style", "text-anchor: middle; cursor: pointer;")
    title.appendChild(document.createTextNode(plot.title))
    # Create xlabel, xmin and xmax
    xlabel = document.createElement('text')
    xlabel.setAttribute("font-size", "16")
    xlabel.setAttribute("x", str((plot.width + plot.margins.get('left') - plot.margins.get('right')) / 2))
    xlabel.setAttribute("y", str(plot.height - 5))
    xlabel.setAttribute("label", "xlabel")
    xlabel.setAttribute("id", "main-plot-xlabel")
    xlabel.setAttribute("style", "text-anchor: middle; cursor: pointer;")
    xlabel.appendChild(document.createTextNode(plot.xlabel))
    xmin = document.createElement('text')
    xmin.setAttribute("x", str(plot.margins.get("left")))
    xmin.setAttribute("y", str(plot.height - plot.margins.get("bottom") + 15))
    xmin.setAttribute("text-anchor", "middle")
    xmin.setAttribute("font-size", "14px")
    xmin.appendChild(document.createTextNode(str(plot.xmin)))
    xmax = document.createElement('text')
    xmax.setAttribute("x", str(plot.width - plot.margins.get("right")))
    xmax.setAttribute("y", str(plot.height - plot.margins.get("bottom") + 15))
    xmax.setAttribute("text-anchor", "middle")
    xmax.setAttribute("font-size", "14px")
    xmax.appendChild(document.createTextNode(str(plot.xmax)))
    # Create ylabel with exponent
    ylabel = document.createElement('text')
    ylabel.setAttribute("font-size", "16")
    ylabel.setAttribute("x", "12")
    ylabel.setAttribute("y", str((plot.height + plot.margins.get('top') - plot.margins.get('bottom')) / 2))
    ylabel.setAttribute("label", "ylabel")
    ylabel.setAttribute("id", "main-plot-ylabel")
    ylabel.setAttribute("transform", "rotate(-90 12 147.5)")
    ylabel.setAttribute("style", "text-anchor: middle; cursor: pointer;")
    round_exp = 1 - math.floor(math.log10(plot.ymax - plot.ymin))
    round_factor = 10 ** round_exp
    exp_label = round_exp <= -2 or round_exp >= 2
    if exp_label:
        ylabel.appendChild(document.createTextNode(plot.ylabel + " X10"))
        ylabel_suffix = document.createElement("tspan")
        ylabel_suffix.setAttribute("font-size", "8px")
        ylabel_suffix.setAttribute("baseline-shift", "super")
        ylabel_suffix.appendChild(document.createTextNode(str(1 - round_exp)))
        ylabel.appendChild(ylabel_suffix)
    else:
        ylabel.appendChild(document.createTextNode(plot.ylabel))
    # Create ymin and ymax
    if not plot.combined:
        ymin = document.createElement('text')
        ymin.setAttribute("x", "30")
        ymin.setAttribute("y", str(plot.height - plot.margins.get("bottom")))
        ymin.setAttribute("text-anchor", "end")
        ymin.setAttribute("font-size", "14px")
        ymin.appendChild(document.createTextNode(str((round(plot.ymin, 2) * round_factor) / (10 if exp_label else round_factor))))
        svg.appendChild(ymin)
    ymax = document.createElement('text')
    ymax.setAttribute("x", "30")
    ymax.setAttribute("y", str(plot.margins.get("top") + 10))
    ymax.setAttribute("text-anchor", "end")
    ymax.setAttribute("font-size", "14px")
    ymax.appendChild(document.createTextNode(str((round(plot.ymax, 2) * round_factor) / (10 if exp_label else round_factor))))
    # Create vertical line at reference point
    zero_line = document.createElement("line")
    zero_line.setAttribute("stroke", "grey")
    zero_line.setAttribute("opacity", "0.5")
    zero_line.setAttribute("y1", str(plot.margins.get("top")))
    zero_line.setAttribute("y2", str(plot.height - plot.margins.get("bottom")))
    zero_line.setAttribute("x1", str(plot.xscale.get(0)))
    zero_line.setAttribute("x2", str(plot.xscale.get(0)))
    zero_line.setAttribute("stroke-dasharray", "5,5")
    svg.appendChild(zero_line)
    svg.appendChild(title)
    svg.appendChild(xlabel)
    svg.appendChild(ylabel)
    svg.appendChild(xmin)
    svg.appendChild(xmax)
    svg.appendChild(ymax)
    # Append composites, reference lines, and legend from plot onto svg
    plot.create_legend()
    svg.appendChild(plot.get_plot())
    # Create axes with tick marks
    axis_left = axis("left", None, plot, document)
    axis_right = axis("right", None, plot, document)
    axis_bottom = axis("bottom", None, plot, document)
    axis_top = axis("top", None, plot, document)
    axis_middle = axis("middle", None, plot, document)
    # Append all elements to svg
    svg.appendChild(axis_left)
    svg.appendChild(axis_right)
    svg.appendChild(axis_bottom)
    svg.appendChild(axis_top)
    svg.appendChild(axis_middle)
    # Return the svg
    return svg

# Create axis elements for plot
def axis(orient, scale, plot, document):
    # Use appropriate tick parameters for axis
    tickSpacing = 23.5 if orient == "left" or orient == "right" else 25
    tickSize = 6 if orient == "left" or orient == "top" else -6
    axis_group = document.createElement("g")
    axis = document.createElement("line")
    # Get coords for plot margins
    bottom = plot.height - plot.margins.get('bottom')
    top = plot.margins.get("top")
    right = plot.width - (plot.margins.get('right'))
    left = plot.margins.get("left")
    # Draw left axis
    if (orient == "left"):
        axis.setAttribute("x1", str(left))
        axis.setAttribute("x2", str(left))
        axis.setAttribute("y1", str(top))
        axis.setAttribute("y2", str(bottom))
        i = top
        while i < bottom:
            tick = document.createElement("line")
            tick.setAttribute("y1", str(i))
            tick.setAttribute("y2", str(i))
            tick.setAttribute("x1", str(left))
            tick.setAttribute("x2", str(left + tickSize))
            axis_group.appendChild(tick)
            i += tickSpacing
    # Draw right axis
    elif (orient == "right"):
        axis.setAttribute("x1", str(right))
        axis.setAttribute("x2", str(right))
        axis.setAttribute("y1", str(top))
        axis.setAttribute("y2", str(bottom))
        i = top
        while i < bottom:
            tick = document.createElement("line")
            tick.setAttribute("y1", str(i))
            tick.setAttribute("y2", str(i))
            tick.setAttribute("x1", str(right))
            tick.setAttribute("x2", str(right + tickSize))
            axis_group.appendChild(tick)
            i += tickSpacing
    # Draw bottom axis
    elif(orient == "bottom"):
        axis.setAttribute("x1", str(left))
        axis.setAttribute("x2", str(right))
        axis.setAttribute("y1", str(bottom))
        axis.setAttribute("y2", str(bottom))
        i = left
        while i < right:
            tick = document.createElement("line")
            tick.setAttribute("y1", str(bottom))
            tick.setAttribute("y2", str(bottom + tickSize))
            tick.setAttribute("x1", str(i))
            tick.setAttribute("x2", str(i))
            axis_group.appendChild(tick)
            i += tickSpacing
    # Draw top axis
    elif (orient == "top"):
        axis.setAttribute("x1", str(left))
        axis.setAttribute("x2", str(right))
        axis.setAttribute("y1", str(top))
        axis.setAttribute("y2", str(top))
        i = left
        while i < right:
            tick = document.createElement("line")
            tick.setAttribute("y1", str(top))
            tick.setAttribute("y2", str(top + tickSize))
            tick.setAttribute("x1", str(i))
            tick.setAttribute("x2", str(i))
            axis_group.appendChild(tick)
            i += tickSpacing
    # Draw middle axis if plot is not combined
    elif (orient == "middle"):
        if not plot.combined == True:
            axis.setAttribute("x1", str(left))
            axis.setAttribute("x2", str(right))
            axis.setAttribute("y1", str(plot.yscale.get(0)))
            axis.setAttribute("y2", str(plot.yscale.get(0)))
            i = left
            while i < right:
                tick = document.createElement("line")
                tick.setAttribute("y1", str(plot.yscale.get(0) - tickSize))
                tick.setAttribute("y2", str(plot.yscale.get(0) + tickSize))
                tick.setAttribute("x1", str(i))
                tick.setAttribute("x2", str(i))
                axis_group.appendChild(tick)
                i += tickSpacing
    axis_group.setAttribute("stroke", "black")
    axis_group.appendChild(axis)
    return axis_group