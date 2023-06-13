$(function() {
  $('#show-legend-checkbox').change(function() {
    $("#main-plot").main_plot("toggle_legend", this.checked)
  })
})