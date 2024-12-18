import json
import xml.dom.minidom as dom
import numpy as np
import argparse

def jsonobj_to_svg(data_obj, width=500, height=300, margins={'top': 30, 'bottom': 35, 'left': 60, 'right': 190}):
    combined = data_obj['globalSettings']['combined']
    symmetric_y = data_obj['globalSettings']['symmetricY']
    separate_colors = data_obj['globalSettings']['separateColors']
    color_trace = data_obj['globalSettings']['colorTrace']
    xmin = data_obj['globalSettings']['xmin']
    xmax = data_obj['globalSettings']['xmax']
    ymin = data_obj['globalSettings']['ymin']
    ymax = data_obj['globalSettings']['ymax']

    def xscale(x):
        return (x - xmin) / (xmax - xmin) * (width - margins['left'] - margins['right']) + margins['left']
    if combined:
        def yscale(y):
            return y / (ymax - ymin) * (height - margins['top'] - margins['bottom']) + margins['top']
    elif symmetric_y:
        ylim = max(-ymin, ymax)
        def yscale(y):
            return (y + ylim) / (2 * ylim) * (height - margins['top'] - margins['bottom']) + margins['top']
    else:
        def yscale(y):
            return (y - ymin) / (ymax - ymin) * (height - margins['top'] - margins['bottom']) + margins['top']

    # Create the svg
    document = dom.Document()
    svg = document.appendChild(document.createElement('svg'))
    svg.setAttribute('baseProfile', 'full')
    svg.setAttribute('version', '1.1')
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
    svg.setAttribute('font-family', 'Helvetica')
    svg.setAttribute('viewBox', '0 0 {} {}'.format(width, height))
    
    composites_group = svg.appendChild(document.createElement('g'))
    for i, composite_data in enumerate(reversed(data_obj['compositeData'])):
        if composite_data['filesLoaded'] == 0:
            continue

        min_opacity = composite_data['minOpacity'] if composite_data['minOpacity'] is not None \
            else data_obj['globalSettings']['minOpacity']
        max_opacity = composite_data['maxOpacity'] if composite_data['maxOpacity'] is not None \
            else data_obj['globalSettings']['maxOpacity']
        primary_color = composite_data['primaryColor']
        secondary_color = composite_data['secondaryColor'] if separate_colors and not combined \
            and composite_data['secondaryColor'] is not None else primary_color
        smoothing = composite_data['smoothing'] if composite_data['smoothing'] is not None \
            else data_obj['globalSettings']['smoothing']
        smooth_shift = (smoothing - 1) / 2
        bp_shift = composite_data['bpShift'] if composite_data['bpShift'] is not None \
            else data_obj['globalSettings']['bpShift']
        scale = composite_data['scale']
        shift_occupancy = composite_data['shiftOccupancy']
        swap = composite_data['swap']
        hide_sense = composite_data['hideSense']
        hide_anti = composite_data['hideAnti']
        composite_xmin = composite_data['xmin']
        composite_xmax = composite_data['xmax']

        composite_group = composites_group.appendChild(document.createElement('g'))
        defs = composite_group.appendChild(document.createElement('defs'))

        top_gradient = defs.appendChild(document.createElement('linearGradient'))
        top_gradient.setAttribute('id', 'composite-gradient-top-{}'.format(i))
        top_gradient.setAttribute('x1', '0%')
        top_gradient.setAttribute('x2', '0%')
        top_gradient.setAttribute('y1', '0%')
        top_gradient.setAttribute('y2', '100%')
        stop1 = top_gradient.appendChild(document.createElement('stop'))
        stop1.setAttribute('offset', '0')
        stop1.setAttribute('stop-color', primary_color)
        stop1.setAttribute('stop-opacity', str(max_opacity))
        stop2 = top_gradient.appendChild(document.createElement('stop'))
        stop2.setAttribute('offset', '1')
        stop2.setAttribute('stop-color', primary_color)
        stop2.setAttribute('stop-opacity', str(min_opacity))

        if combined:
            if bp_shift > 0:
                shifted_sense = composite_data['sense'][:-2 * bp_shift]
                shifted_anti = composite_data['anti'][2 * bp_shift:]
            else:
                shifted_sense = composite_data['sense'][2 * bp_shift:]
                shifted_anti = composite_data['anti'][:len(composite_data['anti']) - 2 * bp_shift]
            combined_occupancy = shifted_sense + shifted_anti
            smoothed_occupancy = sliding_window(combined_occupancy, smoothing)
            smoothed_xmin = composite_xmin + abs(bp_shift) + smooth_shift
            smoothed_xmax = composite_xmax - abs(bp_shift) - smooth_shift
            truncated_xmin = max(xmin, smoothed_xmin)
            truncated_xmax = min(xmax, smoothed_xmax)
            truncated_occupancy = smoothed_occupancy[truncated_xmin - smoothed_xmin:
                len(smoothed_occupancy) - smoothed_xmax + truncated_xmax] * scale + shift_occupancy
            d = ''.join('M {} {} '.format(xscale(truncated_xmin + i), yscale(y)) for i, y in enumerate(truncated_occupancy))

            composite_path = composite_group.appendChild(document.createElement('path'))
            composite_path.setAttribute('fill', 'url(#composite-gradient-top-{})'.format(i))
            if not color_trace:
                composite_path.setAttribute('stroke', '#FFFFFF')
            composite_path.setAttribute('stroke-width', '1')
            composite_path.setAttribute('d', 'M {} {} {} M {} {} Z'.format(xscale(truncated_xmin),
                yscale(truncated_occupancy[0]), d, xscale(truncated_xmax), yscale(truncated_occupancy[-1])))
            if hide_sense and hide_anti:
                composite_path.setAttribute('display', 'none')
            
            composite_line = composite_group.appendChild(document.createElement('path'))
            composite_line.setAttribute('stroke', primary_color if color_trace else '#000000')
            composite_line.setAttribute('stroke-width', '.5')
            composite_line.setAttribute('d', d)
            if hide_sense and hide_anti:
                composite_path.setAttribute('display', 'none')
        else:
            bottom_gradient = defs.appendChild(document.createElement('linearGradient'))
            bottom_gradient.setAttribute('id', 'composite-gradient-bottom-{}'.format(i))
            bottom_gradient.setAttribute('x1', '0%')
            bottom_gradient.setAttribute('x2', '0%')
            bottom_gradient.setAttribute('y1', '100%')
            bottom_gradient.setAttribute('y2', '0%')
            stop1 = bottom_gradient.appendChild(document.createElement('stop'))
            stop1.setAttribute('offset', '0')
            stop1.setAttribute('stop-color', secondary_color)
            stop1.setAttribute('stop-opacity', str(max_opacity))
            stop2 = bottom_gradient.appendChild(document.createElement('stop'))
            stop2.setAttribute('offset', '1')
            stop2.setAttribute('stop-color', secondary_color)
            stop2.setAttribute('stop-opacity', str(min_opacity))

            smoothed_sense = sliding_window(composite_data['sense'], smoothing)
            smoothed_anti = sliding_window(composite_data['anti'], smoothing)
            truncated_xmin_sense = max(xmin, composite_xmin + smooth_shift + bp_shift)
            truncated_xmax_sense = min(xmax, composite_xmax - smooth_shift + bp_shift)
            truncated_xmin_anti = max(xmin, composite_xmin + smooth_shift - bp_shift)
            truncated_xmax_anti = min(xmax, composite_xmax - smooth_shift - bp_shift)
            truncated_sense = smoothed_sense[truncated_xmin_sense - composite_xmin - smooth_shift - bp_shift:
                len(smoothed_sense) - composite_xmax + truncated_xmax_sense + smooth_shift - bp_shift] \
                * scale + shift_occupancy
            truncated_anti = smoothed_anti[truncated_xmin_anti - composite_xmin - smooth_shift + bp_shift:
                len(smoothed_anti) - composite_xmax + truncated_xmax_anti + smooth_shift + bp_shift] \
                * scale + shift_occupancy

            composite_path_top = composite_group.appendChild(document.createElement('path'))
            composite_path_top.setAttribute('fill', 'url(#composite-gradient-top-{})'.format(i))
            composite_path_top.setAttribute('stroke-width', '1')
            composite_line_top = composite_group.appendChild(document.createElement('path'))
            composite_line_top.setAttribute('stroke', primary_color if color_trace else '#000000')
            composite_line_top.setAttribute('stroke-width', '.5')
            if hide_sense:
                composite_path_top.setAttribute('display', 'none')
                composite_line_top.setAttribute('display', 'none')

            composite_path_bottom = composite_group.appendChild(document.createElement('path'))
            composite_path_bottom.setAttribute('fill', 'url(#composite-gradient-bottom-{})'.format(i))
            composite_path_bottom.setAttribute('stroke-width', '1')
            composite_line_bottom = composite_group.appendChild(document.createElement('path'))
            composite_line_bottom.setAttribute('stroke', secondary_color if color_trace else '#000000')
            composite_line_bottom.setAttribute('stroke-width', '.5')
            if hide_anti:
                composite_path_bottom.setAttribute('display', 'none')
                composite_line_bottom.setAttribute('display', 'none')
            
            if not color_trace:
                composite_path_top.setAttribute('stroke', '#FFFFFF')
                composite_path_bottom.setAttribute('stroke', '#FFFFFF')

            if not swap:
                d_top = ''.join('M {} {} '.format(xscale(truncated_xmin_sense + i), yscale(y)) for i, y in enumerate(truncated_sense))
                d_bottom = ''.join('M {} {} '.format(xscale(truncated_xmin_anti + i), yscale(-y)) for i, y in enumerate(truncated_anti))
                composite_path_top.setAttribute('d', 'M {} {} {} M {} {} Z'.format(xscale(truncated_xmin_sense),
                    yscale(truncated_sense[0]), d_top, xscale(truncated_xmax_sense), yscale(truncated_sense[-1])))
                composite_line_top.setAttribute('d', d_top)
                composite_path_bottom.setAttribute('d', 'M {} {} {} M {} {} Z'.format(xscale(truncated_xmin_anti),
                    yscale(-truncated_anti[0]), d_bottom, xscale(truncated_xmax_anti), yscale(-truncated_anti[-1])))
                composite_line_bottom.setAttribute('d', d_bottom)
            else:
                d_top = ''.join('M {} {} '.format(xscale(truncated_xmin_anti + i), yscale(y)) for i, y in enumerate(truncated_anti))
                d_bottom = ''.join('M {} {} '.format(xscale(truncated_xmin_sense + i), yscale(-y)) for i, y in enumerate(truncated_sense))
                composite_path_top.setAttribute('d', 'M {} {} {} M {} {} Z'.format(xscale(truncated_xmin_anti),
                    yscale(truncated_anti[0]), d_top, xscale(truncated_xmax_anti), yscale(truncated_anti[-1])))
                composite_line_top.setAttribute('d', d_top)
                composite_path_bottom.setAttribute('d', 'M {} {} {} M {} {} Z'.format(xscale(truncated_xmin_sense),
                    yscale(-truncated_sense[0]), d_bottom, xscale(truncated_xmax_sense), yscale(-truncated_sense[-1])))
                composite_line_bottom.setAttribute('d', d_bottom)
                
    return document

def update_composite_data(data_obj):
    for composite_data in data_obj['compositeData']:
        xmin = min(composite_data['ids'].map(lambda s: data_obj['fileData'][s]['xmin']))
        xmax = max(composite_data['ids'].map(lambda s: data_obj['fileData'][s]['xmax']))
        sense = np.zeros(xmax - xmin + 1, dtype=np.float64)
        anti = np.zeros(xmax - xmin + 1, dtype=np.float64)

        for s in composite_data['ids']:
            file_xmin = data_obj['fileData'][s]['xmin']
            file_xmax = data_obj['fileData'][s]['xmax']
            sense[file_xmin - xmin:file_xmax - xmin + 1] += data_obj['fileData'][s]['sense']
            anti[file_xmin - xmin:file_xmax - xmin + 1] += data_obj['fileData'][s]['anti']
        
        composite_data['xmin'] = xmin
        composite_data['xmax'] = xmax
        composite_data['sense'] = sense
        composite_data['anti'] = anti

def sliding_window(vec, window):
    val = sum(vec[:window]) / window
    new_vec = [val]
    for i in range(len(vec) - window):
        val += (vec[i + window] - vec[i]) / window
        new_vec.append(val)
    return np.array(new_vec)

def tick_spec(start, stop, count=10):
    """
    tickSpec function from d3-array.js adapted to python
    """
    if count <= 0:
        raise ValueError('count must be positive')
    step = (stop - start) / count
    power = np.floor(np.log10(step))
    error = step / pow(10, power)
    if error >= np.sqrt(50):
        factor = 10
    elif error >= np.sqrt(10):
        factor = 5
    elif error >= np.sqrt(2):
        factor = 2
    else:
        factor = 1
    
    if power < 0:
        inc = pow(10, -power) / factor
        i1 = round(start * inc)
        i2 = round(stop * inc)
        if i1 / inc < start:
            i1 += 1
        if i2 / inc > stop:
            i2 -= 1
        inc = -inc
    else:
        inc = pow(10, power) * factor
        i1 = round(start / inc)
        i2 = round(stop / inc)
        if i1 * inc < start:
            i1 += 1
        if i2 * inc > stop:
            i2 -= 1
    if i2 < i1 and 0.5 <= count and count < 2:
        return tick_spec(start, stop, count=count * 2)
    return i1, i2, inc

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Create a plot from a json file')
    parser.add_argument('json', type=str, help='json file')
    parser.add_argument('--width', type=int, default=500, help='width of the plot')
    parser.add_argument('--height', type=int, default=300, help='height of the plot')
    parser.add_argument('--margin-top', type=int, default=30, help='top margin')
    parser.add_argument('--margin-bottom', type=int, default=35, help='bottom margin')
    parser.add_argument('--margin-left', type=int, default=60, help='left margin')
    parser.add_argument('--margin-right', type=int, default=190, help='right margin')
    parser.add_argument('--output', type=str, help='output svg file')
    args = parser.parse_args()

