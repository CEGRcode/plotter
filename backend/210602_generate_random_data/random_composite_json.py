import argparse
import json
import numpy as np

def getParams():
	'''Parse parameters from the command line'''
	parser = argparse.ArgumentParser(description='Generate random JSON composite data for plotter tool')
	parser.add_argument('-s','--seed', default=1, type=int, help='set a random seed')
	parser.add_argument('-w','--window', default=500, type=int, help='set a window size (bp around center)')
	parser.add_argument('-g','--num-groups', metavar='n_groups', dest='n_groups', default=2, type=int, help='set number of groups')
	parser.add_argument('-r','--num-reference', metavar='n_reference', dest='n_reference', default=2, type=int, help='set number of reference coord sets')
	parser.add_argument('-n','--num-samples', metavar='n_samples', dest='n_samples', default=3, type=int, help='set number of samples per group')
	parser.add_argument('-o','--output', metavar='out_json', dest='out_json', default='sample_composite_data.json', help='output JSON filename')
	args = parser.parse_args()
	return(args)

def generate_random_data(window,negative=False):
	'''Generate random sense/anti xy dictionary object for plotData json'''
	xy_dict = [{}] * window
	randy = np.random.lognormal(0,1,window)
	for w in range(window):
		x = w - (window//2)
		y = round(randy[w],2) if randy[w]>0 else 0
		if(negative):
			y = -y
		xy_dict[w] = {"y":y,"x":x}
	return(xy_dict)

if __name__ == '__main__':
	'''Generate random JSON composite data for CEGRcode/plotter'''

	color_palette = ["#fff100","#ff8c00","#e81123","#ec008c","#68217a","#00188f","#00bcf2","#00b294","#009e49","#bad80a"]

	args = getParams()
	np.random.seed(args.seed)

	data = {}
	counter = 0
	# Loop through gene groups (subset of BED coords)
	for g in range(args.n_groups):
		group_name = "Group%i" % g
		# Loop through reference points (BED coords in pileup)
		for r in range(args.n_reference):
			reference_name = "Reference%i" % r
			# Loop through sample data (experiment/BAM in pileup/protein name that antibody targets)
			for s in range(args.n_samples):
				protein_name = "Protein%i" % s
				# Just loop through the color palette
				hexcolor = color_palette[counter % len(color_palette)]
				# Build plot data
				plot_data = [{}]*2
				plot_data[0] = {"color":hexcolor,
								"data":generate_random_data(args.window,False),
								"id":"%s-%s-%s-Sense"%(group_name,reference_name,protein_name)}
				plot_data[1] = {"color":hexcolor,
 								"data":generate_random_data(args.window,True),
			 					"id":"%s-%s-%s-Anti"%(group_name,reference_name,protein_name)}
				# Build full JSON
				sample_json = {"tags":"","totalTagScaling":1.0,"geneCategory":group_name,
							"plotData":plot_data,
							"proteinName":protein_name,"referencePoint":reference_name}
				data.update({counter:sample_json})
				counter += 1

	with open(args.out_json, 'w') as outfile:
		json.dump(data, outfile)
