$(function() {
    $.widget("composite_plot.settings_dropdown", {
        presets: {
            rossi_2021: {
                opacity: 1,
                smoothing: 20,
                shift: 50,
                combined: false
            },

            mittal_2022: {
                opacity: 1,
                smoothing: 30,
                shift: 0,
                combined: false
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
                .text("Mittal et al. 2022")
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
            }

            let settings = this.presets[preset];
            $("#opacity-input").opacity_input("change_opacity", settings.opacity);
            $("#smoothing-input").smoothing_input("change_smoothing", settings.smoothing);
            $("#shift-input").shift_input("change_shift", settings.shift);
            d3.select("#combined-checkbox").property("checked", settings.combined);
            $("#main-plot").main_plot("toggle_combined", settings.combined)
        }
    });

    $("#settings-dropdown").settings_dropdown()
})