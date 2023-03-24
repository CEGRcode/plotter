$(function() {
    d3.select("#combined-checkbox").on("change", function() {
        $("#main-plot").main_plot("toggle_combined", this.checked);
        d3.select("#separate-color-checkbox").property("disabled", this.checked);
        $("#settings-dropdown").settings_dropdown("set_value", "none")
    })
})