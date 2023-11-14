$(function() {
    d3.select("#generate-3D-button").on("click", function() {
        //Parse projection coords
        start = parseInt($("#nucleosome-slider").nucleosome_slider("get_starting_coord"));
        length = $("#nucleosome-slider").nucleosome_slider("get_length")
        projection_coords = $("#nucleosome-slider").nucleosome_slider("get_projection_coords");
        projection_coords_i = "";
        projection_coords_j = "";
        for (coord of projection_coords){
            if (coord != ""){
                projection_coords_i += (parseInt(coord) - start) + ",";
                projection_coords_j += (length - (parseInt(coord) - start)) + ",";
            }
        }
        projection_coords_i = projection_coords_i.substring(0, projection_coords_i.length - 1);
        projection_coords_j = projection_coords_j.substring(0, projection_coords_j.length - 1);
        //Parse mark coords
        mark_coords = $("#nucleosome-slider").nucleosome_slider("get_mark_coords");
        mark_coords_i = "";
        mark_coords_j = "";
        for (coord of mark_coords){
            if (coord != ""){
                mark_coords_i += (parseInt(coord)) + ",";
                mark_coords_j += (length - parseInt(coord)) + ",";
            }
        }
        mark_coords_i = mark_coords_i.substring(0, mark_coords_i.length - 1);
        mark_coords_j = mark_coords_j.substring(0, mark_coords_j.length - 1);
        //Create and open url 
        let url = "https://3dmol.org/viewer.html?pdb=2cv5&select=all&style=cartoon:color~gray&select=resi:" + 
                    projection_coords_i + 
                    ";chain:I&style=cartoon:color~yellow;stick&select=resi:" + 
                    projection_coords_j + 
                    ";chain:J&style=cartoon:color~yellow;stick&select=resi:"+
                    mark_coords_i + 
                    ";chain:I&style=cartoon:color~lightblue;stick&select=resi:" +
                    mark_coords_j +
                    ";chain:J&style=cartoon:color~lightblue;&select=resi:"+
                    projection_coords_i + "," + mark_coords_i +
                    ";chain:I&labelres=backgroundOpacity:0.8;fontSize:14&select=resi:" + 
                    projection_coords_j + "," + mark_coords_j +
                    ";chain:J&labelres=backgroundOpacity:0.8;fontSize:14";
        window.open(url);
    })
})