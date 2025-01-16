import json
import os
import argparse

def create_composite_obj(ids, name=None, primary_color=None, secondary_color=None, scale=1.,
                         min_opacity=None, max_opacity=None, smoothing=None, bp_shift=None, shift_occupancy=0.,
                         hide_sense=False, hide_anti=False, swap=False):
    return {
        'ids': [os.path.basename(fn) for fn in ids],
        'name': name,
        'primaryColor': primary_color,
        'secondaryColor': secondary_color,
        'scale': scale,
        'minOpacity': min_opacity,
        'maxOpacity': max_opacity,
        'smoothing': smoothing,
        'bpShift': bp_shift,
        'shiftOccupancy': shift_occupancy,
        'hideSense': hide_sense,
        'hideAnti': hide_anti,
        'swap': swap
    }

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Create a composite JSON file')
    parser.add_argument('--ids', type=str, nargs='*', required=True, help='List of composite .out file handles')
    parser.add_argument('--name', type=str, default=None, help='Name of the composite')
    parser.add_argument('--primary-color', type=str, default=None, help='Color of the same strand')
    parser.add_argument('--secondary-color', type=str, default=None, help='Color of the opposite strand')
    parser.add_argument('--scale', type=float, default=1., help='Scaling factor')
    parser.add_argument('--min-opacity', type=float, default=None, help='Minimum opacity')
    parser.add_argument('--max-opacity', type=float, default=None, help='Maximum opacity')
    parser.add_argument('--smoothing', type=int, default=None, help='Width of the sliding window for smoothing')
    parser.add_argument('--bp-shift', type=int, default=None, help='Number of base pairs to shift the composite')
    parser.add_argument('--shift-occupancy', type=float, default=0., help='Number added to occupancy values')
    parser.add_argument('--hide-sense', action='store_true', help='Hide the same strand')
    parser.add_argument('--hide-anti', action='store_true', help='Hide the opposite strand')
    parser.add_argument('--swap', action='store_true', help='Swap the same and opposite strands')
    parser.add_argument('--output', type=str, required=True, help='Output JSON file name')
    args = parser.parse_args()

    composite_obj = create_composite_obj(args.ids, args.name, args.primary_color, args.secondary_color, args.scale,
                                         args.min_opacity, args.max_opacity, args.smoothing, args.bp_shift,
                                         args.shift_occupancy, args.hide_sense, args.hide_anti, args.swap)

    with open(args.output, 'w') as f:
        json.dump(composite_obj, f, indent=4)
        