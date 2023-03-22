$(function() {
    $("#combined-checkbox").on("change", function() {
        $("#main-plot").main_plot("toggle_combined", this.checked)
    })
})