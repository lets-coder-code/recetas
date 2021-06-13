const mongoose = require("mongoose");

const bcrypt = require("bcrypt");

const User = require("../models/User");
const Recipe = require("../models/Recipe");


require("../configs/dbConfig");


const salt = bcrypt.genSaltSync(10);


let recipes = [
  {
    _id: "60c5fbdc8c3b2720a2e13640",
    name: "pizza",
    country: "Italy",
    ingredients: ["cheese", "tomato", "flour"],
  },
  {
    _id: "60c5fbdc8c3b2720a2e13641",
    name: "rissoto",
    country: "Italy",
    ingredients: ["rice", "butter", "cheese"],
  },
  {
    _id: "60c5fbdc8c3b2720a2e13642",
    name: "cuban rice",
    country: "Cuba",
    ingredients: ["rice", "tomato", "egg"],
  },
  {
    _id: "60c5fbdc8c3b2720a2e13643",
    name: "french fries",
    country: "France",
    ingredients: ["potato", "oil", "salt"],
  },
];

let users = [
  {
    username: "Luis",
    password: "12345678",
    recipes: [],
  },
  {
    username: "Mario",
    password: "12345677",
    recipes: [],
  },
  {
    username: "Juan",
    password: "12345676",
    recipes: [],
  },
];

users.forEach((user) => {
  let hashPass = bcrypt.hashSync(user.password, salt);
  user.password = hashPass;
})

recipes.forEach((recipe) => {
  let recipeId = recipe._id;
  let max = users.length - 1;
  let userIndex = Math.floor(Math.random() * max);
  users[userIndex].recipes.push(recipeId);
})

Recipe.deleteMany()
  .then(() => {
    console.log(`Recipes deleted.`);
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
    User.deleteMany()
      .then(() => {
        console.log(`Users deleted.`);
        return User.create(users);
      })
      .then((createdUsers) => {
        console.log(
          `${createdUsers.length} users have been created with the following names:`
        );
        createdUsers.forEach((user) => {
          console.log(user.username);
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
  })
  .catch((error) => {
    console.log("There is an error:");
    console.log(error);
  });
