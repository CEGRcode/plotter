$(function() {
    d3.select("#lock-axes-checkbox").on("change", function() {
        $("#main-plot").main_plot("toggle_locked", this.checked);
        $("#axes-input").axes_input("toggle_locked", this.checked)
    })
})