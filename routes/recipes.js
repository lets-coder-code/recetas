const express = require("express");
const router = express.Router();

const Recipe = require("../models/Recipe");
const User = require("../models/User");

const tokenValidation = require("../functions/tokenValidation");

router.get("/user", async (req, res) => {
  let myToken = req.headers.token;

  let user = await tokenValidation(res, myToken);

  if (!user) {
    return;
  }

  res.send(user);
});

router.get("/searchUser/:username", async (req, res) => {
  let myToken = req.headers.token;

  let user = await tokenValidation(res, myToken);

  if (!user) {
    return;
  }

  let name = req.params.username;
  let foundUser = await User.find({ username: name }, { password: 0 }).populate("recipes");

  res.send(foundUser);
});

router.get("/recipe/:recipeId", async (req, res) => {
  let id = req.params.recipeId;
  let recipe = await Recipe.findById(id)
    .then((foundRecipe) => {
      return foundRecipe;
    })
    .catch((error) => {
      res.send(error);
    });
  res.send(recipe);
});

router.post("/newRecipe", async (req, res) => {
  let recipeName = req.body.name;
  let recipeCountry = req.body.country;
  let recipeIngredients = req.body.ingredients;
  let recipe = await Recipe.create({
    name: recipeName,
    country: recipeCountry,
    ingredients: recipeIngredients,
  })
    .then((newRecipe) => {
      return newRecipe;
    })
    .catch((error) => {
      res.send(error);
    });
  let id = recipe._id;
  res.redirect(`/recipe/${id}`);
});

router.put("/updateRecipe/:recipeId", async (req, res) => {
  let id = req.params.recipeId;
  let recipeName = req.body.name;
  let recipeCountry = req.body.country;
  let recipeIngredients = req.body.ingredients;
  await Recipe.findByIdAndUpdate(id, {
    name: recipeName,
    country: recipeCountry,
    ingredients: recipeIngredients,
  })
    .then(() => {})
    .catch((error) => {
      res.send(error);
    });
  res.redirect(`/recipe/${id}`);
});

router.delete("/deleteRecipe/:recipeId", async (req, res) => {
  let id = req.params.recipeId;
  let recipe = await Recipe.findByIdAndDelete(id).then((deletedRecipe) => {
    return deletedRecipe;
  });
  res.send(recipe);
});

module.exports = router;
