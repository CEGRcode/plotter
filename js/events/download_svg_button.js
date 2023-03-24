$(function() {
    d3.select("#download-svg-button").on("click", function() {
        $("#main-plot").main_plot("download_as_svg")
    })
})