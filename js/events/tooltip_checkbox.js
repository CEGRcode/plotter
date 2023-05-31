$(function() {
    d3.select("#tooltip-checkbox").on("change", function() {
        $("#main-plot").main_plot("toggle_tooltip", this.checked);
        if (!this.checked) {
            $("#main-plot").main_plot("hide_tooltip")
        }
    })
})