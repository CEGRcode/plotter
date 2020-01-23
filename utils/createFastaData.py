#!/usr/bin/python

import sys
import os
import argparse
import json
import pprint


def getPlotObject(id, items, colorValue):
    """
    returns plot object
    """
    return {
        "id": id,
        "color": colorValue,
        "data": items
    }


def getCoOrdinates(xValue, yValue):
    """
    retuns an object with x any y values
    """
    return {"x": xValue, "y": yValue}


def getBackendObject():
    """
    returns an object for the backend
    """
    return {
        "geneCategory": "",
        "referencePoint": "",
        "plotData": [],
    }


if __name__ == '__main__':

    parser = argparse.ArgumentParser()
    parser.add_argument(
        'fastaData', help='fasta information in a CSV format')
    args = parser.parse_args()

    openfile = open(args.fastaData).readlines()

    category = {}
    # set the range of value for x-axis (-250, 250)
    xaxis = list(range(-250, 250))
    # A T G C
    colors = ['#fe1918', '#32cc3c', '#fcfc50', '#2b31f6']

    for line in openfile:
        temp = line.strip().split(',')
        dname = "-".join(temp[0:4])
        # Pick -250 to 250 bp region, slicing the data matrix
        dat = temp[4:]
        yaxis = dat[250:750]

        if temp[0] not in category.keys():
            category[temp[0]] = {}
        if temp[1] not in category[temp[0]].keys():
            category[temp[0]][temp[1]] = {}
        if temp[2] not in category[temp[0]][temp[1]].keys():
            category[temp[0]][temp[1]][temp[2]] = []
        if temp[3] not in category[temp[0]][temp[1]][temp[2]]:
            items = []
            for i in range(0, len(xaxis)):
                items.append(getCoOrdinates(xaxis[i], yaxis[i]))
            if dname.endswith('A'):
                plotItem = getPlotObject(dname, items, colors[0])
            elif dname.endswith('T'):
                plotItem = getPlotObject(dname, items, colors[1])
            elif dname.endswith('G'):
                plotItem = getPlotObject(dname, items, colors[2])
            elif dname.endswith('C'):
                plotItem = getPlotObject(dname, items, colors[3])

            # if temp[3] == "Sense":
            #     plotItem = getPlotObject(dname,items,"blue")
            # else:
            #     plotItem = getPlotObject(dname,items,"red")
            category[temp[0]][temp[1]][temp[2]].append(plotItem)

    # Generate the JSON to POST to backend
    counter = 0
    finalData = {}
    for k, v in category.items():
        # print(k)
        for i, j in v.items():
            # print(i)
            for p, q in j.items():
                finalData[counter] = getBackendObject()
                finalData[counter]['geneCategory'] = k
                finalData[counter]['referencePoint'] = i
                finalData[counter]['plotData'] = category[k][i][p]
                # print p,len(category[k][i][p])
                counter = counter + 1

    # print(json.dumps(category))
    # pprint.pprint(category)
    # pprint.pprint(dataset)
    print(json.dumps(finalData))
