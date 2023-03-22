import argparse
import json
import requests

def getParams():
    '''Parse parameters from the command line'''
    parser = argparse.ArgumentParser(description='Retrieve metadata from a tab-delimited file for plotter.')

    parser.add_argument('-i','--input', metavar='input_fn', required=True, help='the tab-delimited file with ID keys in the first column and metadata field names in the first row')
    parser.add_argument('-o','--output', metavar='json_fn', required=True, help='the output json filename')

    args = parser.parse_args()
    return(args)

# Main program which takes in input parameters
if __name__ == '__main__':

    # Get params
    args = getParams()


    # Initialize metadata storage dict
    headers = ""
    metadata = {}

    # Parse tab file
    reader = open(args.input, 'r')
    for line in reader:
        tokens = line.strip().split('\t')
        # Parse headers out of first row
        if (headers == ""):
            headers = tokens[1:]
            continue

        # Confirm payload accession
        accession = tokens[0]
        thisdata = {}
        for (i,h) in enumerate(headers):
            thisdata.update({h:tokens[i]})
            # print("=========")
            # print(i)
            # print(h)

        # Udate metadata with new accession info
        metadata.update({
            accession: thisdata
        })
    reader.close()

    # Writing to sample.json
    with open(args.output, "w") as outfile:
        outfile.write(json.dumps(metadata, indent=4))
