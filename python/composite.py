import csv
import xml.dom.minidom as dom
import argparse
import math
import parseComposite

# Objected to store bare-bones composite data, can be used with plot_composite function
class SimpleComposite:    
    def __init__(self, xmin=None, xmax=None, sense=[], anti=[], id=""):
        self.xmin = xmin
        self.xmax = xmax
        self.sense = sense
        self.anti = anti
        self.id = id

# Object to store composite data with options for plotting, similar to a settings row
class Composite:
    def __init__(self, scale=1, color=None, secondary_color=None, i=None, opacity=None, smoothing=None, bp_shift=None, hide_sense=False, hide_anti=False, baseline=0, name=None):
        # Sets default values
        self.scale = scale if scale is not None else 1
        self.color = color if color is not None else "#0000FF"
        self.secondary_color = secondary_color if secondary_color is not None else color
        self.baseline = baseline if baseline is not None else 0
        self.xmin = 0
        self.xmax = 0
        self.sense = []
        self.anti = []
        self.opacity = opacity
        self.smoothing = smoothing
        self.bp_shift = bp_shift
        self.hide_anti = hide_anti
        self.hide_sense = hide_sense
        self.individual_files = {}
        self.files_loaded = len(self.individual_files)
        self.name = name
    # Adds a simple composite to the 'row'
    def load_simple_composite(self,composite: SimpleComposite):
        # If no files, initialize sense and anti arrays; otherwise, pad sense and anti arrays to new xdomain
        self.xmin = min(composite.xmin, self.xmin)
        self.xmax = max(composite.xmax, self.xmax)
        if len(self.individual_files) == 0:
            self.sense = [0] * (composite.xmax - composite.xmin + 1)
            self.anti = [0] * (composite.xmax - composite.xmin + 1)
        else:
            xmin = min([int(self.individual_files[c].xmin) for c in self.individual_files])
            xmax = max([int(self.individual_files[c].xmax) for c in self.individual_files])
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
        self.individual_files[composite.id] = composite
    # Loads dictionary from parse_multiple_composites
    def load_composite_dict(self,compositeDict: dict):
        for composite in compositeDict:
            # If no files, initialize sense and anti arrays; otherwise, pad sense and anti arrays to new xdomain
            self.xmin = min(composite.xmin, self.xmin)
            self.xmax = max(composite.xmax, self.xmax)
            if len(self.individual_files) == 0:
                self.sense = [0] * (composite.xmax - composite.xmin + 1)
                self.anti = [0] * (composite.xmax - composite.xmin + 1)
            else:
                xmin = min([c.xmin for c in self.individual_files])
                xmax = max([c.xmax for c in self.individual_files])
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
            self.individual_files[composite.id] = composite
    def __str__(self):
        return str(self.individual_files)