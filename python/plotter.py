import numpy as np
import plot
import composite
import re
import xml.dom.minidom as dom
import argparse

def generateSVG(plot):
    document = dom.Document()
    group = document.appendChild(document.createElement('g'))
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

    group.appendChild(title)
    group.appendChild(xlabel)
    group.appendChild(ylabel)

    c = composite.parseComposite("sample.out")
    group.appendChild(plot.plot_composite(c.xmin, c.xmax, c.sense, c.anti, scale=30, color="#FF0000", secondary_color="#0000FF"))

    template = open("combined_template.xml", "r").read()
    with open("out.xml", 'w') as f:
        f.write(template + "\n\t")
        group.writexml(f, addindent='    ', newl='\n')
        f.write("</svg>")

def main():
    p = plot.Plot(combined=True)
    generateSVG(p)

if __name__ == "__main__":
    main()