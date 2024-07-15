## Python Plotter

This is a Python implementation of a plotter that creates plot-esque plots based on subcommands passed into `plotter.py`.

The three basic subcommands are `composite`, `plot`, and `reference-line`. They're passed into `plotter.py` using a single line with the basic syntax:

```
python plotter.py composite [file] [composite options] reference-line [axis] [line options] plot [plot options]
```

An example command is:

```
python plotter.py composite sample.out --bp-shift 50 composite sample2.out --bp-shift 50 reference-line y --color blue plot --title "Samples One and Two" --smoothing 10 --out out.svg
```

The `composite` and `reference-line` subcommands can be repeated for as many composites or reference lines as you wish to add, but the `plot` command should only be used once per call. If `--opacity`, `--smoothing`, or `--bp-shift` is specified for a composite, those specifications will override default values inherited by values specified in the plot subcommand. Also, all boolean options are flags; if not specified they will remain the default value.

### Plot

```
plot [plot options]
```

The `plot` subcommand takes no positional arguments, and the options specify properties for the entire plot, such as domain, range, and the axis labels. Options can also be used to specify default properties for all composites such as `opacity` and `smoothing`. This implementation of the plotter autoscales the axes to fit the largest composite by default, ignoring the `xmin`, `xmax`, `ymin`, and `ymax` options unless `--no-shrink` or `--no-resize` is specified.

The available options for the `plot` subcommand are:

| Command          | Type    | Description                              | Default         |
| ---------------- | ------- | ---------------------------------------- | --------------- |
| --smoothing      | Float   | The default smoothing value               | 7               |
| --bp-shift       | Int     | The default bp-shift                      | 0               |
| --opacity        | Float   | The default maximum opacity               | 1               |
| --title          | String  | The title of the plot                     | "Composite plot" |
| --xmin           | Int     | Minimum value of the plot                 | -500            |
| --xmax           | Int     | Maximum value of the plot                 | 500             |
| --ymin           | Int     | Minimum occupancy of the plot             | -1              |
| --ymax           | Int     | Maximum occupancy of the plot             | 1               |
| --ylabel         | String  | Label for the y-axis                      | Occupancy (AU)  |
| --xlabel         | String  | Label for the x-axis                      | Position (bp)   |
| --color-trace    | Boolean | Default for if composites should have composite trace | False |
| --combined       | Boolean | Draws a combined plot                     | False           |
| --hide-legend    | Boolean | Hides the plot legend                     | False           |
| --no-resize      | Boolean | Prevents plotter from autoscaling the x and y axes | False |
| --aspect-ratio | String | Aspect ratio of the output plot | "1:1" |
| --out      | String | Name and filepath of svg output | `out.svg`        |
| --export-json      | String | JSON file to export composites and plot settings | `None`        |
| --import-json      | String | JSON file to import composites and plot settings | `None`        |
| --import-settings-json      | String | JSON file to import plot settings | `None`        |

### Composite

```
composite [file] [composite options]
```

The `composite` subcommand takes a positional argument that specifies the files to be loaded into the composite. If there are multiple files, they should be separated by a ":". For example, `composite sample1.out-sample2.out-sample3.out --opacity 0.5` loads samples 1-3 into the composite and sets the maximum opacity to 0.5.

The available options for the `composite` subcommand are:

| Command           | Type    | Description                              | Default         |
| ----------------- | ------- | ---------------------------------------- | --------------- |
| --name            | String  | Assigns the name of the composite for the plot's legend | None  |
| --color           | String  | Sets the color of the composite using hex code or default HTML color | Plotter Defaults |
| --secondary-color | String  | Sets the secondary color of the composite using hex code or default HTML color | The primary color |
| --scale           | Float   | Sets the scale of the composite          | 1               |
| --shift-occupancy | Float   | Shifts occupancy by a set value          | 0               |
| --smoothing       | Float   | Sets smoothing                           | 7               |
| --opacity         | Float   | Sets opacity                             | 1               |
| --bp-shift        | Int     | Sets bp shift                            | 0               |
| --hide-sense      | Boolean | Hides the sense strand                   | False           |
| --hide-anti       | Boolean | Hides the anti strand                    | False           |
| --swap-strands    | Boolean | Swaps the sense and anti strands        | False           |
| --export-json       | String | Path to export json with composites and plot values| None           |
| --import-json    | String | Path to import json with composites and plot values  | None           |

### Reference-Line

```
reference-line [axis] [reference-line options]
```

The `reference-line` subcommand takes either `x` or `y` to specify the axis it should be plotted on followed by options specifying its attributes.

The available options for the `reference-line` subcommand are:

| Command          | Type    | Description                              | Default         |
| ---------------- | ------- | ---------------------------------------- | --------------- |
| --val            | Float   | Sets the position of the line (bp if x-axis or AU if y-axis) | 0            |
| --color          | String  | Sets the color of the line using hex code or default HTML color | Plotter Defaults |
| --style          | `dashed`, `dotted`, or `solid`  | Sets the style of the line | `dashed`   |
| --opacity        | Float   | Sets the opacity                         | 1               |

---