$(function() {
    $.widget("composite_plot.settings_dropdown", {
        presets: {
            rossi_2021: {
                opacity: 1,
                smoothing: 20,
                shift: 50,
                combined: false,
                separate_color: false,
                rows: [
                    {color: "#FFF100"},
                    {color: "#FF8C00"},
                    {color: "#E81123"},
                    {color: "#EC008C"},
                    {color: "#68217A"},
                    {color: "#00188F"},
                    {color: "#00BCF2"},
                    {color: "#00B294"},
                    {color: "#009E49"},
                    {color: "#BAD80A"}
                ]
            },

            mittal_2022: {
                opacity: 1,
                smoothing: 30,
                shift: 0,
                combined: false,
                separate_color: false,
                rows: [
                    {color: "#BFBFBF"},
                    {color: "#000000"},
                    {color: "#FF0000"},
                    {color: "#FF9100"},
                    {color: "#D7D700"},
                    {color: "#07E200"},
                    {color: "#00B0F0"},
                    {color: "#0007FF"},
                    {color: "#A700FF"},
                    {color: "#FF00D0"}
                ]
            },

            benz: {
                opacity: 1,
                smoothing: 7,
                shift: 0,
                combined: false,
                separate_color: true,
                rows: [
                    {name: "Read 1", color: "#1331F5", secondary_color: "#E93323"},
                    {name: "Read 2", color: "#4EADEA", secondary_color: "#EB50F7"}
                ]
            }
        },
        current_preset: "none",

        _elements: {
            dropdown: null
        },

        _create: function() {
            let container = d3.select(this.element.context),
                dropdown = container.append("select")
                    .attr("id", "settings-dropdown")
                    .on("change", function() {$("#settings-dropdown").settings_dropdown("change_settings", this.value)});
            this._elements.dropdown = dropdown;

            dropdown.append("option")
                .attr("value", "none")
                .text("Select a preset");

            dropdown.append("option")
                .attr("value", "rossi_2021")
                .text("Rossi et al. 2021");

            dropdown.append("option")
                .attr("value", "mittal_2022")
                .text("Mittal et al. 2022");

            dropdown.append("option")
                .attr("value", "benz")
                .text("Benzonase")
        },

        get_value: function() {
            return this.current_preset
        },

        set_value: function(preset) {
            this.current_preset = preset;
            this._elements.dropdown.node().value = preset
        },

        change_settings: function(preset) {
            this.current_preset = preset;

            if (preset === "none") {
                return
            } else {
                let settings = this.presets[preset];
                $("#opacity-input").opacity_input("change_opacity", settings.opacity);
                $("#smoothing-input").smoothing_input("change_smoothing", settings.smoothing);
                $("#shift-input").shift_input("change_shift", settings.shift);
                d3.select("#combined-checkbox")
                    .property("checked", settings.combined)
                    .property("disabled", settings.separate_color);
                d3.select("#separate-color-checkbox")
                    .property("checked", settings.separate_color)
                    .property("disabled", settings.combined);
                $("#main-plot").main_plot("toggle_combined", settings.combined);
                $("#settings-table").settings_table("toggle_color_separated_strands", settings.separate_color);
                $("#settings-table").settings_table("update_rows", settings.rows)
            }
        }
    });

    $("#settings-dropdown").settings_dropdown()
})