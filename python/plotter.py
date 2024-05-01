import numpy as np
import plot
import composite
import re
import xml.dom.minidom as dom
import argparse
import parseComposite

document = dom.Document()
group = document.appendChild(document.createElement('g'))

def generateSVG(plot):
    title = document.createElement('text')
    title.setAttribute("font-size", "16")
    title.setAttribute("x", str((plot.width + plot.margins.get('left') - plot.margins.get('right')) / 2))
    title.setAttribute("y", "20")
    title.setAttribute("label", "title")
    title.setAttribute("id", "main-plot-title")
    title.setAttribute("style", "text-anchor: middle; cursor: pointer;")
    title.appendChild(document.createTextNode(plot.title))

    xlabel = document.createElement('text')
    xlabel.setAttribute("font-size", "16")
    xlabel.setAttribute("x", str((plot.width + plot.margins.get('left') - plot.margins.get('right')) / 2))
    xlabel.setAttribute("y", str(plot.height - 5))
    xlabel.setAttribute("label", "xlabel")
    xlabel.setAttribute("id", "main-plot-xlabel")
    xlabel.setAttribute("style", "text-anchor: middle; cursor: pointer;")
    xlabel.appendChild(document.createTextNode(plot.xlabel))

    ylabel = document.createElement('text')
    ylabel.setAttribute("font-size", "16")
    ylabel.setAttribute("x", "12")
    ylabel.setAttribute("y", str((plot.height + plot.margins.get('top') - plot.margins.get('bottom')) / 2))
    ylabel.setAttribute("label", "ylabel")
    ylabel.setAttribute("id", "main-plot-ylabel")
    ylabel.setAttribute("transform", "rotate(-90 12 147.5)")
    ylabel.setAttribute("style", "text-anchor: middle; cursor: pointer;")
    ylabel.appendChild(document.createTextNode(plot.ylabel))

    composite_group = document.createElement('g')

    legend = document.createElement('g')
    legend.setAttribute("transform", "translate(" + str(plot.width - plot.margins.get("right") + 25) + " " + str(plot.margins.get("top")) + ")")

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

    ymin = document.createElement('text')
    ymin.setAttribute("x", "30")
    ymin.setAttribute("y", str(plot.height - plot.margins.get("bottom")))
    ymin.setAttribute("text-anchor", "middle")
    ymin.setAttribute("font-size", "14px")
    ymin.appendChild(document.createTextNode(str(plot.ymin)))

    ymax = document.createElement('text')
    ymax.setAttribute("x", "30")
    ymax.setAttribute("y", str(plot.margins.get("top") + 10))
    ymax.setAttribute("text-anchor", "middle")
    ymax.setAttribute("font-size", "14px")
    ymax.appendChild(document.createTextNode(str(plot.ymax)))


    group.appendChild(title)
    group.appendChild(xlabel)
    group.appendChild(ylabel)
    group.appendChild(xmin)
    group.appendChild(xmax)
    group.appendChild(ymin)
    group.appendChild(ymax)

def main():
    return True



if __name__ == "__main__":
    p = plot.Plot(combined=False, color_trace=False, opacity=1, xmin=-500)

    parser = argparse.ArgumentParser()
    parser.add_argument("composites", nargs="+")
    args = parser.parse_args()
    for g in args.composites:
        composite_group = composite.CompositeGroup()
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
    group.appendChild(p.plot_composite(composite_group.xmin, composite_group.xmax, composite_group.sense, composite_group.anti, scale=15, color="#FF0000", secondary_color="#0000FF"))

    generateSVG(p)
    if p.combined:
        template = open("resources/combined_template.xml", "r").read()
    else:
        template = open("resources/template.xml", "r").read()
    with open("out.xml", 'w') as f:
        f.write(template + "\n\t")
        group.writexml(f, addindent='    ', newl='\n')
        f.write("</svg>")

                
    print(args.composites)
