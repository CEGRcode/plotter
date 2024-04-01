$(function() {
    d3.select("#plot-options-tab").on("click", function() {
        showPane("plot-options", this);
        $("#main-plot").main_plot("toggle_tooltip", true);
    })
    d3.select("#reference-axes-tab").on("click", function() {
        showPane("reference-axes-pane", this);
        $("#main-plot").main_plot("toggle_tooltip", false);
        d3.select("#reference-axes-layer").attr("display", "block")
        $("#reference-axes-pane").reference_axes("plot_lines");
    })
    d3.select("#nucleosome-slider-tab").on("click", function() {
        showPane("nucleosome-slider-options", this);
    })

    function showPane(id, tab){
        var panes = d3.selectAll(".plot-pane");
        panes.each(function() {
            pane = d3.select(this);
            console.log(pane.attr("id"));
            if (pane.attr("id") != id){
                pane.style("display", "none");
            } else {
                pane.style("display", "block");
            }
        });
        var tabs = d3.selectAll(".plot-tab");
        tabs.each(function() {
            d3.select(this).classed("selected-tab", false);
        })
        d3.select(tab).classed("selected-tab", true);

        if (d3.select("#keep-nucleosome").property("checked") == false){
            d3.select("#nucleosome-svg-layer")
                .selectAll("*")
                .remove();
            d3.select("#coord-svg-layer")
                .selectAll("*")
                .remove();
        }
    }
})