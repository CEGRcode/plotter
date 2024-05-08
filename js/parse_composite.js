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
};

let get_prefixes_from_multiple_composite = function(text) {
    let lines = text.split("\n"),
        names_list = [],
        i = 0;

    while (i < lines.length) {
        let line = lines[i];
        // Skip empty lines
        if (line.trim() === "") {
            i++;
            continue
        };
        // Get the first field
        let col0 = line.split("\t")[0];
        if (col0 === "" || col0 === "NAME") {
            // Get the names of the composites for lines immediately following the xdomain
            names_list.push(lines[++i].split("\t")[0])
        }

        i++
    };

    // Take the first name and split it by "_"
    let split_name = names_list[0].split("_"),
        idx;
    // Iterate over each possible prefix-suffix split
    for (let i = 1; i < split_name.length - 1; i++) {
        let prefix = split_name.slice(0, i).join("_"),
            suffix = split_name.slice(i).join("_"),
            n_prefix = names_list.reduce((a, c) => a + c.startsWith(prefix), 0),
            n_suffix = names_list.reduce((a, c) => a + c.endsWith(suffix), 0);
        if (n_prefix * n_suffix === names_list.length) {
            if (n_suffix === names_list.length) {
                idx = idx === undefined ? i : idx;
                break
            };
            idx = i
        }
    };

    let suffix = split_name.slice(idx).join("_");
    // Get the prefixes by removing the suffix from the names
    return names_list.filter(n => n.endsWith(suffix)).map(n => n.slice(0, -suffix.length))
};

let parse_multiple_composite = function(text, prefix) {
    let lines = text.split("\n"),
        composites = {},
        xmin, xmax, id, sense, anti,
        i = 0,
        save_comp = false;

    while (i < lines.length) {
        let line = lines[i];
        // Skip empty lines
        if (line.trim() === "") {
            i++;
            continue
        };
        // Get the first field
        let fields = line.split("\t"),
            col0 = fields[0];
        if (col0 === "" || col0 === "NAME") {
            // If the x domain is defined, save the composite
            if (save_comp) {
                console.log(id)
                composites[id] = {xmin: xmin, xmax: xmax, sense: sense, anti: anti}
            };
            save_comp = false;
            // Get the new x domain
            xmin = parseInt(fields[1]);
            xmax = parseInt(fields[fields.length - 1]);
            // If the x domain starts at 0 shift it to the left
            if (xmin === 0) {
                xmin -= Math.floor(xmax / 2)
                xmin -= Math.floor(xmax / 2)
            }
        } else if (col0.startsWith(prefix)){
            id = col0.slice(prefix.length).split("_")[0];
            console.log(id)
            save_comp = true;
            if (col0.toLowerCase().includes("sense")) {
                sense = fields.slice(1).map(parseFloat)
            } else if (col0.toLowerCase().includes("anti")) {
                anti = fields.slice(1).map(parseFloat)
            } else {
                sense = fields.slice(1).map(parseFloat).map(x => x / 2);
                anti = fields.slice(1).map(parseFloat).map(x => x / 2)
            }
        };

        i++
    };

    // Save the last composite
    if (save_comp) {
        composites[id] = {xmin: xmin, xmax: xmax, sense: sense, anti: anti}
    };
    console.log(composites)
    return composites
}