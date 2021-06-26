require("dotenv").config();


const express = require("express");


const app = express();


const authentication = require("./routes/authentication");
const user = require("./routes/user");


require("./configs/dbConfig");


app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/", authentication);
app.use("/", user);


app.listen(process.env.PORT, () => {
  console.log(`Server listening on port ${process.env.PORT}.`);
});
