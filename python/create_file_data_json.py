import json
import os
import numpy as np
import argparse

"""
This script processes composite files containing numerical data, extracts sense and anti values, and generates a structured JSON file. 
It ensures that the numerical range (xmin, xmax) is consistently managed across multiple files and adjusts offsets accordingly.

The key functions in the script:
1. parse_composite
2. create_file_data_obj
3. main
"""

# Parse a composite file and extract sense and anti-sense data
def parse_composite(composite_fn):
    xmin = None
    xmax = None
    offset = 0
    with open(composite_fn, 'r') as f:
        for line in f:
            if not line.strip():
                continue
            fields = line.split('\t')
            if fields[0] == '' or fields[0] == 'NAME':
                xmin_curr = int(fields[1])
                xmax_curr = int(fields[-1])
                if xmin_curr == 0:
                    xmin_curr -= xmax_curr // 2
                    xmax_curr -= xmax_curr // 2
                if xmin is None or xmax is None:
                    xmin = xmin_curr
                    xmax = xmax_curr
                    sense = np.zeros(xmax_curr - xmin_curr + 1, dtype=np.float64)
                    anti = np.zeros(xmax_curr - xmin_curr + 1, dtype=np.float64)
                else:
                    if xmin_curr < xmin:
                        sense = np.concatenate((np.zeros(xmin - xmin_curr, dtype=np.float64), sense))
                        anti = np.concatenate((np.zeros(xmin - xmin_curr, dtype=np.float64), anti))
                        xmin = xmin_curr
                    if xmax_curr > xmax:
                        sense = np.concatenate((sense, np.zeros(xmax_curr - xmax, dtype=np.float64)))
                        anti = np.concatenate((anti, np.zeros(xmax_curr - xmax, dtype=np.float64)))
                        xmax = xmax_curr
                
                offset = xmin_curr - xmin
            elif 'sense' in fields[0].lower():
                for i in range(1, len(fields)):
                    sense[offset + i - 1] += float(fields[i])
            elif 'anti' in fields[0].lower():
                for i in range(1, len(fields)):
                    anti[offset + i - 1] += float(fields[i])
            else:
                for i in range(1, len(fields)):
                    sense[offset + i - 1] += float(fields[i]) / 2
                    anti[offset + i - 1] += float(fields[i]) / 2
    
    return {'xmin': xmin, 'xmax': xmax, 'sense': list(sense), 'anti': list(anti)}

# create a dictionary of file data by parsing multiple composite files
def create_file_data_obj(file_list):
    return {os.path.basename(fn): parse_composite(fn) for fn in file_list}

# Adding argparse arguments for user flexibiity
if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Create a file data JSON file')
    parser.add_argument('--composite-files', type=str, nargs='*', required=True, help='List of composite .out files')
    parser.add_argument('--output', type=str, required=True, help='Output JSON file name')
    args = parser.parse_args()

    file_data_obj = create_file_data_obj(args.composite_files)

    with open(args.output, 'w') as f:
        json.dump(file_data_obj, f, indent=4)
