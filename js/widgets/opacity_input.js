$(function() {
    $.widget("composite_plot.opacity_input", {
        opacity: 1,

        _elements: {
            slider: null,
            text: null
        },

        _create: function() {
            let container = d3.select(this.element.context),
                label = container.append("label")
                    .attr("for", "opacity-slider")
                    .text("Opacity:"),
                slider = container.append("input")
                    .attr("type", "range")
                    .attr("id", "opacity-slider")
                    .attr("value", this.opacity * 100)
                    .attr("min", 0)
                    .attr("max", 100)
                    .on("input", function() {
                        $("#opacity-input").opacity_input("change_opacity", parseInt(this.value) / 100);
                        $("#settings-dropdown").settings_dropdown("set_value", "none")
                    }),
                text = container.append("input")
                    .attr("type", "text")
                    .attr("id", "opacity-text")
                    .attr("class", "slider-text")
                    .attr("value", this.opacity)
                    .on("change", function() {
                        $("#opacity-input").opacity_input("change_opacity", parseFloat(this.value));
                        $("#settings-dropdown").settings_dropdown("set_value", "none")
                    });

            this._elements.slider = slider;
            this._elements.text = text
        },

        change_opacity: function(new_opacity) {
            this.opacity = new_opacity;
            this._elements.slider.node().value = new_opacity * 100;
            this._elements.text.node().value = new_opacity;
            $("#main-plot").main_plot("change_opacity", true, new_opacity)
        }
    });

    $("#opacity-input").opacity_input()
})