const express = require("express");
const router = express.Router();

const Recipe = require("../models/Recipe");
const User = require("../models/User");

const tokenValidation = require("../functions/tokenValidation");
const verifyOwner = require("../functions/verifyOwner");

const bcrypt = require("bcrypt");

const salt = bcrypt.genSaltSync(10);

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
    if (element._id.toString() == foundUser._id.toString()) {
      isFollowed = true;
    }
  });

  res.send({ user: foundUser, following: isFollowed });
});

router.put("/followUser/:userId", async (req, res) => {
  let myToken = req.headers.token;

  let user = await tokenValidation(res, myToken);

  if (!user) {
    return;
  }

  let followedUserId = req.params.userId;

  let alreadyFollowing = false;

  user.following.forEach((populatedElement) => {
    if (populatedElement._id == followedUserId) {
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

router.put("/favouriteRecipe/:recipeId", async (req, res) => {
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

  let userId = user._id;

  let recipeId = req.params.recipeId;

  let isRecipeOwner = await verifyOwner(userId, recipeId);

  if (isRecipeOwner == false) {
    res.send({
      message: "You are not allowed to update this recipe.",
    });
    return;
  }

  let recipeName = req.body.name;
  let recipeCountry = req.body.country;
  let recipeIngredients = req.body.ingredients;

  await Recipe.findByIdAndUpdate(recipeId, {
    name: recipeName,
    country: recipeCountry,
    ingredients: recipeIngredients,
  })
    .then((updatedRecipe) => {})
    .catch((error) => {
      res.send(error);
    });

  res.redirect(`/recipe/${recipeId}`);
});

router.delete("/deleteRecipe/:recipeId", async (req, res) => {
  let myToken = req.headers.token;

  let user = await tokenValidation(res, myToken);

  if (!user) {
    return;
  }

  let userId = user._id;

  let recipeId = req.params.recipeId;

  let isRecipeOwner = await verifyOwner(userId, recipeId);

  if (isRecipeOwner == false) {
    res.send({
      message: "You are not allowed to update this recipe.",
    });
    return;
  }

  let recipe = await Recipe.findByIdAndDelete(recipeId).then(
    (deletedRecipe) => {
      return deletedRecipe;
    }
  );

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

router.put("/updateUser", async (req, res) => {
  let myToken = req.headers.token;

  let user = await tokenValidation(res, myToken);

  if (!user) {
    return;
  }

  let passwordLength = 8;

  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    res.send({
      update: false,
      message: "Provide username and password.",
    });
    return;
  }

  if (password.length < passwordLength) {
    res.send({
      update: false,
      message: "You have to provide a password with, at least, ten characters.",
    });
    return;
  }

  let users = await User.find().then((allUsers) => {
    return allUsers;
  });
  users.forEach(async (eachUser) => {
    if (eachUser._id != user._id) {
      let foundUser = await User.findOne({ username: username }).then(
        (repeatedUser) => {
          return repeatedUser;
        }
      );
      if (foundUser != null) {
        res.send({
          auth: false,
          token: null,
          message: "User name is already taken.",
        });
        return;
      }
    }
  });

  const hashPass = bcrypt.hashSync(password, salt);

  await User.findByIdAndUpdate(user._id, {
    username: username,
    password: hashPass,
    recipes: user.recipes,
    favourites: user.favourites,
    following: user.following,
  })
    .then((createdUser) => {})
    .catch((error) => {
      res.send({
        auth: false,
        token: null,
        message: `We have the following error: ${error}`,
      });
      return;
    });

  res.redirect("/user");
});

router.delete("/deleteUser", async (req, res) => {
  let myToken = req.headers.token;

  let user = await tokenValidation(res, myToken);

  if (!user) {
    return;
  }

  let userId = user._id;

  let deletedUser = await User.findByIdAndDelete(userId).then(
    (alreadyDeleted) => {
      return alreadyDeleted;
    }
  );

  let users = await User.find().then((allUsers) => {
    return allUsers;
  });

  users.forEach((eachUser) => {
    let followingArr = eachUser.following;
    followingArr.forEach((followedUserId) => {
      if (userId.toString() == followedUserId.toString()) {
        User.findByIdAndUpdate(eachUser._id, {
          $pull: { following: userId },
        }).then((updatedUser) => {});
      } else {
      }
    });
  });

  deletedUser.recipes.forEach(async (recipeId) => {
    let recipe = await Recipe.findByIdAndDelete(recipeId).then(
      (deletedRecipe) => {
        return deletedRecipe;
      }
    );

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
  });

  res.send({
    auth: false,
    token: null,
    message: "User has been deleted successfully.",
  });
});

module.exports = router;
