const compositeLoader = class {
    constructor() {
        this.files = {}
    }

    async loadFiles(file_list) {
        const self = this,
            n = file_list.length,
            promise_arr = Array(n);
        for (let i = 0; i < n; i++) {
            await new Promise(function(resolve, reject) {
                const file = file_list[i];
                if (file.name in this.files) {
                    if (!confirm(file.name + " already loaded. Overwrite?")) {
                        reject(file.name + " already loaded.")
                    }
                };
                const reader = new FileReader();

                reader.onload = function() {
                    const {xmin, xmax, sense, anti} = parse_composite(reader.result),
                        promise = () => new Promise(function(resolve_) {resolve_()});
                    promise_arr[i] = i === 0 ? promise() : promise_arr[i - 1].then(promise);

                    // Update composites object
                    self.files[id] = {xmin: xmin, xmax: xmax, sense: sense, anti: anti};

                    resolve()
                };
            })
        }
        
        this.files[file.id] = file
    }

    parseComposite(text) {
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
}