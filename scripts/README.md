# scripts

Python helper scripts for generating metadata JSONs formatted for plotter

## get_metadata_from_ENCODE.py

** Needs reformatting for different `schema_version` codes but uses None types for info not found**

Retrieves the following information keyed on the BAM file accession (ENCFFXXXXXX) using the ENCODE API.
- experiment accession (ENSRXXXXXX)
- assay name
- biosample accession (ENCBSXXXXXX)
- strain info, run type (single/paired end)
- target ("None" if not applicable)
- file size
- read length
- genome assembly

```
usage: get_metadata_from_ENCODE.py [-h] -i input_fn -o json_fn

Retrieve ENCODE metadata from API for plotter.

optional arguments:
  -h, --help            show this help message and exit
  -i input_fn, --input input_fn
                        the tab-delimited file with ENCFF accessions of BAM
                        files in the first column
  -o json_fn, --output json_fn
                        the output json filename
```

## get_metadata_from_TABfile.py
Reformats the metadata within the tab delimited file such that the first column is the set of accession keys and the subsequent columns are all the metadata fields keyed by their header value (first row column names).

```
usage: get_metadata_from_TABfile.py [-h] -i input_fn -o json_fn

Retrieve metadata from a tab-delimited file for plotter.

optional arguments:
  -h, --help            show this help message and exit
  -i input_fn, --input input_fn
                        the tab-delimited file with ID keys in the first
                        column and metadata field names in the first row
  -o json_fn, --output json_fn
                        the output json filename
```


## Run tests
```
python get_metadata_from_ENCODE.py -i testdata/encode_samples.txt -o testdata/encode_samples.json
python get_metadata_from_TABfile.py -i testdata/samples.tab -o testdata/samples.json
```
