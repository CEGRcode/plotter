const express = require("express");
const router = express.Router();

// require the samplesController
const datasetsController = require("../controllers/datasetsController");

// GET (order of the below routes does matter, for query parameter handling)
// get all unique categories
router.get("/", datasetsController.getCategories);

// get all unique reference points for a given category; requires query string -- category=value
router.get("/refs", datasetsController.getCategoryRefPoints);

// get all datasets for a unique category + ref ; requires query strings -- category=value&ref=value
router.get("/data", datasetsController.getDatasets);

// POST
// create a new dataset
router.post("/", datasetsController.createDataset);

// export the router
module.exports = router;
