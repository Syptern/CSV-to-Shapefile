// for executing commands
const { exec } = require("child_process")
// for creating an express server for handeling requests
const express = require("express")
// making file upload handling easier
const fileUpload = require("express-fileupload")
// handeling cross origin requests
const cors = require("cors")
// easier to parse the body of a request
const bodyParser = require("body-parser")
// logging requests in the console
const morgan = require("morgan")
// for zipping files
const AdmZip = require("adm-zip")
// for reading files
const fs = require("fs")

const path = require("path")

// defining outputdir to loop through when zipping the files

// setting up express server
const app = express()
app.use(express.static("public"))
app.use(
  fileUpload({
    createParentPath: true,
  })
)
//add other middleware
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(morgan("dev"))

// installing geoscript-groovy - not sure why this is needed everytime..
const install_geoscript = exec(
  "export PATH=$(cd bin; pwd):$PATH",
  function (error, stdout, stderr) {
    if (error) {
      console.log(error.stack)
      console.log("Error code: " + error.code)
      console.log("Signal received: " + error.signal)
    }
    console.log("Child Process STDOUT: " + stdout)
    console.log("Child Process STDERR: " + stderr)
  }
)
install_geoscript.on("exit", function (code) {
  console.log("Child process exited with exit code " + code)
})

//Serve HTML when accessing path '/'
app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "public/index.html"))
})

// handling post request on '/upload-csv'
app.post("/upload-csv", async (req, res) => {
  try {
    // if no files are uploaded
    if (!req.files) {
      console.log("no files")
      res.send({
        status: false,
        message: "No file uploaded",
      })
    }
    // if files are uploaded
    else {
      console.log("files")

      // TODO MAKE CSV CHECK
      let csv = req.files.file

      //Use the mv() method to place the file in upload directory (i.e. "uploads")
      csv.mv("./uploads/" + csv.name)

      // removing old output files
      fs.readdir("output", (err, files) => {
        if (err) throw err

        for (const file of files) {
          fs.unlink(path.join("output", file), (err) => {
            if (err) throw err
          })
        }
      })

      // Running the groovy file
      run_groovy(csv.name)
        //when it's finished:
        .then((result) => {
          console.log("finished")
          console.log(result)

          let outputDir = fs.readdirSync(__dirname + "/output")

          //zipping
          const zip = new AdmZip()
          for (var i = 0; i < outputDir.length; i++) {
            zip.addLocalFile(__dirname + "/output/" + outputDir[i])
          }
          let zip_path =
            __dirname + "/output/" + csv.name.split(".")[0] + ".zip"
          zip.writeZip(zip_path)

          //initiate download (zip file)
          res.download(zip_path)
        })
        .catch((err) => console.log(err))
    }
  } catch (err) {
    res.status(500).send(err)
    console.log("err")
  }
})
//define port to listen on
const port = process.env.PORT || 3000

// let the server listen on selected port
app.listen(port, () => console.log(`App is listening on port ${port}.`))

// promise to run the groovy command async
const run_groovy = (filename) => {
  return new Promise((resolve, reject) => {
    exec(
      `geoscript-groovy hello.groovy ${filename}`,
      (error, stdout, stderr) => {
        if (error) {
          console.log(`error: ${error.message}`)
          reject(Error("It broke"))
        }
        console.log(`stdout: ${stdout}`)
        resolve("stuff worked")
      }
    )
  })
}

// to make this better

// -  create an unique folder... or check for unique filenames/id. this wil crash with simultanious requesets.
// -  if first entry of csv file contains a float type but is by coincidence a full number the schema will take the integer type.
