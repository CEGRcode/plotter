#!/usr/bin/python

import sys
import os
import argparse
import json
import pprint


if __name__ == '__main__':

    parser = argparse.ArgumentParser()
    parser.add_argument(
        'scalingCSV', help='CSV file containing scaling factors for each dataset')
    parser.add_argument(
        'jsonData', help='JSON file output from generateJson.py')
    args = parser.parse_args()

    scalingFactors = {}

    openfile = open(args.scalingCSV, 'r').readlines()
    for line in openfile:
        temp = line.strip().split(',')
        # print(temp[0].split('_')[1])
        datasetFactor = temp[0].split('_')[1]
        if datasetFactor not in scalingFactors.keys():
            scalingFactors[datasetFactor] = round(float(temp[1]), 2)

    # print(scalingFactors)

    # loading the jsonData
    jfile = open(args.jsonData, 'r').readlines()
    jdata = json.loads(jfile[0])
    for i in jdata.keys():
        # print(jdata[i].keys())
        jdata[i]["totalTagScaling"] = scalingFactors[jdata[i]['proteinName']]

    print(json.dumps(jdata))
