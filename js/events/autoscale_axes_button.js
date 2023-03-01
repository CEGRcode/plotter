$(function() {
    d3.select("#autoscale-axes-button").on("click", function() {
        $("#settings-table").settings_table("autoscale_axes")
    })
})