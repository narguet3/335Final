//All requires and imports
process.stdin.setEncoding("utf8");
const http = require('http');
const path = require("path");
const express = require("express");
let fs = require('fs');
let bodyParser = require("body-parser");
require("dotenv").config({ path: path.resolve(__dirname, '.env') });
let { MongoClient, ServerApiVersion } = require('mongodb');

//Setting up MongoDB
const userName = process.env.MONGO_DB_USERNAME;
const password = process.env.MONGO_DB_PASSWORD;
const databaseAndCollection = {db: "Poke_DB", collection:"pokemonTeam"};
const uri = `mongodb+srv://${userName}:${password}@cluster0.75svg.mongodb.net/CMSC335_DB?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

//Setting up app for post and get requests
let app = express();
app.set("views", path.resolve(__dirname, "Templates"));
app.set("view engine", "ejs");
const PORT = process.env.PORT || 5000;

//Setting up index page
app.get("/", (request, response) => {
    response.render("index");
  });

app.use(bodyParser.urlencoded({extended:false}));

app.post("/", function(request, response) {
  let {pokemon} =  request.body;

  (async () => {
    try {
      await client.connect();

      await client.db(databaseAndCollection.db).collection(databaseAndCollection.collection).insertOne({name: name, email: email, gpa: gpa, info: info});
      response.render("applicationConfirm", {name: name, email, gpa, info, homeLink: home});
    } 
    
    catch (error) {
      console.log("ERROR, ERROR: " + error);
    }

    finally {
      await client.close();
    }
  })();
});
  
let webServer = http.createServer(app).listen(PORT); 
