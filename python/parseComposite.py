import csv
import xml.dom.minidom as dom
import argparse
import math
import composite
import os

"""
This script is designed to parse data from composite files, extract sense and anti-sense data, and organize the data into a
structured format. 

The key functions in the script:
1. parse_simple
2. get_prefixes_from_multiple_composites
3. parse_multiple_composite
4. 
"""

# Returns a simple composite from a single file
def parse_simple(file):
    fileArr = open(file, "r").read().split("\n")
    xmin = None
    xmax = None
    sense = []
    anti = []
    xmin_curr = 0
    xmax_curr = 0
    offset = 0
    for line in fileArr:
        # Skip empty
        if len(line.strip()) == 0 :
            continue
        # Separate fields
        fields = line.split("\t")
        if not fields[0].strip() or fields[0] == "NAME":
            xmin_curr = int(float(fields[1]))
            xmax_curr = int(float(fields[-1]))
            # If the x domain starts at 0 shift it to the left
            if xmin_curr == 0:
                xmin_curr -= math.floor(xmax_curr / 2)
                xmax_curr -= math.floor(xmax_curr / 2)
            # If the x domain is not defined yet, define it
            if xmin == None or xmax == None:
                xmin = xmin_curr
                xmax = xmax_curr
            # Redefine min and max if necessary
            xmax = max(xmax_curr, xmax)
            xmin = min(xmin_curr, xmin)
            sense = [0] * (xmax - xmin + 1)
            anti = [0] * (xmax - xmin + 1)
        # Add the values to sense and anti arrays
        if "sense" in fields[0].lower():
            i = 1
            while i < len(fields):
                sense[offset + i - 1] += float(fields[i])
                i += 1
        elif "anti" in fields[0].lower():
            i = 1
            while i < len(fields):
                anti[offset + i - 1] += float(fields[i])
                i += 1
        # If the first field is not empty or "NAME" and does not contain "sense" or "anti" parse as combined or midpoint data
        elif not (fields[0] == "" or fields[0] == "NAME"):
            i = 1
            while i < len(fields):
                sense[offset + i - 1] += float(fields[i]) / 2
                anti[offset + i - 1] += float(fields[i]) / 2
    return composite.SimpleComposite(xmin, xmax, sense, anti, os.path.basename(file).split('_')[0])

# Returns list of prefixes from multi-composite file, mimics the plotter method
def get_prefixes_from_multiple_composites(file):
    lines = open(file, "r").read().split("\n")
    names_list = []
    i = 0
    while i < len(lines):
        line = lines[i]
        # Skip empty 
        if line.strip() == "":
            i += 1
            continue
        # Get the first field
        col0 = line.split("\t")[0]
        if col0 == "" or col0[0] == "NAME":
            # Get the names of the composites for lines immediately following the xdomain
            i += 1
            names_list.append(lines[i].split("\t")[0])
        i += 1
    # Take the first name and split it by "_"
    split_name = names_list[0].split("_")
    idx = None
    # Iterate over each possible prefix-suffix split
    for i in range(1, len(split_name) - 1):
        prefix = "_".join(split_name[:i])
        suffix = "_".join(split_name[i:])
        n_prefix = sum(1 for n in names_list if n.startswith(prefix))
        n_suffix = sum(1 for n in names_list if n.endswith(suffix))
        if n_prefix * n_suffix == len(names_list):
            if n_suffix == len(names_list):
                idx = i if idx is None else idx
                break
            idx = i
    suffix = "_".join(split_name[idx:])
    # Get the prefixes by removing the suffix from the names
    return [n[:-len(suffix)] for n in names_list if n.endswith(suffix)]

# Returns dictionary with composite from multi-composite file, mimics the plotter method
def parse_multiple_composite(file, prefix):
    lines = open(file, "r").read().split("\n")
    composites = {}
    xmin = None
    xmax = None
    sense = []
    anti = []
    i = 0
    id = 0
    save_comp = False
    while i < len(lines):
        line = lines[i]
        # Skip empty
        if line.strip() == "":
            i += 1
            continue
        # Get the first field
        fields = line.split("\t")
        col0 = fields[0]
        if not col0.strip() or col0 == "NAME":
            # If the x domain is defined, save the composite
            if save_comp:
                composites[id] = composite.SimpleComposite(xmin, xmax, sense, anti, id)
            save_comp = False
            # Get the nex x domain
            fields = [field for field in fields if field.strip()]
            xmin = int(float(fields[0]))
            xmax = int(float(fields[-1]))
            # If the x domain starts at 0 shift it to the left
            if xmin == 0:
                xmin -= math.floor(xmax / 2)
                xmin -= math.floor(xmax / 2)
        elif col0.startswith(prefix):
            id = col0[len(prefix):].split("_")[0]
            save_comp = True
            # Add the values to sense and anti arrays
            fields = [field for field in fields if field.strip()]
            if "sense" in fields[0].lower():
                sense = [float(val) for val in fields[1:]]
            elif "anti" in fields[0].lower():
                anti = [float(val) for val in fields[1:]]
            else:
                sense = [float(val) / 2 for val in fields[1:]]
                anti = [float(val) / 2 for val in fields[1:]]
        i += 1
    # Save the last composite
    if save_comp:
        composites[id] = composite.SimpleComposite(xmin, xmax, sense, anti, id)
    return composites