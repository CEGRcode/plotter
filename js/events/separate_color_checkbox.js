$(function() {
    $("#separate-color-checkbox").on("change", function() {
        $("#settings-table").settings_table("toggle_color_separated_strands", this.checked);
        d3.select("#combined-checkbox").property("disabled", this.checked)
    })
})