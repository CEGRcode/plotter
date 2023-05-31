$(function() {
    d3.select("#color-trace-checkbox").on("change", function() {
        $("#main-plot").main_plot("toggle_color_trace", this.checked)
    })
})