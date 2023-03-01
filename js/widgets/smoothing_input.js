$(function() {
    $.widget("composite_plot.smoothing_input", {
        sliding_window: 7,

        _elements: {
            slider: null,
            text: null
        },

        _create: function() {
            let container = d3.select(this.element.context),
                label = container.append("label")
                    .attr("for", "smoothing-slider")
                    .text("Smoothing:"),
                slider = container.append("input")
                    .attr("type", "range")
                    .attr("id", "smoothing-slider")
                    .attr("value", this.sliding_window)
                    .attr("min", 1)
                    .attr("max", 30)
                    .on("input", function() {
                        $("#smoothing-input").smoothing_input("change_smoothing", parseInt(this.value));
                        $("#settings-dropdown").settings_dropdown("set_value", "none")
                    }),
                text = container.append("input")
                    .attr("type", "text")
                    .attr("id", "smoothing-text")
                    .attr("class", "slider-text")
                    .attr("value", this.sliding_window)
                    .on("change", function() {
                        $("#smoothing-input").smoothing_input("change_smoothing", parseInt(this.value));
                        $("#settings-dropdown").settings_dropdown("set_value", "none")
                    });

            this._elements.slider = slider;
            this._elements.text = text
        },

        change_smoothing: function(new_window) {
            this.sliding_window = new_window;
            this._elements.slider.node().value = new_window;
            this._elements.text.node().value = new_window;
            $("#main-plot").main_plot("change_smoothing", new_window)
        }
    });

    $("#smoothing-input").smoothing_input()
})