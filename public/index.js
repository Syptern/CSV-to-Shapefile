//post data to server
let res = {}

const postData = async (url, data) => {
  // Default options are marked with *
  const response = await fetch(url, {
    method: "POST", // *GET, POST, PUT, DELETE, etc.
    mode: "cors", // no-cors, *cors, same-origin
    cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
    redirect: "follow", // manual, *follow, error
    referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    body: data, // body data type must match "Content-Type" header
  })
  res = response
  console.log("res", res)
  return response // parses JSON response into native JavaScript objects
}

const onFormSubmit = (e) => {
  const selectedFile = document.getElementById("fileInput").files[0]
  const formData = new FormData()
  formData.append("file", selectedFile)
  postData("http://localhost:3000/upload-csv", formData).then((data) => {
    console.log("test")
    console.log(formData)
  })
  e.preventDevault
}
