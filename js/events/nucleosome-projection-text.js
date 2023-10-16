$(function() {
    let projection_text = d3.select("#nucleosome-projection-text");
    let mark_text = d3.select("#mark-nucleosome-text")
    let svg = d3.select("#nucleosome-svg");
    var CTM = svg.node().getScreenCTM();
    let selectedElement = null;
    let offset = { x: 0, y: 0 };

    function getMousePosition(e) {
        return {
            x: (e.clientX - CTM.e) / CTM.a,
        };
    }

    function startDragging(e, element) {
        selectedElement = element;
        offset = getMousePosition(e);
    }

    function drag(e) {
        if (selectedElement) {
            var mousePos = getMousePosition(e);
            var currentX = parseFloat(selectedElement.getAttribute("x"));
            var newX = currentX + (mousePos.x - offset.x) / 146 * 100;
            selectedElement.setAttribute("x", newX + "%");

            offset = getMousePosition(e);
            updateTextBox();
            updateNucleosome();
        }
    }
    
    function endDragging() {
        selectedElement = null;
    }

    function updateTextBox() {
        let projectionCoords = svg.selectAll(".projection-coord");
        let positions = projectionCoords.nodes().map((element) => parseInt(parseFloat(element.getAttribute("x")) * 1.46));
        projection_text.property("value", positions.join(","));
        let markCoords = svg.selectAll(".mark-coord");
        positions = markCoords.nodes().map((element) => parseInt(parseFloat(element.getAttribute("x")) * 1.46));
        mark_text.property("value", positions.join(","));
    }

    projection_text.on("input", function() {
        svg.selectAll(".projection-coord").remove();
        if (projection_text.property("value") !== "") {
            let projections = projection_text.property("value").split(",");
            let i = 0;
            for (var coord of projections) {
                if (coord > -1) {
                    svg.append("rect")
                        .attr("id", "projection-coord-" + i)
                        .attr("class", "projection-coord nucleosome-coord")
                        .attr("width", "5px")
                        .attr("x", coord / 146 * 100 + "%")
                        .attr("height", "100%")
                        .style("fill", "rgb(255, 252, 97)")
                        .on("mousedown", function(e) {
                            startDragging(e, this);
                        });
                }
                i += 1;
            }

            svg.on("mousemove", drag);
            svg.on("mouseup", endDragging);
        }
        updateNucleosome();
    });

    mark_text.on("input", function() {
        svg.selectAll(".mark-coord").remove();
        if (mark_text.property("value") !== "") {
            let projections = mark_text.property("value").split(",");
            let i = 0;
            for (var coord of projections) {
                if (coord > -1) {
                    svg.append("rect")
                        .attr("id", "mark-coord-" + i)
                        .attr("class", "mark-coord nucleosome-coord")
                        .attr("width", "5px")
                        .attr("x", coord / 146 * 100 + "%")
                        .attr("height", "100%")
                        .style("fill", "rgb(205, 233, 255)")
                        .on("mousedown", function(e) {
                            startDragging(e, this);
                        });
                }
                i += 1;
            }

            svg.on("mousemove", drag);
            svg.on("mouseup", endDragging);
        }
        updateNucleosome();
    });
});