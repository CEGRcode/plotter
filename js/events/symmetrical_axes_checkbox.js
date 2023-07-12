$(function() {
    d3.select("#symmetrical_axes_checkbox").on("change", function() {
        $("#main-plot").main_plot("toggle_symmetrical", this.checked);
        $("#axes-input").axes_input("toggle_symmetrical", this.checked);
    })
})