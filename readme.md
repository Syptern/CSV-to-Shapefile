# .CSV to point shapefile converter

Convert your .csv files with coordinates to a shapefile with this tool.

## How to run

clone repository

Have Java installed (version greater than 1.8)

run the following commands:

```
export PATH=$(cd bin; pwd):$PATH
```

```
node server.js
```

Then go to **http://localhost:3000**

## CSV file requirements

Make sure your .csv files has two columns with coordinates. The columns must be names **lat** and **lon**. Other data of the csv file will be added to the shapefile as attributes.
