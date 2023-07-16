$(function() {
    $.widget("composite_plot.shift_input", {
        bp_shift: 0,

        _elements: {
            slider: null,
            text: null
        },

        _create: function() {
            let container = d3.select(this.element.context),
                label = container.append("label")
                    .attr("for", "shift-slider")
                    .attr("id", "shift-label")
                    .text("BP shift:"),
                slider = container.append("input")
                    .attr("type", "range")
                    .attr("id", "shift-slider")
                    .attr("value", this.bp_shift)
                    .attr("min", -50)
                    .attr("max", 50)
                    .on("input", function() {
                        $("#shift-input").shift_input("change_shift", parseInt(this.value));
                        $("#settings-dropdown").settings_dropdown("set_value", "none")
                    })
                text = container.append("input")
                    .attr("type", "text")
                    .attr("id", "shift-text")
                    .attr("class", "slider-text")
                    .attr("value", this.bp_shift)
                    .on("change", function() {
                        $("#shift-input").shift_input("change_shift", parseInt(this.value))
                    });

            this._elements.slider = slider;
            this._elements.text = text
        },

        change_shift: function(new_shift) {
            this.bp_shift = new_shift;
            this._elements.slider.node().value = new_shift;
            this._elements.text.node().value = new_shift;
            $("#main-plot").main_plot("change_bp_shift", new_shift);

            $("settings-dropdown").settings_dropdown("set_value", "none")
        }
    });

    $("#shift-input").shift_input()
})