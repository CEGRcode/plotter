d3.select("#download-as-svg").on("click", function() {plotObj.downloadAsSVG()});
d3.select("#download-minimal-svg").on("click", function() {plotObj.downloadAsSVG(true)})