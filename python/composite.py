import numpy as np
import csv
import xml.dom.minidom as dom
import argparse
import math

class Composite:    
    def __init__(self, xmin=None, xmax=None, sense=[], anti=[]):
        self.xmin = xmin
        self.xmax = xmax
        self.sense = sense
        self.anti = anti
    
    def __str__(self):
        return "Sense: " + str(self.sense) + "\nAnti: " + str(self.anti) + "\nXMin: " + str(self.xmin) + "\nXMax: " + str(self.xmax)

def parseComposite(file):
    fileArr = open(file, "r").read().split("\n")
    xmin = None
    xmax = None
    sense = []
    anti = []
    xmin_curr = 0
    xmax_curr = 0
    offset = 0
    for line in fileArr:
        print("line")
        # Skip empty
        if len(line.strip()) == 0 :
            continue
        # Separate fields
        fields = line.split("\t")
        if fields[0] == "" or fields[0] == "NAME":
            print("name")
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
            print("sense")
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
    return Composite(xmin, xmax, sense, anti)


def main():
    c = parseComposite("sample.out")
    print(c)

if __name__ == "__main__":
    main()