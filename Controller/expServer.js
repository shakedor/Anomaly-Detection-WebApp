const express = require('express')
const fileUpload = require('express-fileupload')
const model = require('../Model/DetectAnomalies')
const view = require('../View/displayAnomalies')

const path = require('path')
const { json } = require('express')
const { write } = require('fs')

const app = express()
app.use(express.urlencoded({
    extended: false
}))
app.use(fileUpload())


// when opening webbrowser with localhost:8080 it will open the view of the app with the form.
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, '../View', 'index.html'));

})

app.get("/result", (req, res) => {
    res.sendFile(path.join(__dirname, '../View', 'resultView.html'));
})


// when sending a POST with /detect it will get the result from the model and send it back to the view.
app.post("/detect_html", (req, res) => {

    var error = 0;
    let algorithm = req.body.algorithm
    if(req.files) {
        // get the files from the request
        let learn_file = req.files.learn_file
        if(!learn_file){
            error = "No learn file. Please try again."
        }else {
            let detect_file = req.files.detect_file
            if(!detect_file){
                error = "No detect file. Please try again."
            }
            else{
                //res.write("<p id=\"detecting\">Please wait while detecting</p>");
                view.popup(res,"We recieved your request. The results will be displayed bellow.","green");
                // send the model the pathes to the files
                let result = model.detect(algorithm, learn_file.data.toString() , detect_file.data.toString())
                //var jsonString = JSON.stringify(result,null);
                view.display(res, result);
            }
        } 
    }
    else{
        error = "No files. Please try again."
    }
    if(error != 0){
        view.popup(res,error,"red");
    }
    res.end()
})

// when sending a POST with /detect it will get the result from the model and send it back to the view.
app.post("/detect", (req, res) => {

    let algorithm = req.query["algorithm"];
    if(!algorithm){
        res.status(422).send(`detecting algorithm was not specified. please send the file with key "algorithm".`);
    }
    else if(req.files) {

        if(!req.files.learn_file || ! req.files.detect_file){
            if(!req.files.learn_file){
                res.status(422).send(`learn file was not specified. please send the file with key "learn_file".`);
            }
            else if( ! req.files.detect_file){
                res.status(422).send(`detect file was not specified. please send the file with key "detect_file".`);
            }
        }
        else{
            // get the files from the request
            let learn_file = req.files.learn_file.data.toString("utf8");
            let detect_file = req.files.detect_file.data.toString("utf8");
            // send the model the pathes to the files
            let result = model.detect(algorithm, learn_file , detect_file)
            res.write(result);
        }
    }
    else{
        res.status(422).send(`no files found. please send the files with key "learn_file" and key "detect_file".`);

    }

    res.end()
})
app.listen(8080, ()=>console.log("server started on port 8080"))