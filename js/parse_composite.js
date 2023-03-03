let parse_composite = function(text) {
    let lines = text.split("\n"),
        xmin, xmax, sense, anti, xmin_curr, xmax_curr, offset,
        i = 0;
    while (i < lines.length) {
        let line = lines[i];
        // Skip empty lines
        if (line.trim() === "") {
            i++;
            continue
        };
        // Tab-separated fields
        let fields = line.split("\t");
        // If the first field is empty or "NAME" it is the x domain
        if (fields[0] === "" || fields[0] === "NAME") {
            xmin_curr = parseInt(fields[1]);
            xmax_curr = parseInt(fields[fields.length - 1]);
            // If the x domain starts at 0 shift it to the left
            if (xmin_curr === 0) {
                xmin_curr -= Math.floor(xmax_curr / 2)
                xmax_curr -= Math.floor(xmax_curr / 2)
            };
            // If the x domain is not defined yet, define it
            if (xmin === undefined || xmax === undefined) {
                xmin = xmin_curr;
                xmax = xmax_curr;
                sense = Array(xmax_curr - xmin_curr + 1).fill(0);
                anti = Array(xmax_curr - xmin_curr + 1).fill(0)
            // If the x domain is defined, extend it if necessary
            } else {
                if (xmin_curr < xmin) {
                    sense.unshift(Array(xmin - xmin_curr).fill(0));
                    anti.unshift(Array(xmin - xmin_curr).fill(0));
                    xmin = xmin_curr
                };
                if (xmax_curr > xmax) {
                    sense.push(Array(xmax_curr - xmax).fill(0));
                    anti.push(Array(xmax_curr - xmax).fill(0));
                    xmax = xmax_curr
                }
            };
            // Calculate the offset of the current x domain
            offset = xmin_curr - xmin
        // Add the values to the sense and anti arrays
        } else if (fields[0].toLowerCase().includes("sense")) {
            for (let j = 1; j < fields.length; j++) {
                sense[offset + j - 1] += parseFloat(fields[j])
            }
        } else if (fields[0].toLowerCase().includes("anti")) {
            for (let j = 1; j < fields.length; j++) {
                anti[offset + j - 1] += parseFloat(fields[j])
            }
        // If the first field is not empty or "NAME" and does not contain "sense" or "anti" it is combined or midpoint data
        } else {
            for (let j = 1; j < fields.length; j++) {
                sense[offset + j - 1] += parseFloat(fields[j]) / 2;
                anti[offset + j - 1] += parseFloat(fields[j]) / 2
            }
        };

        i++
    };

    return {xmin: xmin, xmax: xmax, sense: sense, anti: anti}
}