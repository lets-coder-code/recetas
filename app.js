require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");

const Receta = require("./modelos/receta");

const app = express();

const port = 3000;

mongoose
  .connect(
    `mongodb+srv://${process.env.USUARIO_BD}:${process.env.PASSWORD_BD}@cluster-recetas.x6xvy.mongodb.net/recetas_BD?retryWrites=true&w=majority`,
    { useNewUrlParser: true }
  )
  .then(() => {
    console.log("Estamos conectados a la base de datos.");
  })
  .catch((error) => {
    console.log(error);
  });

app.use(express.json());

app.get("/recetas", async (req, res) => {
  let recetas = await Receta.find().then((recetasEncontradas) => {
    return recetasEncontradas;
  });
  res.send(recetas);
});

app.post("/nuevaReceta", async (req, res) => {
  let nombreReceta = req.body.nombre;
  let cocinaReceta = req.body.cocina;
  let ingredientesReceta = req.body.ingredientes;
  let nuevaReceta = await Receta.create({
    nombre: nombreReceta,
    cocina: cocinaReceta,
    ingredientes: ingredientesReceta
  }).then((recetaCreada) => {
    return recetaCreada;
  }).catch((error) => {
    res.send(`Ha ocurrido el siguiente error: ${error}`);
  })
  res.send(nuevaReceta);
})

app.listen(port, () => {
  console.log(`Servidor a la escucha en el puerto ${port}.`);
});
