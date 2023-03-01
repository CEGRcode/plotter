let parse_composite = function(text) {
    let lines = text.split("\n"),
        xmin, xmax, sense, anti, xmin_curr, xmax_curr, offset,
        i = 0;
    while (i < lines.length) {
        let line = lines[i];
        if (line.trim() === "") {
            i++;
            continue
        };
        let fields = line.split("\t");
        if (fields[0] === "" || fields[0] === "NAME") {
            xmin_curr = parseInt(fields[1]);
            xmax_curr = parseInt(fields[fields.length - 1]);
            if (xmin_curr === 0) {
                xmin_curr -= Math.floor(xmax_curr / 2)
                xmax_curr -= Math.floor(xmax_curr / 2)
            };

            if (xmin === undefined || xmax === undefined) {
                xmin = xmin_curr;
                xmax = xmax_curr;
                sense = Array(xmax_curr - xmin_curr + 1).fill(0);
                anti = Array(xmax_curr - xmin_curr + 1).fill(0)
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

            offset = xmin_curr - xmin
        } else if (fields[0].toLowerCase().includes("sense")) {
            for (let j = 1; j < fields.length; j++) {
                sense[offset + j - 1] += parseFloat(fields[j])
            }
        } else if (fields[0].toLowerCase().includes("anti")) {
            for (let j = 1; j < fields.length; j++) {
                anti[offset + j - 1] += parseFloat(fields[j])
            }
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