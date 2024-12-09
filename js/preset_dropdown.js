const presetDropdown = class {
    constructor(elementID) {
        if (document.getElementById(elementID) === null) {
            throw "Element ID " + elementID + " not found"
        };

        this.dropdown = d3.select("#" + elementID)
            .on("change", function(ev) {
                if (ev.target.value === "0") {
                    return
                };
                
                const preset = presetSettings[ev.target.value - 1];
                dataObj.updateGlobalSettings(preset.globalSettings);
                dataObj.compositeData = [];
                for (const idx in preset.compositeData) {
                    dataObj.compositeData.push(new compositeObject({idx: idx, ...preset.compositeData[idx]}))
                };
                updateAll()
            });

        this.update()
    }

    update() {
        this.dropdown.selectAll("option")
            .data([{name: "Select a preset:"}, ...presetSettings])
            .join("option")
                .attr("value", (_, i) => i)
                .text(d => d.name)
    }
};

const presetDropdownObj = new presetDropdown("preset-dropdown");