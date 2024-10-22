let slidingWindow = function(vec, window) {
    let val = vec.slice(0, window).reduce((a, c) => a + c, 0) / window,
        newVec = [val];
    for (let i = 0; i < vec.length - window - 1; i++) {
        val += (vec[i + window] - vec[i]) / window;
        newVec.push(val);
    };
    return newVec
}