const express = require("express");
const router = express.Router();

const Receta = require("../modelos/receta");

router.get("/recetas", async (req, res) => {
  let recetas = await Receta.find().then((recetasEncontradas) => {
    return recetasEncontradas;
  });
  res.send(recetas);
});

router.get("/receta/:idReceta", async (req, res) => {
  let id = req.params.idReceta;
  let receta = await Receta.findById(id)
    .then((recetaEncontrada) => {
      return recetaEncontrada;
    })
    .catch((error) => {
      res.send(error);
    });
  res.send(receta);
});

router.post("/nuevaReceta", async (req, res) => {
  let nombreReceta = req.body.nombre;
  let cocinaReceta = req.body.cocina;
  let ingredientesReceta = req.body.ingredientes;
  let receta = await Receta.create({
    nombre: nombreReceta,
    cocina: cocinaReceta,
    ingredientes: ingredientesReceta,
  })
    .then((nuevaReceta) => {
      return nuevaReceta;
    })
    .catch((error) => {
      res.send(error);
    });
  let id = receta._id;
  res.redirect(`/receta/${id}`);
});

router.put("/actualizarReceta/:idReceta", async (req, res) => {
  let id = req.params.idReceta;
  let nombreReceta = req.body.nombre;
  let cocinaReceta = req.body.cocina;
  let ingredientesReceta = req.body.ingredientes;
  await Receta.findByIdAndUpdate(id, {
    nombre: nombreReceta,
    cocina: cocinaReceta,
    ingredientes: ingredientesReceta,
  })
    .then(() => {})
    .catch((error) => {
      res.send(error);
    });
  res.redirect(`/receta/${id}`);
});

router.delete("/borrarReceta/:idReceta", async (req, res) => {
  let id = req.params.idReceta;
  let receta = await Receta.findByIdAndDelete(id).then((recetaEliminada) => {
    return recetaEliminada;
  });
  res.send(receta);
});

module.exports = router;
