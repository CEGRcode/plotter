const mongoose = require("mongoose");

// define the schema for a dataset, each dataset has below properties.
const datasetSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  proteinName: String,
  geneCategory: String,
  referencePoint: String,
  plotData: [{ id: String, color: String, data: [Object] }],
  tags: [String],
  totalTagScaling: Number
});

module.exports = mongoose.model("Dataset", datasetSchema);
