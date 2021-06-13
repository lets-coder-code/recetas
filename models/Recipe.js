const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const recipeSchema = new Schema(
  {
    name: String,
    country: String,
    ingredients: Array,
  },
  {
    timestamps: {
      createdAt: "created at",
      updatedAt: "updated at",
    },
  }
);

const Recipe = mongoose.model("Recipe", recipeSchema);
module.exports = Recipe;
