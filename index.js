require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(bodyParser.urlencoded({extended:true}));
app.use(cors());

try {
    mongoose.connect(`mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.fl6wx.mongodb.net/quiz?retryWrites=true&w=majority`);
    console.log("Connected to mongoDB")
} catch (error) {
    console.log("MongoDB connection error")
    handleError(error);
}

const celebritySchema = {
    name: {type: String, required: "Name required"},
    occupaton: String,
    catchPhrase: String
}
const CELEBRITY = mongoose.model("celebrity", celebritySchema);

app.route("/celebrities")
.get(async function(req, res){
    CELEBRITY.find((err, foundArray)=>{
        if(foundArray){
            res.status(200).send(foundArray);
        }else{
            res.status(500).send({errorMessage: "The celebrities information could not be retrieved."})
        }
    })
})
.post(async function(req, res){
    const newCelebrity = new CELEBRITY({
        name: req.body.name,
        occupaton: req.body.occupaton,
        catchPhrase: req.body.catchPhrase
    });
    newCelebrity.save(err=>{
        if(!err){
            res.status(201).send(newCelebrity);
        }else{
            res.status(400).send({errorMessage: "Please provide name for the celebrity." });
        }
    })
});


app.route("/celebrities/:id")
.get(async function(req, res){
    if(!mongoose.isValidObjectId(req.params.id)){
        return res.status(404).send({ message: "The celebrity with the specified ID does not exist." })
    }
    CELEBRITY.findOne({_id: req.params.id}, (err, foundCelebrity)=>{
        if(foundCelebrity){
            res.status(200).send(foundCelebrity);
        }else{
            res.status(500).send({errorMessage: "The celebrity information could not be retrieved."})
        }
    })
})
.put(async function(req, res){
    if(!mongoose.isValidObjectId(req.params.id)){
        return res.status(404).send({ message: "The celebrity with the specified ID does not exist." })
    }
    CELEBRITY.findByIdAndUpdate({_id: req.params.id}, {
        name: req.body.name,
        occupaton: req.body.occupaton,
        catchPhrase: req.body.catchPhrase
    }, {overwrite:true, new:true}, (err, foundCelebrity)=>{
        if(!err){
            res.status(200).send(foundCelebrity);
        }else{
            res.status(500).send({errorMessage: "The celebrity information could not be modified."})
        }
    })
});


app.route("/celebrities/:id/delete")
.delete(async function(req, res){
    if(!mongoose.isValidObjectId(req.params.id)){
        return res.status(404).send({ message: "The celebrity with the specified ID does not exist." })
    }
    CELEBRITY.deleteOne({_id: req.params.id}, err=>{
        if(!err){
            res.send("Successfully DELETED "+req.params.id);
        }else{
            res.status(500).send({ errorMessage: " The celebrity could not be removed" })
        }
    })
})

app.listen(3000, ()=>console.log("Server is online on port:3000"))