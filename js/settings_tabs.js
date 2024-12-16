const settingsTabs = d3.select("#settings-tabs"),
    globalSettingsTab = settingsTabs.append("button")
        .attr("id", "global-settings-tab")
        .classed("settings-tab", true)
        .classed("selected-tab", true)
        .text("Global settings")
        .on("click", function() {
            d3.selectAll(".settings-tab").classed("selected-tab", false);
            d3.select(this).classed("selected-tab", true);
            d3.selectAll(".settings-section").classed("hidden", true);
            d3.select("#global-settings").classed("hidden", false)
        }),
    referenceAxesTab = settingsTabs.append("button")
        .attr("id", "reference-lines-input-tab")
        .classed("settings-tab", true)
        .text("Reference lines")
        .on("click", function() {
            d3.selectAll(".settings-tab").classed("selected-tab", false);
            d3.select(this).classed("selected-tab", true);
            d3.selectAll(".settings-section").classed("hidden", true);
            d3.select("#reference-lines-input").classed("hidden", false)
        }),
    nucleosomeSliderTab = settingsTabs.append("button")
        .attr("id", "nucleosome-slider-tab")
        .classed("settings-tab", true)
        .text("Nucleosome slider")
        .on("click", function() {
            d3.selectAll(".settings-tab").classed("selected-tab", false);
            d3.select(this).classed("selected-tab", true);
            d3.selectAll(".settings-section").classed("hidden", true);
            d3.select("#nucleosome-slider").classed("hidden", false)
        });