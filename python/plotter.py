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
import svgFactory
import json 

document = dom.Document()

def main():
    return True

if __name__ == "__main__":
    # Remove 'plotter' from sys.argv
    sys.argv.pop(0)
    # Load subcommands into appropriate arrays
    i = -1
    k = -1
    composite_commands = []
    ref_line_commands = []
    plot_command = ""
    current = ""
    for word in sys.argv:
        if word == "composite":
            i += 1
            composite_commands.append("")
            current = "composite"
        elif word == "reference-line":
            k += 1
            ref_line_commands.append("")
            current = "ref"
        elif word == "plot":
            current = "plot"
        elif current == "composite":
            composite_commands[i] += f" {word}"
        elif current == "ref":
            ref_line_commands[k] += f" {word}"
        elif current == "plot":
            plot_command += f" {word}"
    # Create parser for plot subcommand
    plot_parser = argparse.ArgumentParser()
    plot_parser.add_argument("--smoothing", type=int)
    plot_parser.add_argument("--bp-shift", type=int)
    plot_parser.add_argument("--opacity", type=float)
    plot_parser.add_argument("--title", nargs="+")
    plot_parser.add_argument("--xmin",type=int)
    plot_parser.add_argument("--xmax",type=int)
    plot_parser.add_argument("--xlabel", nargs="+")
    plot_parser.add_argument("--ymin", type=int)
    plot_parser.add_argument("--ymax", type=int)
    plot_parser.add_argument("--ylabel", nargs="+")
    plot_parser.add_argument("--color-trace", action="store_true", default=False)
    plot_parser.add_argument("--combined", action="store_true", default=False)
    plot_parser.add_argument("--hide-legend", action="store_true", default=False)
    plot_parser.add_argument("--no-resize", action="store_true", default=False)
    plot_parser.add_argument("--no-shrink", action="store_true", default=False)
    plot_parser.add_argument("--out")
    plot_parser.add_argument("--export-json")
    plot_parser.add_argument("--import-json")
    plot_parser.add_argument("--import-settings-json")

    # Create plot based on plot subcommand, default values in Plot class will be used if argument is not specified
    plot_args = plot_parser.parse_args(plot_command.split())
    p = plot.Plot(title=" ".join(plot_args.title) if plot_args.title is not None else None, xmin=plot_args.xmin, xmax=plot_args.xmax, ymin=plot_args.ymin, ymax=plot_args.ymax, xlabel=" ".join(plot_args.xlabel) if plot_args.xlabel is not None else None, 
                  ylabel=" ".join(plot_args.ylabel) if plot_args.ylabel is not None else None, opacity=plot_args.opacity, smoothing=plot_args.smoothing, bp_shift=plot_args.bp_shift, combined=plot_args.combined, color_trace=plot_args.color_trace, hide_legend=plot_args.hide_legend)

    # Create arrays for default composite names and colors
    names = range(1, len(composite_commands) + 1)
    colors = ["#BFBFBF","#000000","#FF0000","#FF9100","#D7D700","#07E200","#00B0F0","#0007FF","#A700FF","#FF00D0"]
    # Create parser for composite subcommands
    composite_parser = argparse.ArgumentParser()
    composite_parser.add_argument("files")
    composite_parser.add_argument("--name")
    composite_parser.add_argument("--color")
    composite_parser.add_argument("--secondary-color")
    composite_parser.add_argument("--scale", type=float)
    composite_parser.add_argument("--shift-occupancy", type=float)
    composite_parser.add_argument("--smoothing", type=int)
    composite_parser.add_argument("--opacity", type=float)
    composite_parser.add_argument("--bp-shift", type=int)
    composite_parser.add_argument("--hide-sense", action="store_true", default=False)
    composite_parser.add_argument("--hide-anti", action="store_true", default=False)
    composite_parser.add_argument("--swap-strands", action="store_true", default=False)
    # Parse composite subcommands, use values values in Composite class if not specified 
    i = 0
    for command in composite_commands:
        args = composite_parser.parse_args(command.split())
        composite = Composite(scale=args.scale, color=args.color if args.color is not None else colors[i % len(colors)], secondary_color=args.secondary_color, 
                                         smoothing=args.smoothing, bp_shift=args.bp_shift, hide_sense= args.hide_sense, hide_anti= args.hide_anti, baseline=args.shift_occupancy,
                                         name=args.name if args.name is not None else names[i], opacity=args.opacity,)
        
        composite_files = args.files.split(":")
        for c in composite_files:
            #Check if composite file contains multiple composites
            if sum(1 for line in open(c) if len(line.strip()) != 0) <= 3:
                sc = parseComposite.parse_simple(c)
                composite.load_simple_composite(sc)
            else:
                prefixes = parseComposite.get_prefixes_from_multiple_composites(c)
                cd = parseComposite.parse_multiple_composite(c, prefixes[0])
                composite.load_composite_dict(cd)        
        p.add_composite_group(composite)
        i += 1    
 
    # Import settings and composites from plot, preserving options specified in this call
    if plot_args.import_json:
        p.import_data(plot_args.import_json, plot_args, True)
    elif plot_args.import_settings_json:
        p.import_data(plot_args.import_settings_json, plot_args, False)

    # If --no-shrink is specified, don't change y-axis but resize x-axis
    if plot_args.no_shrink:
        p.autoscale_axes(False)
    # If --no-resize is specified, don't change either axis
    elif not plot_args.no_resize:
        p.autoscale_axes(True)

    p.plot_composites()

    # Create parser for reference-line subcommand
    reference_parser = argparse.ArgumentParser()
    reference_parser.add_argument("axis")
    reference_parser.add_argument("--style")
    reference_parser.add_argument("--color")
    reference_parser.add_argument("--val", type=float)
    reference_parser.add_argument("--opacity",type=float)
    # Add reference lines to plot
    for command in ref_line_commands:
        args = reference_parser.parse_args(command.split())
        p.plot_reference_line(axis=args.axis, val=args.val, style=args.style, color=args.color, opacity=args.opacity)
    # Use svg factory to generate svg based on plot
    svg = svgFactory.generateSVG(p)
    with open(plot_args.out if plot_args.out is not None else "out.svg", 'w') as f:
        # write to output
        svg.writexml(f, addindent='    ', newl='\n')
    
    # Output plot json if specified
    if plot_args.export_json:
        str = json.dumps(p.export(), indent=2)
        with open(plot_args.export_json, 'w') as f:
            # Write to output
            f.write(str)