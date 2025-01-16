import json
import argparse
from create_file_data_json import create_file_data_obj
from create_composite_json import create_composite_obj

def get_axis_limits(file_data_obj):
    xmin = float('inf')
    xmax = float('-inf')
    ymin = float('inf')
    ymax = float('-inf')
    for file_data in file_data_obj.values():
        xmin = min(xmin, file_data['xmin'])
        xmax = max(xmax, file_data['xmax'])
        ymin = min(ymin, -max(file_data['anti']))
        ymax = max(ymax, max(file_data['sense']))

    return xmin, xmax, ymin, ymax

def aggregate_composite_data(composite_jsons):
    composites = []
    for composite_json in composite_jsons:
        with open(composite_json, 'r') as f:
            composites.append(json.load(f))
    return composites

def create_data_obj(composites, file_data_obj, xmin, xmax, ymin, ymax, symmetric_y, lock_axes, min_opacity,
                    max_opacity, smoothing, bp_shift, combined, separate_colors, color_trace, enable_tooltip,
                    show_legend, title, xlabel, ylabel):
    return {
        'globalSettings': 
            {
                'xmin': xmin,
                'xmax': xmax,
                'ymin': ymin,
                'ymax': ymax,
                'symmetricY': symmetric_y,
                'lockAxes': lock_axes,
                'minOpacity': min_opacity,
                'maxOpacity': max_opacity,
                'smoothing': smoothing,
                'bpShift': bp_shift,
                'combined': combined,
                'separateColors': separate_colors,
                'colorTrace': color_trace,
                'enableTooltip': enable_tooltip,
                'showLegend': show_legend,
                'labels': {
                    'title': title,
                    'xlabel': xlabel,
                    'ylabel': ylabel
                }
            },
        'fileData': file_data_obj,
        'compositeData': composites,
        'referenceLines': [],
        'nucleosomeSlider': {}
    }

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Create a plot JSON file')
    parser.add_argument('--composite-jsons', type=str, nargs='*', default=False,
                        help='List of composite JSON files')
    parser.add_argument('--composite-files', type=str, nargs='*',
                        help='Composite .out files; ignored if --composite-jsons and --file-data-json are provided')
    parser.add_argument('--file-data-json', type=str, default=False, help='File data JSON file')
    parser.add_argument('--xmin', type=int, default=None, help='Minimum x-axis value')
    parser.add_argument('--xmax', type=int, default=None, help='Maximum x-axis value')
    parser.add_argument('--ymin', type=float, default=None, help='Minimum y-axis value')
    parser.add_argument('--ymax', type=float, default=None, help='Maximum y-axis value')
    parser.add_argument('--asymmetric-y', action='store_true', help='Allow the y-axis to be asymmetric')
    parser.add_argument('--lock-axes', action='store_true', help='Lock the x- and y-axes')
    parser.add_argument('--min-opacity', type=float, default=0., help='Minimum opacity')
    parser.add_argument('--max-opacity', type=float, default=1., help='Maximum opacity')
    parser.add_argument('--smoothing', type=int, default=7, help='Width of the sliding window for smoothing')
    parser.add_argument('--bp-shift', type=int, default=0, help='Number of base pairs to shift the composite')
    parser.add_argument('--combined', action='store_true', help='Combine strands of each composite')
    parser.add_argument('--separate-colors', action='store_true', help='Use separate colors for each strand')
    parser.add_argument('--color-trace', action='store_true', help='Color the line of each composite')
    parser.add_argument('--disable-tooltip', action='store_true', help='Disable plot tooltip')
    parser.add_argument('--hide-legend', action='store_true', help='Hide the legend')
    parser.add_argument('--title', type=str, default='Composite plot', help='Plot title')
    parser.add_argument('--xlabel', type=str, default='Position (bp)', help='x-axis label')
    parser.add_argument('--ylabel', type=str, default='Occupancy (AU)', help='y-axis label')
    parser.add_argument('--output', type=str, required=True, help='Output JSON file name')
    args = parser.parse_args()

    if args.composite_jsons and args.file_data_json:
        with open(args.file_data_json, 'r') as f:
            file_data_obj = json.load(f)
        composite_data_obj = aggregate_composite_data(args.composite_jsons)
    else:
        file_data_obj = create_file_data_obj(set(args.composite_files))
        composite_data_obj = [create_composite_obj([fn]) for fn in args.composite_files]

    xmin, xmax, ymin, ymax = get_axis_limits(file_data_obj)
    if args.xmin is not None:
        xmin = args.xmin
    if args.xmax is not None:
        xmax = args.xmax
    if args.ymin is not None:
        ymin = args.ymin
    if args.ymax is not None:
        ymax = args.ymax
    
    with open(args.output, 'w') as f:
        json.dump(create_data_obj(composite_data_obj, file_data_obj, xmin, xmax, ymin, ymax, not args.asymmetric_y,
                                  args.lock_axes, args.min_opacity, args.max_opacity, args.smoothing, args.bp_shift,
                                  args.combined, args.separate_colors, args.color_trace, not args.disable_tooltip,
                                  not args.hide_legend, args.title, args.xlabel, args.ylabel), f, indent=4)
