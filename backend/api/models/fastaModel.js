const mongoose = require("mongoose");

// define the schema for a fasta sequence, each fasta has below properties.
const fastaSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  geneCategory: String,
  referencePoint: String,
  plotData: [{ id: String, color: String, data: [Object] }]
});

module.exports = mongoose.model("Fasta", fastaSchema);
