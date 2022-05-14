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

    output += `<img src="${response.sprites.front_default}" alt="pokemon_front" height=200></img>`;
    output += `<img src="${response.sprites.back_default}" alt="pokemon_back" height=200></img>`;

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

app.post("/team", (request, response) => {
  let {pokemon} =  request.body;

  // Add pokemon to Mongo database 
  // Display the user's team
});
  
let webServer = http.createServer(app).listen(PORT); 
