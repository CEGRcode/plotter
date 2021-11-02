const { version } = require('../../package.json');
const readline = require('readline');
const fs = require('fs');
// const json = require('json');
const FileReader = require('filereader');

// var this_js = $('script[src*=generateJson]'); // or better regexp to get the file name..
//
// var file = this_js.attr('dataout');
// if (typeof file === "undefined" ) {
var file = './composite_average.out';
// }
// alert(file); // to view the variable value

function getPlotObject(id, items, colorValue){
  //returns plot object
  return {
      "id": id,
      "color": colorValue,
      "data": items
  }
}

function getCoOrdinates(xValue, yValue){
  //returns an object with x any y values
  return {"x": xValue, "y": yValue}
}

function getBackendObject(){
  //returns an object for the backend
  return {
      "proteinName": "",
      "geneCategory": "",
      "referencePoint": "",
      "plotData": [],
      "tags": ""
  }
}

function* range(start, end) {
    for (let i = start; i <= end; i++) {
        yield i;
    }
}

// export function hello() {
//   console.log('Hello World');
// }
module.exports = () => {
    console.log('Hi World');
    var reader = new FileReader();
    var lines, temp, dname;
    reader.onload = function(progressEvent){
      // Entire file
      console.log(this.result);

      // By lines
      var lines = this.result.split('\n');
      for(var line = 0; line < lines.length; line++){
        console.log(lines[line]);
        temp = line.strip().split(',');
        let dname = "-".join(temp.slice(0,4));
        //Pick -250 to 250 bp region, slicing the data matrix
        let dat = temp.slice(4);
        let axis = dat.slice(250,750);
      }
    };
    reader.readAsText(file);

    let category =  {};

    //set the range of value for x-axis (-250, 250)
    let xaxis = range(-250, 250);
    //range from -500 to 500
    //xaxis = list(range(-500,500))

    let colors = ['#1B9E77', '#1B9E77', '#D95F02', '#D95F02', '#7570B3', '#7570B3', '#E72989', '#E72989', '#66A61E', '#66A61E',
              '#E6AB01', '#E6AB01', '#693C9A', '#693C9A', '#A6761C', '#A6761C', '#E3191B', '#E3191B', '#000000', '#000000'];
    let colorIndex = 0;
    // Pick -500 to 500
    let yaxis = temp.slice(4)
    for(var i = 0;i < lines.length;i++){
        //code here using lines[i] which will give you each line
        //print(dname)
        var plotItem;
        if (colorIndex > 19){
            colorIndex = 0
        }

        if (!(temp[0] in category.keys())){
            category[temp[0]] = {}
        }

        if (!(temp[1] in category[temp[0]].keys())){
            category[temp[0]][temp[1]] = {}
        }

        if (!(temp[2] in category[temp[0]][temp[1]].keys())){
            category[temp[0]][temp[1]][temp[2]] = []
        }

        if (!(temp[3] in category[temp[0]][temp[1]][temp[2]])){
            let items = []
            for(var i=0;i<xaxis.length;i++){
                items.append(getCoOrdinates(xaxis[i], yaxis[i]))
                plotItem = getPlotObject(dname, items, colors[colorIndex])
                colorIndex = colorIndex + 1
            }
            //if temp[3] == "Sense":
            //    plotItem = getPlotObject(dname,items,"blue")
            //else:
            //    plotItem = getPlotObject(dname,items,"red")
            category[temp[0]][temp[1]][temp[2]].append(plotItem)
        }
    }


    //Generate the JSON to POST to backend
    let counter = 0
    let finalData = {}
    console.log(category)
    for(var k in category.items()){
        //print(k)
        for(var i in k){
            //print(i)
            for (var p in i){
                finalData[counter] = getBackendObject()
                finalData[counter]['geneCategory'] = k
                finalData[counter]['referencePoint'] = i
                finalData[counter]['proteinName'] = p
                finalData[counter]['plotData'] = category[k][i][p]
                //print p,len(category[k][i][p])
                counter = counter + 1
            }
        }
    }
}
// for(k=0;i<category.items().length;k++){
//     for(v=0;v<category.items()[0].length;v++){
//         for(p=0;p<category.items()[k,v].items().length)
//     }
//
// }

//print(json.dumps(category))
//pprint.pprint(category)
//pprint.pprint(dataset)
// console.log(json.dumps(finalData));
