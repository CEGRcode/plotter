
// Parse input File object of ScriptManager's TagPileup tab-delimited output
module.exports = (file) => {
	// Debug test statement that can be deleted later
	console.log("HELLO " + file.name);

	let compositeJSON;

	let fr = new FileReader();
	// Parse text content of file
	fr.onload = function(e) {
			let dataLists = {};

			console.log(e);
			// Split lines
			let lines = this.result.split('\n');
			for (let l = 0; l<lines.length; l++) {
				// Split tokens
				let tokens = lines[l].split('\t');
				// Skip empty lines
				if (tokens.length<2) { continue; }

				// Parse dataset info
				let fieldname = tokens[0];

				// Debug lines
				console.log("LENGTH: " + tokens.length);
				console.log(fieldname);

				// Parse x values (if empty first token)
				if (fieldname==="") {
					console.log("Empty first token.");
					dataLists["X"] = tokens.slice(1);
					//console.log(dataLists["X"].length);
					continue;
				}
				// Parse y values (access by fieldname)
				dataLists[fieldname] = tokens.slice(1);
				console.log(dataLists[fieldname]);
			}

			// Format each array in dataLists to POST data object structure
			// for each y dataset...
				// parse out sense/anti, dataset ID, etc from filename
				// ***CODE HERE*** (update compositeJSON)
				// format x/y values
				// ***CODE HERE*** (update compositeJSON)
			compositeJSON = Object.keys(dataLists)[1];
			console.log(compositeJSON);
	}

	fr.readAsText(file);

	return(compositeJSON);
}
