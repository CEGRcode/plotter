import numpy as np
import plot
import composite
from composite import CompositeGroup
import re
import xml.dom.minidom as dom
import argparse
import math
import parseComposite

document = dom.Document()
group = document.appendChild(document.createElement('svg'))
group.setAttribute("xmlns", "http://www.w3.org/2000/svg")
group.setAttribute("id", "main-plot")
group.setAttribute("font-family", "Helvetica")
group.setAttribute("viewBox", "0 0 460 300")
group.setAttribute("style", "height: 50vh; max-width: 100%; overflow: hide;")
group.setAttribute("baseProfile", "full")

def generateSVG(plot):
    #Create title
    title = document.createElement('text')
    title.setAttribute("font-size", "16")
    title.setAttribute("x", str((plot.width + plot.margins.get('left') - plot.margins.get('right')) / 2))
    title.setAttribute("y", "20")
    title.setAttribute("label", "title")
    title.setAttribute("id", "main-plot-title")
    title.setAttribute("style", "text-anchor: middle; cursor: pointer;")
    title.appendChild(document.createTextNode(plot.title))

    #Create labels for xmin and xmax
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

    #Create ylabel with exponent
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
    print(round_factor)
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

    #Create ymin and ymax
    if not plot.combined:
        ymin = document.createElement('text')
        ymin.setAttribute("x", "30")
        ymin.setAttribute("y", str(plot.height - plot.margins.get("bottom")))
        ymin.setAttribute("text-anchor", "end")
        ymin.setAttribute("font-size", "14px")
        ymin.appendChild(document.createTextNode(str((round(plot.ymin, 2) * round_factor) / (10 if exp_label else round_factor))))
        group.appendChild(ymin)

    ymax = document.createElement('text')
    ymax.setAttribute("x", "30")
    ymax.setAttribute("y", str(plot.margins.get("top") + 10))
    ymax.setAttribute("text-anchor", "end")
    ymax.setAttribute("font-size", "14px")
    ymax.appendChild(document.createTextNode(str((round(plot.ymax, 2) * round_factor) / (10 if exp_label else round_factor))))

    #Create legend
    group.appendChild(create_legend(plot))

    #Create vertical line at reference point
    zero_line = document.createElement("line")
    zero_line.setAttribute("stroke", "grey")
    zero_line.setAttribute("opacity", "0.5")
    zero_line.setAttribute("y1", str(plot.margins.get("top")))
    zero_line.setAttribute("y2", str(plot.height - plot.margins.get("bottom")))
    zero_line.setAttribute("x1", str(plot.xscale.get(0)))
    zero_line.setAttribute("x2", str(plot.xscale.get(0)))
    zero_line.setAttribute("stroke-dasharray", "5,5")
    group.appendChild(zero_line)

    axis_left = axis("left", None, plot)
    axis_right = axis("right", None, plot)
    axis_bottom = axis("bottom", None, plot)
    axis_top = axis("top", None, plot)
    axis_middle = axis("middle", None, plot)

    group.appendChild(axis_left)
    group.appendChild(axis_right)
    group.appendChild(axis_bottom)
    group.appendChild(axis_top)
    group.appendChild(axis_middle)
    
    group.appendChild(title)
    group.appendChild(xlabel)
    group.appendChild(ylabel)
    group.appendChild(xmin)
    group.appendChild(xmax)
    group.appendChild(ymax)

def axis(orient, scale, plot):
    tickSpacing = 23.5 if orient == "left" or orient == "right" else 25
    tickSize = 6 if orient == "left" or orient == "top" else -6
    axis_group = document.createElement("g")
    axis = document.createElement("line")

    bottom = plot.height - plot.margins.get('bottom')
    top = plot.margins.get("top")
    right = plot.width - (plot.margins.get('right'))
    left = plot.margins.get("left")

    match orient:
        case "left":
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
        case "right":
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
        case "bottom":
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
        case "top":
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
        case "middle":
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

def create_legend(plot):
    legend = document.createElement('g')
    legend.setAttribute("transform", "translate(" + str(plot.width - plot.margins.get("right") + 25) + " " + str(plot.margins.get("top")) + ")")
    i = 0
    for composite_group in plot.composite_groups:
        legend_element = document.createElement("g")
        legend_element.setAttribute("transform", "translate(0," + str(24 * i) + ")")
        
        legend_color_sense = document.createElement("polygon")
        legend_color_sense.setAttribute("points", "0,0 15,0 15,15 0,15")
        legend_color_sense.setAttribute("fill", composite_group.color)
        legend_element.appendChild(legend_color_sense)
        legend_color_anti = document.createElement("polygon")
        legend_color_anti.setAttribute("points", "0,0 15,0 15,15 0,15")
        legend_element.appendChild(legend_color_anti)
        legend_color_anti.setAttribute("fill", composite_group.secondary_color)
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
        id.appendChild(document.createTextNode(str(composite_group.name)))
        legend_element.appendChild(id)
        legend.appendChild(legend_element)
        i += 1
    return legend


def main():
    return True

if __name__ == "__main__":
    p = plot.Plot(combined=False, color_trace=False, opacity=1, xmin=-1000)

    parser = argparse.ArgumentParser()
    parser.add_argument("composites", nargs="+")
    parser.add_argument("--names", nargs="+", default=None)
    parser.add_argument("--colors", nargs="+", default=None)
    parser.add_argument("--secondary-colors", nargs="+", default=None)

    # parser = argparse.ArgumentParser()

    # for i in range(0,2):
    #     sp = parser.add_subparsers(dest='sub{i}', required=False)
    #     spp = sp.add_parser("composite")
    #     spp.add_argument('--name', dest=f"name{i}", nargs=1)

    args = parser.parse_args()
    # print(args)

    composite_groups = []
    names = args.names if args.names != None else range(1, len(args.composites) + 1)
    colors = args.colors if args.colors != None else ["#BFBFBF","#000000","#FF0000","#FF9100","#D7D700","#07E200","#00B0F0","#0007FF","#A700FF","#FF00D0"]
    secondary_colors = args.secondary_colors
    print(args.secondary_colors)

    i = 0
    for g in args.composites:
        composite_group = CompositeGroup(name=names[i], color=colors[i % len(colors)])
        composite_files = g.split("-")
        for c in composite_files:
            #Check if composite file contains multiple composites
            if sum(1 for line in open(c) if len(line.strip()) != 0) <= 3:
                composite = parseComposite.parseComposite(c)
                composite_group.loadComposite(composite)
            else:
                prefixes = parseComposite.get_prefixes_from_multiple_composites(c)
                composites = parseComposite.parse_multiple_composite(c, prefixes)
                composite_group.loadCompositeDict(composites)
        p.add_composite_group(composite_group)
        i += 1
    p.autoscale_axes()
    group.appendChild(p.plot_composite_groups())

    generateSVG(p)
    with open("out.xml", 'w') as f:
        # f.write(template + "\n\t")
        group.writexml(f, addindent='    ', newl='\n')

                
    print(args.composites)
