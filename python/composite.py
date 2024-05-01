import numpy as np
import csv
import xml.dom.minidom as dom
import argparse
import math
import parseComposite

class Composite:    
    def __init__(self, xmin=None, xmax=None, sense=[], anti=[], id=""):
        self.xmin = xmin
        self.xmax = xmax
        self.sense = sense
        self.anti = anti
        self.id = id
    
    def __str__(self):
        return "Sense: " + str(self.sense) + "\nAnti: " + str(self.anti) + "\nXMin: " + str(self.xmin) + "\nXMax: " + str(self.xmax) + "\nID:" + str(self.id)

class CompositeGroup:
    def __init__(self):
        self.xmin = 0
        self.xmax = 0
        self.sense = []
        self.anti = []
        self.individual_composites = {}
        self.files_loaded = len(self.individual_composites)
    
    def loadComposite(self,composite: Composite):
        # If no files, initialize sense and anti arrays; otherwise, pad sense and anti arrays to new xdomain
        self.xmin = min(composite.xmin, self.xmin)
        self.xmax = max(composite.xmax, self.xmax)
        if len(self.individual_composites) == 0:
            self.sense = [0] * (composite.xmax - composite.xmin + 1)
            self.anti = [0] * (composite.xmax - composite.xmin + 1)
        else:
            xmin = min([int(self.individual_composites[c].xmin) for c in self.individual_composites])
            xmax = max([int(self.individual_composites[c].xmax) for c in self.individual_composites])
            prefix = [0] * (xmin - self.xmin)
            suffix = [0] * (self.xmax - xmax)
            self.sense = prefix + self.sense + suffix
            self.anti = prefix + self.anti + suffix

        # Update sense and anti arrays
        j = composite.xmin - self.xmin
        while j <= composite.xmax - composite.xmin:
            idx = composite.xmin - self.xmin + j
            self.sense[idx] += composite.sense[j]
            self.anti[idx] += composite.anti[j]
            j += 1

        self.individual_composites[composite.id] = composite

    def loadCompositeDict(self,compositeDict: dict):
        for composite in compositeDict:
            # If no files, initialize sense and anti arrays; otherwise, pad sense and anti arrays to new xdomain
            self.xmin = min(composite.xmin, self.xmin)
            self.xmax = max(composite.xmax, self.xmax)
            if len(self.individual_composites) == 0:
                self.sense = [0] * (composite.xmax - composite.xmin + 1)
                self.anti = [0] * (composite.xmax - composite.xmin + 1)
            else:
                xmin = min([c.xmin for c in self.individual_composites])
                xmax = max([c.xmax for c in self.individual_composites])
                prefix = [0] * (xmin - self.xmin)
                suffix = [0] * (self.xmax - xmax)
                self.sense = prefix + self.sense + suffix
                self.anti = prefix + self.anti + suffix

            # Update sense and anti arrays
            j = composite.xmin - self.xmin
            while j <= composite.xmax - composite.xmin:
                idx = composite.xmin - self.xmin + j
                self.sense[idx] += composite.sense[j]
                self.anti[idx] += composite.anti[j]
                j += 1

            self.individual_composites[composite.id] = composite

    def __str__(self):
        return str(self.individual_composites)

def main():
    c = parseComposite.parseComposite("sample_composites/sample_1.out")
    compositeGroup = CompositeGroup()
    compositeGroup.loadComposite(c)
    c2 = parseComposite.parseComposite("sample_composites/sample2.out.txt")
    compositeGroup.loadComposite(c2)
    print(compositeGroup)


if __name__ == "__main__":
    main()