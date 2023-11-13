$(function() {
    d3.select("#generate-3D-button").on("click", function() {
        //Parse projection coords
        start = parseInt($("#nucleosome-slider").nucleosome_slider("get_starting_coord"));
        projection_coords = $("#nucleosome-slider").nucleosome_slider("get_projection_coords");
        projection_coords_string = "";
        for (coord of projection_coords){
            if (coord != ""){
                projection_coords_string += (parseInt(coord) - start) + ",";
            }
        }
        projection_coords_string = projection_coords_string.substring(0, projection_coords_string.length - 1);
        //Parse mark coords
        mark_coords = $("#nucleosome-slider").nucleosome_slider("get_mark_coords");
        mark_coords_string = "";
        for (coord of mark_coords){
            if (coord != ""){
                mark_coords_string += (parseInt(coord)) + ",";
            }
        }
        mark_coords_string = mark_coords_string.substring(0, mark_coords_string.length - 1);
        //Create and open url
        let url = "https://3dmol.org/viewer.html?pdb=2cv5&select=all&style=cartoon:color~gray&select=resi:" + 
                    projection_coords_string + 
                    "&style=cartoon:color~yellow;stick&labelres=backgroundOpacity:0.8;fontSize:14;&select=resi:" + 
                    mark_coords_string + 
                    "&style=cartoon:color~lightblue;stick&labelres=backgroundOpacity:0.8;fontSize:14";
        window.open(url);
    })
})