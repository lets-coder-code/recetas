require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");

const app = express();

const recetas = require("./rutas/recetas");

mongoose
  .connect(
    `mongodb+srv://${process.env.USUARIO_BD}:${process.env.PASSWORD_BD}@${process.env.NOMBRE_CLUSTER}.x6xvy.mongodb.net/${process.env.NOMBRE_BD}?retryWrites=true&w=majority`,
    { useNewUrlParser: true }
  )
  .then(() => {
    console.log("Estamos conectados a la base de datos.");
  })
  .catch((error) => {
    console.log(error);
  });

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/", recetas);

app.listen(process.env.PORT, () => {
  console.log(`Servidor a la escucha en el puerto ${process.env.PORT}.`);
});
