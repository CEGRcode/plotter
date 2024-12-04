const roundUpWithPrecision = function(value, precision=2) {
    // Round the absolute value of a number up with a given precision
    const absValue = Math.abs(value),
        sign = Math.sign(value);
    if (absValue === 0) {
        return 0
    };
    const factor = Math.pow(10, Math.floor(Math.log10(absValue)) - precision + 1);
    return Math.ceil(absValue / factor) * factor * sign
}

const roundNearestWithPrecision = function(value, precision=2) {
    // Round the absolute value of a number to the nearest value with a given precision
    const absValue = Math.abs(value),
        sign = Math.sign(value);
    if (absValue === 0) {
        return 0
    };
    const factor = Math.pow(10, Math.floor(Math.log10(absValue)) - precision + 1);
    return Math.round(absValue / factor) * factor * sign
}