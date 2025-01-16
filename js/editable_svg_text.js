const editPlotLabel = function(labelGroup, label, field) {
    // Get the current label attributes
    const x = label.attr("x"),
        y = label.attr("y"),
        text = label.text(),
        transform = label.attr("transform");
    // Remove the current label
    label.style("display", "none");
    // Add a foreign object with an input field
    const foreignObject = labelGroup.append("foreignObject")
        .attr("x", x - 200)
        .attr("y", y - 20)
        .attr("width", 400)
        .attr("height", 20)
        .attr("transform", transform)
        .style("text-align", "center"),
        textInput = foreignObject.append("input")
        .attr("type", "text")
        .attr("value", text)
        .style("font-size", "10px");
    // This is a hack to make the input field appear
    textInput.node().outerHTML = textInput.node().outerHTML;

    foreignObject.select("input")
        .on("keypress", function(e) {
            enterPlotLabelInput(e, label, field)
        })
        .node().focus();
    
    // Disable the download as svg button
    d3.select("#download-as-svg").property("disabled", true)
};

const enterPlotLabelInput = function(ev, label, field) {
    if (ev.keyCode === 13) {
        d3.select(ev.target.parentNode).remove();
        label.style("display", null);
        if (ev.target.value.trim().length > 0) {
            dataObj.changeLabel(field, ev.target.value);
            plotObj.updatePlot()
        };
        // Enable the download as svg button
        d3.select("#download-as-svg").property("disabled", false)
    }
}