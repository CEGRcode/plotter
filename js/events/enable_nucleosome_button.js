$(function() {
    d3.select("#enable-nucleosome-button").on("click", function() {
        let nucleosome_button = d3.select("#enable-nucleosome-button");

        if (nucleosome_button.attr("value") === "Enable Nucleosome Slider"){
            nucleosome_button.attr("value", "Disable Nucleosome Slider");
            d3.select("#plot-options")
                .style("display", "none");
            d3.select("#nucleosome-slider-options")
                .style("display", "block");
            d3.select("#nucleosome-svg-plot")
                .style("display", "inline");
        } else {
            nucleosome_button.attr("value", "Enable Nucleosome Slider");
            d3.select("#nucleosome-svg-plot")
                .style("display", "none");
            d3.select("#plot-options")
                .style("display", "block");
            d3.select("#nucleosome-slider-options")
                .style("display", "none");
        }
    })
})