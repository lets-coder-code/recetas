const express = require("express");
const router = express.Router();

const Recipe = require("../models/recipe");

router.get("/recipes", async (req, res) => {
  let recipes = await Recipe.find().then((foundedRecipes) => {
    return foundedRecipes;
  });
  res.send(recipes);
});

router.get("/recipe/:recipeId", async (req, res) => {
  let id = req.params.recipeId;
  let recipe = await Recipe.findById(id)
    .then((foundedRecipe) => {
      return foundedRecipe;
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
  await Recipe
  .findByIdAndUpdate(id, {
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
