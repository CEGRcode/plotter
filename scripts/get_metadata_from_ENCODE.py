import argparse
import json
import requests

def getParams():
    '''Parse parameters from the command line'''
    parser = argparse.ArgumentParser(description='Retrieve ENCODE metadata from API for plotter.')

    parser.add_argument('-i','--input', metavar='input_fn', required=True, help='the tab-delimited file with ENCFF accessions of BAM files in the first column')
    parser.add_argument('-o','--output', metavar='json_fn', required=True, help='the output json filename')

    args = parser.parse_args()
    return(args)


# Helper: ENCFF to URL to payload
def fetch_data(url):
    # Force return from the server in JSON format
    headers = {'accept': 'application/json'}

    # GET the search result
    response = requests.get(url, headers=headers)

    # Extract the JSON response as a python dictionary
    search_results = response.json()
    return(search_results)


# Main program which takes in input parameters
if __name__ == '__main__':

    # Get params
    args = getParams()

    # Parse list of accessions
    sample_list = []
    reader = open(args.input, 'r')
    for line in reader:
        sample_list.append(line.strip().split('\t')[0])
    reader.close()

    # Initialize metadata storage dict
    metadata = {}

    # Parse payload for each accession
    for ENCFF in sample_list:
        # Get payload for accession
        url = 'https://www.encodeproject.org/files/%s/?format=json' % ENCFF
        data = fetch_data(url)

        # Confirm payload accession
        accession = data.get('accession', 'ENCFFXXXXXX').strip()
        if (accession != ENCFF):
            print("Error: mismatched ENCFF (%s != %s)" % (accession, ENCFF))
            continue


        # Get Library accession
        ENCLB = data.get('replicate',{'library':{'accession':None}})['library']['accession']

        # Get Experiment Accession
        ENCSR = data.get('dataset',None)

        # Get Experiment-dependent info
        ENCBS = data.get('replicate',{'library':{'biosample':None}})['library']['biosample']
        # if (ENCSR != None and ENCLB != None):
        #
        #     srurl = 'https://www.encodeproject.org/%s/?format=json' % ENCSR
        #     srdata = fetch_data(srurl)
        #     # lburl =' https://www.encodeproject.org/%s/?format=json' % ENCLB
        #     replicates = srdata.get('replicates',[{'library':{'accession':None}}])
        #     for r in replicates:
        #         print('==========')
        #         lb = r['library']
        #         if (lb['accession'] == ENCLB):
        #             ENCBS = lb.get('biosample',{'accession':None})
        #             break

        # Get Target
        target = data.get('target',{'@id':None})['@id']

        # Get Biosample name
        strain = data.get('biosample_ontology',{'term_name':None})['term_name']

        # Get Treatment (N/A for now)

        # Get Assay
        assay_title = data.get('assay_title', None)

        # Get Read Info
        assembly = data.get('assembly', None)
        file_size = data.get('file_size', None)
        mapped_read_length = data.get('mapped_read_length', None)
        mapped_run_type = data.get('mapped_run_type', None)

        # Future work: add audit information

        # Udate metadata with new accession info
        metadata.update({
            accession: {
                'ENCSR': str(ENCSR),
                'ENCLB': str(ENCLB),
                'target': str(target),
                'ENCBS': str(ENCBS),
                'strain': str(strain),
                'assay': str(assay_title),
                'assembly': str(assembly),
                'file_size': str(file_size),
                'read_length': str(mapped_read_length),
                'run_type': str(mapped_run_type)
            }
        })

    # Writing to sample.json
    with open(args.output, "w") as outfile:
        outfile.write(json.dumps(metadata, indent=4))
