import argparse
import json
import requests

def getParams():
    '''Parse parameters from the command line'''
    parser = argparse.ArgumentParser(description='Retrieve 4D Nucleosome metadata from API for plotter.')

    parser.add_argument('-i','--input', metavar='input_fn', required=True, help='the tab-delimited file with 4DNFI accessions of BAM files in the first column')
    parser.add_argument('-o','--output', metavar='json_fn', required=True, help='the output json filename')

    args = parser.parse_args()
    return(args)


# Helper: 4DNFI to URL to payload
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
    for bam_4DNFI in sample_list:
        # Get payload for accession
        url = 'https://data.4dnucleome.org/files-processed/%s/?format=json' % bam_4DNFI
        data = fetch_data(url)

        # Confirm payload accession
        accession = data.get('accession', '4DNFIXXXXXXX').strip()
        if (accession != bam_4DNFI):
            print("Error: mismatched ENCFF (%s != %s)" % (accession, bam_4DNFI))
            continue
        experiments = data.get('experiments', [])
        track_facet_info = data.get("track_and_facet_info", None)



        # Get Library accession
        # Okay that it's None
        ENCLB = None

        # Get Experiment Accession
        ENCSR = None
        for experiment in experiments:
            if '@id' in experiment:
                ENCSR = experiment['@id']
            else:
                print("No experiments or accession not in experiments")

        # Get Experiment-dependent info
        ENCBS = None
        for experiment in experiments:
            if 'biosample' in experiment:
                biosample = experiment['biosample']
                biosource = biosample["biosource"]
                for id in biosource:
                    if "@id" in id:
                        ENCBS = id["@id"]
                    else:
                        print("No biosource or ENCBS not in biosource")
            else:
                print("No experiments or biosample not in experiments")

        # Get Target
        target = None
        if track_facet_info is not None:
            target = track_facet_info["assay_info"]
        else:
            print("No track_and_facet_info, can't find experiment_type")

        # Get Biosample name
        strain = None
        for experiment in experiments:
            if 'biosample' in experiment:
                biosample = experiment['biosample']
                biosource = biosample["biosource"]
                for bio in biosource:
                    if "cell_line" in bio:
                        cell_line = bio["cell_line"]
                    else:
                        print("No biosource or cell_line not in biosource")
                strain = cell_line["term_name"]
            else:
                print("No experiments or biosample not in experiments")

        # Get Treatment (N/A for now)

        # Get Assay
        assay_title = None
        if track_facet_info is not None:
            assay_title = track_facet_info["experiment_type"]
        else:
            print("No track_and_facet_info, can't find experiment_type")

        # Get Read Info
        assembly = data.get("genome_assembly", None)

        file_size = data.get('file_size', None)

        # Get Total Reads
        # CUT&RUN doens't have total reads
        total_reads = None 
        if assay_title == "in situ Hi-C":
            total_reads = None
            quality_metric = data.get("quality_metric", [])
            quality_metric_summary = quality_metric.get("quality_metric_summary", [])
            for metric in quality_metric_summary:
                if metric["title"] == "Total Reads":
                    total_reads = metric["value"]
                    break
                else:
                    print("No quality_metric_summary, can't find total reads")

        # Get all Fastq's from the json
        fastq_list = []
        if assay_title == "CUT&RUN":
            workflow_run_outputs = data.get('workflow_run_outputs', [])
            for w in workflow_run_outputs:
                if "input_files" in w:
                    for input_file in w["input_files"]:
                        if "value" in input_file:
                            value = input_file["value"]
                            if "@id" in value:
                                id = value["@id"]
                                if "/files-fastq/" in id:
                                    parts = id.split('/')
                                    fastq = parts[-2]   
                                    fastq_list.append(fastq)
                            else:
                                print("@id not in value section")
                        else:
                            print("value not in input_files section")
                else:
                    print("input_files not in workflow_run_outputs section")
        
        fastq_read_length_dict = {}
        fastq_run_type_dict = {}
        for f in fastq_list:
            fastq_url = 'https://data.4dnucleome.org/files-fastq/%s/?format=json' % f
            fastq_data = fetch_data(fastq_url)
            read_length = fastq_data.get("read_length", None)
            key = "/files-fastq/" + f
            fastq_read_length_dict[key] = read_length
            if "paired_end" in fastq_data:
                run_type = "pair-ended"
            else:
                run_type = "single-ended"
            fastq_read_length_dict[key] = run_type

        # Get Read Length
        mapped_read_length = None  
        if assay_title == "CUT&RUN":
            mapped_read_length = [fastq_read_length_dict]

        # Get Run Type
        # May need to double check if this is extracted from the right place
        mapped_run_type = None
        if assay_title == "CUT&RUN":
            mapped_read_length = [fastq_read_length_dict]

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
                'total_reads': str(total_reads),
                'read_length': (mapped_read_length),
                'run_type': str(mapped_run_type)
            }
        })

    # Writing to sample.json
    with open(args.output, "w") as outfile:
        outfile.write(json.dumps(metadata, indent=4))