//All requires and imports
process.stdin.setEncoding("utf8");
import http from 'http';
import path from 'path';
import express from 'express';
import bodyParser from 'body-parser';

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(__dirname, '.env') });

import { MongoClient, ServerApiVersion } from 'mongodb';
// Module for Pokemon API
import Pokedex from 'pokedex-promise-v2';
const P = new Pokedex();

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



//helper functions
//insert pokemon to MongoDB
async function insertPokemon(client, databaseAndCollection, newPokemon) {
  try{
      await client.connect();
      await client.db(databaseAndCollection.db).collection(databaseAndCollection.collection).insertOne(newPokemon);
  } catch (e) {
      console.error(e);
  } finally {
      await client.close();
  }
}
//get all pokemon from MongoDB
async function allPokemon(client, databaseAndCollection) {
  try{
      await client.connect();
      let filter = {};
      var cursor = await client.db(databaseAndCollection.db).collection(databaseAndCollection.collection).find(filter);
      const result = await cursor.toArray();
      return result;
  } catch (e) {
      console.error(e);
  } finally {
      await client.close();
  }
}
//clear team
async function deleteAll(client, databaseAndCollection){
  try{
      await client.connect();
      let filter = {};
      await client.db(databaseAndCollection.db).collection(databaseAndCollection.collection).deleteMany(filter);
  } catch (e) {
      console.error(e);
  } finally {
      await client.close();
  }
}




//Setting up index page
app.get("/", (request, response) => {
    response.render("index");
  });

app.use(bodyParser.urlencoded({extended:false}));

app.post("/", function(request, res) {
  let {pokemon} =  request.body;

  P.getPokemonByName(pokemon.trim().toLowerCase())
    .then((response) => {
    let output = "<h2>Pokemon Stats</h2><br>";
    output += "<table border=1>";
    output += `<tr><td>Name</td><td>${response.name}</td></tr>`;

    output += `<tr><td>Type(s)</td><td>`;
    response.types.forEach(element => {
      output += `${element.type.name}, `;
    });
    output = output.slice(0, -2);
    output += `</td></tr>`;

    output += `<tr><td>Moves</td><td>`;
    response.moves.forEach(element => {
      output += `${element.move.name}, `;
    });
    output = output.slice(0, -2);
    output += `</td></tr>`;

    output += `<tr><td>Abilities</td><td>`;
    response.abilities.forEach(element => {
      output += `${element.ability.name}, `;
    });
    output = output.slice(0, -2);
    output += `</td></tr>`;

    output += `<tr><td>Base Stats</td><td>`;
    response.stats.forEach(element => {
      output += `${element.stat.name}: ${element.base_stat}<br>`;
    });
    output += `</td></tr>`;

    output += "</table>";
    res.render("displayPokemon", {table: output});
  })
  .catch((error) => {
    console.log("Pokemon not found");
  });
  
});

app.get("/team", (request, response) => {
  response.render("team");
});


//add pokemon to team
app.post("/team", async function (request, response) {
  //making pokemon object to add to MongoDB
  let {pokemon} =  request.body;
  let typeOutput = "";

  let pokemonObject = {
    name: "",
    type: "",
  }

  //get pokemon from api and add to object
  P.getPokemonByName(pokemon.trim().toLowerCase())
    .then((response) => {
    pokemonObject.name = response.name; 

    response.types.forEach(element => {
      typeOutput += `${element.type.name}, `;
    });
    
    typeOutput = typeOutput.slice(0, -2);

    pokemonObject.type = typeOutput;

  })
  .catch((error) => {
    console.log("idk bruhh");
  });


  //Add pokemon to Mongo database 
  insertPokemon(client, databaseAndCollection, pokemonObject);
  response.render("processPokemon");

});

//displays table with the team
app.get ("/displayTeam" , async function (request, response) {
  //create team table
  let allTheMfs = await allPokemon(client, databaseAndCollection);
  let table = "<table border = '1'> <tr> <th> Name </th> <th> Type </th> <tr>";

  allTheMfs.forEach (poke => table += "<tr> <td>" + poke.name + "</td> <td>" + poke.type + "</td> </tr>");
  table += "</table>";

  response.render("displayTeam", {table: table});
});

//clear pokemon team
app.post ("/processRemove" , async function (request, response) {

  deleteAll(client, databaseAndCollection);

  response.render("processRemove");
});

  
let webServer = http.createServer(app).listen(PORT); 
