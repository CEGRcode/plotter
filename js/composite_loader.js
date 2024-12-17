const compositeLoader = class {
    constructor() {}

    loadFiles(file_list) {
        const self = this,
            n = file_list.length,
            promise_arr = [];
        for (let i = 0; i < n; i++) {
            promise_arr.push(new Promise(function(resolve, reject) {
                const file = file_list[i];
                if (file.name in dataObj.fileData) {
                    if (!confirm(file.name + " already loaded. Overwrite?")) {
                        reject(file.name + " already loaded.")
                    }
                };
                const reader = new FileReader();

                reader.onload = function() {
                    // Update files object
                    dataObj.fileData[file.name] = self.parseComposite(reader.result);

                    resolve()
                };

                reader.onerror = function() {
                    alert("Error loading file!!");
                    reject("Error loading file")
                };

                reader.readAsText(file)
            }))
        };

        return promise_arr
    }

    loadMultiComposite(file) {
        const self = this;

        return new Promise(function(resolve, reject) {
            const reader = new FileReader();

            reader.onload = function() {
                const {composites: multiCompositeData, ids} = self.parseMultiComposite(reader.result);
                Object.assign(dataObj.fileData, multiCompositeData);

                resolve(ids)
            };

            reader.onerror = function() {
                alert("Error loading file!!");
                reject("Error loading file")
            };

            reader.readAsText(file)
        })
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
    }

    parseMultiComposite(text) {
        let lines = text.split("\n"),
            composites = {},
            ids = [],
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
                    composites[id] = {xmin: xmin, xmax: xmax, sense: sense, anti: anti};
                    ids.push(id)
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
            } else {
                id = col0.split("_").slice(0, -1).join("_");
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
            composites[id] = {xmin: xmin, xmax: xmax, sense: sense, anti: anti};
            ids.push(id)
        };
        return {composites, ids}
    }
};

const compositeLoaderObj = new compositeLoader();