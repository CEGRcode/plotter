let sliding_window = function(xdomain, occupancy, window) {
    let occupancy_val = occupancy.slice(0, window).reduce((a, c) => a + c, 0) / window,
        new_xdomain = [(xdomain[0] + xdomain[window - 1]) / 2],
        new_occupancy = [occupancy_val];
    for (let i = 0; i < occupancy.length - window - 1; i++) {
        new_xdomain.push((xdomain[i + 1] + xdomain[i + window]) / 2);
        occupancy_val += (occupancy[i + window] - occupancy[i]) / window;
        new_occupancy.push(occupancy_val);
    };
    return {new_xdomain: new_xdomain, new_occupancy: new_occupancy}
}