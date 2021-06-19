import geoscript.geom.*
import geoscript.workspace.*
import geoscript.feature.*


def dir = new Directory("/Users/timonvanzoest/Documents/UNIBZ/Advanced_geomatics/exam/output")
def inputFile = "/Users/timonvanzoest/Documents/UNIBZ/Advanced_geomatics/exam/uploads/" + args[0] as File

def data = []
def columns = []
def featuresMap = []

//loop csv file
inputFile.eachLine{ line, index -> 
       def line_data = [:]
       def splitLine = line.split(",")
       //extract columns
       if(index == 1) {
        columns = splitLine
       }
       //save each line as map with column names
       if(index > 1) {
        columns.eachWithIndex{ column, i-> 
            line_data << [(column):splitLine[i]]
    
        
       }
        data << line_data


   }
}

def schema =  [ 
 ['the_geom','Point','epsg:4326']
 ]

// loop data
data.eachWithIndex{ e, i -> 
 // create feature with just the coordinates
 def feature = [the_geom: new Point(e["lat"] as Float, e["lon"] as Float)]
    // loop through one line
    e.eachWithIndex { column, index -> 
        println column.key
        // check the type of the value to create the right schema
        if(column.value.isInteger()){
            // add feature to schema if first time
            if(i == 1) {
                    schema << [column.key, 'Integer']
            }
              feature << [(column.key):column.value as Integer]
        }
        
        else if(column.value.isNumber()){
            if(i == 1) {
                    schema << [column.key, 'Float']
            }
              feature << [(column.key):column.value as Float]

        }
        else {
            if(i == 1) {
                    schema << [column.key, 'String']
            }
              feature << [(column.key):column.value]
        }
     
    }  
    
    featuresMap << feature
 }

//create layer
def simpleLayer = dir.create("csv_converted", schema)
// add features
simpleLayer.add(featuresMap) 

// println "features in layer = " + simpleLayer.count()
println  "schema: " + schema
println  "features: " + featuresMap

