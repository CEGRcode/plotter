// require mongoose
const mongoose = require("mongoose");

// load configuration through environment variables from .env to process.env
require("dotenv").config();

// requiring the model files
const Dataset = require("../models/datasetModel");
const Fasta = require("../models/fastaModel");

// API FUNCTIONS
exports.getCategories = (req, res, next) => {
  Dataset.distinct("geneCategory")
    .exec()
    .then(docs => {
      // creating the response object
      const response = {
        count: docs.length,
        categories: docs.sort()
      };
      // sending response
      res.status(200).json(response);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: err });
    });
};

exports.getCategoryRefPoints = (req, res, next) => {
  Dataset.find({ geneCategory: req.query.category }, { _id: -1 })
    .select("referencePoint")
    .exec()
    .then(docs => {
      // retrieve the reference points for the category
      let refs = docs.map(item => {
        return item.referencePoint;
      });

      // remove duplicates
      let data = [...new Set(refs)];

      // creating the response object
      const response = {
        count: data.length,
        referencePoints: data.sort()
      };
      // sending response
      res.status(200).json(response);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: err });
    });
};

exports.getDatasets = (req, res, next) => {
  Dataset.find({
    geneCategory: req.query.category,
    referencePoint: req.query.ref
  })
    .exec()
    .then(docs => {
      // creating the response object
      const response = {
        count: docs.length,
        datasets: docs.sort()
      };
      // sending response
      res.status(200).json(response);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: err });
    });
};

exports.createDataset = (req, res, next) => {
  // creating a new object
  const dataset = new Dataset({
    _id: new mongoose.Types.ObjectId(),
    proteinName: req.body.proteinName,
    geneCategory: req.body.geneCategory,
    referencePoint: req.body.referencePoint,
    plotData: req.body.plotData,
    tags: req.body.tags,
    totalTagScaling: req.body.totalTagScaling
  });
  // saving the item into the database using promises
  dataset
    .save()
    .then(result => {
      res.status(201).json({
        message: "Created the Dataset",
        result: result
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: err });
    });
};

// ####################################################
// Create Fasta sequence
// ####################################################
exports.createFasta = (req, res, next) => {
  // creating a new object
  const fasta = new Fasta({
    _id: new mongoose.Types.ObjectId(),
    geneCategory: req.body.geneCategory,
    referencePoint: req.body.referencePoint,
    plotData: req.body.plotData
  });
  // saving the item into the database using promises
  fasta
    .save()
    .then(result => {
      res.status(201).json({
        message: "Created the Fasta sequence",
        result: result
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: err });
    });
};

exports.getFastaSequence = (req, res, next) => {
  Fasta.find({
    geneCategory: req.query.category,
    referencePoint: req.query.ref
  })
    .exec()
    .then(docs => {
      // creating the response object
      const response = {
        count: docs.length,
        data: docs
      };
      // sending response
      res.status(200).json(response);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: err });
    });
};
