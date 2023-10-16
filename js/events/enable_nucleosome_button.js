$(function() {
    d3.select("#enable-nucleosome-button").on("click", function() {
        let nucleosome_button = d3.select("#enable-nucleosome-button");

        if (nucleosome_button.attr("value") === "Enable Nucleosome Slider"){
            nucleosome_button.attr("value", "Disable Nucleosome Slider");
            updateNucleosome();
            d3.select("#plot-options")
                .style("display", "none");
            d3.select("#nucleosome-slider-options")
                .style("display", "block");
        } else {
            nucleosome_button.attr("value", "Enable Nucleosome Slider");
            d3.select("#main-plot")
                .selectAll(".nucleosome-svg")
                .remove();
            d3.select("#plot-options")
                .style("display", "block");
            d3.select("#nucleosome-slider-options")
                .style("display", "none");
        }
    })
})

function updateNucleosome() {
    d3.select("#main-plot")
        .selectAll(".nucleosome-svg")
        .remove();
    let nucleosome_svg = d3.select("#nucleosome-svg").node();
    let newNucleosomeSvg = nucleosome_svg.cloneNode(true);
    newNucleosomeSvg.setAttribute("height", "20px");
    newNucleosomeSvg.setAttribute("id", "nucleosome-svg-plot")
    let newWidth = 40;
    newNucleosomeSvg.setAttribute("width", newWidth + "px")
    newNucleosomeSvg.setAttribute("y", $("#main-plot").main_plot("get_height") / 2 - 10 + "px")
    newNucleosomeSvg.setAttribute("x", $("#main-plot").main_plot("get_width") / 2 - 65 + "px")

    d3.select(newNucleosomeSvg)
        .selectAll(".nucleosome-coord")
        .attr("width", "2px");

    d3.select("#main-plot")
        .node()
        .appendChild(newNucleosomeSvg);
    
    console.log($("#main-plot").main_plot("get_xscale").domain()[1] - $("#main-plot").main_plot("get_xscale").domain()[0]); 
    console.log($("#main-plot").main_plot("get_height"));
}