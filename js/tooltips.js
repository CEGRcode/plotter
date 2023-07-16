const DELAY = 250; //Sets how long it takes for tooltips to appear in ms
const OPACITY = .9; //Sets oppacity of tool-tip background;
const tips = new Map();
tips.set("json-button", "Import plot, metadata, and settings");
tips.set("json-download", "Export uploaded files, metadata, and settings");
tips.set("tsv-download","Export metadata table and plot settings");
tips.set("import-metadata-button", "Import metadata with API key and email");
tips.set("load-composite-button", "Load multiple id's from one '.out' file (Under development)");
tips.set("lock-axes-label", "Prevent axes limits from changing");
tips.set("lock-axes-checkbox", "Prevent axes limits from changing");
tips.set("autoscale-axes-button", "Scales x and y axes to fit plot");
tips.set("color-trace-checkbox", "Toggle outline on plot");
tips.set("autoscale-composites-button", "Sets scale of each composite to 1 / (#of IDs)");
tips.set("reset-plot-button", "Clear settings, metadata, and uploaded files");
tips.set("enable-tooltips-label", "Turn these tooltips on or off");
tips.set("enable-tooltips-checkbox", "Turn these tooltips on or off");
tips.set("x-axis-inputs-label", "Change the x axis limits");
tips.set("xmin-text", "Change x axis minimum");
tips.set("xmax-text", "Change x axis maximum");
tips.set("y-axis-inputs-label", "Change the y axis limits")
tips.set("ymin-text", "Change y axis minimum");
tips.set("ymax-text", "Change y axis maximum");

tips.set("settings-dropdown", "Use preset style settings");
tips.set("opacity-label", "Change opacity of shading for all composites");
tips.set("opacity-text", "Change opacity of shading for all composites");
tips.set("smoothing-label", "Change smoothing on plot for all composites");
tips.set("smoothing-text", "Change smoothing on plot for all composites");
tips.set("shift-label", "Shift all strands back or forth");
tips.set("shift-text", "Shift all strands back or forth");
tips.set("combined-label", "Combine forward and reverse strands");
tips.set("combined-checkbox", "Combine forward and reverse strands");
tips.set("seperate-color-label", "Toggle seperate color to forward and reverse strands");
tips.set("separate-color-checkbox", "Toggle seperate color to forward and reverse strands");
tips.set("color-trace-label", "Toggle outline on graph");
tips.set("color-trace-checkbox", "Toggle outline on graph");
tips.set("tooltip-label", "Enable coordinate tooltip");
tips.set("tooltip-checkbox", "Enable coordinate tooltip");
tips.set("show-legend-label", "Show colors legend for composites");
tips.set("show-legend-checkbox", "Show colors legend for composites");
tips.set("download-svg-button", "Download plot, labels, and legend as SVG");

tips.set("main-plot-title", "Click to change this label");
tips.set("main-plot-xlabel", "Click to change this label");
tips.set("main-plot-ylabel", "Click to change this label");

var tooltip_shown = false;
id = "";

window.addEventListener('mousemove', e => {
    element = document.elementFromPoint(e.clientX, e.clientY);
    console.log(element.id);
    if (element != null)
    {
        id = element.id.toString();
    }
    if (tips.has(id) && document.getElementById("enable-tooltips-checkbox").checked && !tooltip_shown){
        tooltip_shown = true;
        makeToolTip(id, e);
        //Delete the tooltip when mouse leaves element
        d3.select("#" + id).on("mouseout", function() {
            d3.select("#tooltip").remove();
            tooltip_shown = false;
        });
    }
},{passive: true})

function makeToolTip(id, e)
{
    //Create invisible tooltip
    let message = tips.get(id);
    let button = document.getElementById(id).getBoundingClientRect();
    let visible = false;
    d3.select("body")
        .append("div")
        .attr("id", "tooltip")
        .style("position", "absolute")
        .style("top", parseFloat(button.bottom + 5) +"px")
        .style("z-index", "999")
        .style("background-color", "rgba(255, 255, 255, " + OPACITY + ")")
        .style("visibility", "hidden")
        .style("inline-size", "150px")
        .style("overflow-wrap", "break-word")
        .style("text-align", "center")
        .text(message)
            .style("color", "black")
            .style("font-size", "80%")
            .style("opacity", "1")
        .append("svg")
            .attr("width", "12px")
            .attr("height", "10px")
            .attr("baseProfile", "full")
            .attr("viewBox", "0 0 32 32")
            .attr("version", "1.1")
            .attr("xmlns", "http://www.w3.org/2000/svg")
            .style("position", "absolute")
            .style("top","-7px")
            .style("left",parseFloat(document.getElementById("tooltip").getBoundingClientRect().width / 2) - 6 + "px")
        .append("path")
            .attr("d", "M 1 24 L 16 1 L 31 24")
            .attr("fill", "rgba(255, 255, 255, 0.9)")
            .attr("stroke", "rgba(255, 255, 255, 0.9)")
            .attr("stroke-width", 2);
    //If mouse is still over element after DELAY make tooltip visible
    setTimeout(() => {  
        if ($("#"+ id + ":hover").length !== 0 && !visible) {
            let mouseX = e.clientX;
            visible = true;
            d3.select("#tooltip")
                .style("left", parseFloat(mouseX - document.getElementById("tooltip").getBoundingClientRect().width / 2) + "px")
                .style("visibility", "visible");
        }
    }, DELAY);
    //Delete the tooltip when mouse leaves element before the time has passed
    d3.select("#" + id).on("mouseout", function() {
        d3.select("#tooltip").remove();
        tooltip_shown = false;
    });
}
