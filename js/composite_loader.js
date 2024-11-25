const compositeLoader = class {
    constructor() {
        this.files = {}
    }

    async loadFiles(file_list) {
        const n = file_list.length,
            promise_arr = Array(n),
            ids = [];
        for (let i = 0; i < n; i++) {
            await new Promise(function(resolve, reject) {
                const file = file_list[i];
                if (file.name in this.files) {
                    if (!confirm(file.name + " already loaded. Overwrite?")) {
                        reject(file.name + " already loaded.")
                    }
                }
                const reader = new FileReader();
                ids.push(file.name);
            })
        }
        
        this.files[file.id] = file
    }
}