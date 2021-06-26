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
  let foundUser = await User.findOne({ username: name }, { password: 0 })
    .populate("recipes")
    .populate("favourites");

  let isFollowed = false;

  user.following.forEach((element) => {
    if (toString(element._id) == toString(foundUser._id)) {
      isFollowed = true;
    }
  });

  res.send({ user: foundUser, following: isFollowed });
});

router.post("/followUser/:userId", async (req, res) => {
  let myToken = req.headers.token;

  let user = await tokenValidation(res, myToken);

  if (!user) {
    return;
  }

  let followedUserId = req.params.userId;

  let alreadyFollowing = false;

  user.following.forEach((populatedElement) => {
    if (toString(populatedElement._id) == toString(followedUserId)) {
      alreadyFollowing = true;
    }
  });

  if (alreadyFollowing == false) {
    await User.findByIdAndUpdate(user._id, {
      $push: { following: followedUserId },
    }).then((foundUser) => {});
  } else if (alreadyFollowing == true) {
    await User.findByIdAndUpdate(user._id, {
      $pull: { following: followedUserId },
    }).then((foundUser) => {});
  }

  let followedUser = await User.findById(followedUserId).then((followed) => {
    return followed;
  });

  res.redirect(`/searchUser/${followedUser.username}`);
});

router.post("/favouriteRecipe/:recipeId", async (req, res) => {
  let myToken = req.headers.token;

  let user = await tokenValidation(res, myToken);

  if (!user) {
    return;
  }

  let favouriteId = req.params.recipeId;

  let alreadyFavourite = false;

  user.favourites.forEach((populatedElement) => {
    if (populatedElement._id == favouriteId) {
      alreadyFavourite = true;
    }
  });

  if (alreadyFavourite == false) {
    await User.findByIdAndUpdate(user._id, {
      $push: { favourites: favouriteId },
    }).then((recipe) => {});
  } else if (alreadyFavourite == true) {
    await User.findByIdAndUpdate(user._id, {
      $pull: { favourites: favouriteId },
    }).then((recipe) => {});
  }

  res.redirect(`/recipe/${favouriteId}`);
});

router.get("/recipe/:recipeId", async (req, res) => {
  let myToken = req.headers.token;

  let user = await tokenValidation(res, myToken);

  if (!user) {
    return;
  }

  let id = req.params.recipeId;

  let isFavourite = false;

  user.favourites.forEach((element) => {
    if (element._id == id) {
      isFavourite = true;
    }
  });

  let recipe = await Recipe.findById(id)
    .then((foundRecipe) => {
      return foundRecipe;
    })
    .catch((error) => {
      res.send(error);
    });

  res.send({ recipe: recipe, favourite: isFavourite });
});

router.post("/newRecipe", async (req, res) => {
  let myToken = req.headers.token;

  let user = await tokenValidation(res, myToken);

  if (!user) {
    return;
  }

  let recipeName = req.body.name;
  let recipeCountry = req.body.country;
  let recipeIngredients = req.body.ingredients;

  let recipe = await Recipe.create({
    name: recipeName,
    country: recipeCountry,
    ingredients: recipeIngredients,
    creator: user._id,
  })
    .then((newRecipe) => {
      return newRecipe;
    })
    .catch((error) => {
      res.send(error);
    });

  await User.findByIdAndUpdate(user._id, {
    $push: { recipes: recipe._id },
  }).then((updatedUser) => {});

  res.redirect(`/recipe/${recipe._id}`);
});

router.put("/updateRecipe/:recipeId", async (req, res) => {
  let myToken = req.headers.token;

  let user = await tokenValidation(res, myToken);

  if (!user) {
    return;
  }

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
  let myToken = req.headers.token;

  let user = await tokenValidation(res, myToken);

  if (!user) {
    return;
  }

  let id = req.params.recipeId;
  
  let recipe = await Recipe.findByIdAndDelete(id).then((deletedRecipe) => {
    return deletedRecipe;
  });

  await User.findByIdAndUpdate(user._id, {
    $pull: { recipes: recipe._id },
  }).then((updatedUser) => {});

  let users = await User.find().then((allUsers) => {
    return allUsers;
  });

  users.forEach(async (eachUser) => {
    let foundFavourite = eachUser.favourites.find((favourite) => {
      return toString(favourite) == toString(recipe._id);
    });
    if (foundFavourite != undefined) {
      await User.findByIdAndUpdate(eachUser._id, {
        $pull: { favourites: recipe._id },
      }).then((updatedUser) => {});
    }
  });

  res.send(recipe);
});

module.exports = router;
