require("dotenv").config();

const express = require("express");

const app = express();

const recipes = require("./routes/recipes");


require("./configs/dbConfig");


app.use(express.json());

app.use(express.urlencoded({ extended: false }));

app.use("/", recipes);


app.listen(process.env.PORT, () => {
  console.log(`Server listening on port ${process.env.PORT}.`);
});
