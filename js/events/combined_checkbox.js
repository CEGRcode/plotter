$(function() {
    $("#combined-checkbox").on("change", function() {
        $("#main-plot").main_plot("toggle_combined", this.checked);
        $("#settings-dropdown").settings_dropdown("set_value", "none")
    })
})