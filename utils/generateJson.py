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
        "proteinName": "",
        "geneCategory": "",
        "referencePoint": "",
        "plotData": [],
        "tags": ""
    }


if __name__ == '__main__':

    parser = argparse.ArgumentParser()
    parser.add_argument(
        'pileupData', help='tag pileup data for gene categories (CSV)')
    args = parser.parse_args()

    openfile = open(args.pileupData).readlines()
    category = {}

    # set the range of value for x-axis (-250, 250)
    xaxis = list(range(-250, 250))
    # range from -500 to 500
    # xaxis = list(range(-500,500))

    colors = ['#1B9E77', '#1B9E77', '#D95F02', '#D95F02', '#7570B3', '#7570B3', '#E72989', '#E72989', '#66A61E', '#66A61E',
              '#E6AB01', '#E6AB01', '#693C9A', '#693C9A', '#A6761C', '#A6761C', '#E3191B', '#E3191B', '#000000', '#000000']
    colorIndex = 0

    for line in openfile:
        temp = line.strip().split(',')
        dname = "-".join(temp[0:4])
        # Pick -250 to 250 bp region, slicing the data matrix
        dat = temp[4:]
        yaxis = dat[250:750]

        # Pick -500 to 500
        # yaxis = temp[4:]

        # print(dname)
        if colorIndex > 19:
            colorIndex = 0

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
            plotItem = getPlotObject(dname, items, colors[colorIndex])
            colorIndex = colorIndex + 1

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
                finalData[counter]['proteinName'] = p
                finalData[counter]['plotData'] = category[k][i][p]
                # print p,len(category[k][i][p])
                counter = counter + 1

    # print(json.dumps(category))
    # pprint.pprint(category)
    # pprint.pprint(dataset)
    print(json.dumps(finalData))
