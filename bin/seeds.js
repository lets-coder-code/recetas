const mongoose = require("mongoose");

const Recipe = require("../models/recipe");

require("../configs/dbConfig");

let recipes = [
  {
    name: "pizza",
    country: "Italy",
    ingredients: ["cheese", "tomato", "flour"],
  },
  {
    name: "rissoto",
    country: "Italy",
    ingredients: ["rice", "butter", "cheese"],
  },
  {
    name: "paella",
    country: "Spain",
    ingredients: ["rice", "meat", "vegetables", "olive oil"],
  },
];

Recipe.deleteMany()
  .then(() => {
    console.log(`Recipes deleted.`)
    return Recipe.create(recipes);
  })
  .then((createdRecipes) => {
    console.log(
      `${createdRecipes.length} recipes have been created with the following names:`
    );
    createdRecipes.forEach((recipe) => {
      console.log(recipe.name);
    });
  })
  .then(() => {
    mongoose.disconnect();
    console.log("We are disconnected from our database.");
  })
  .catch((error) => {
    console.log("There is an error:");
    console.log(error);
  });
