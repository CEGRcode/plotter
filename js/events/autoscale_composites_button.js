$(function() {
    d3.select("#autoscale-composites-button").on("click", function() {
        $("#settings-table").settings_table("autoscale_composites")
    })
})