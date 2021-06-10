require("dotenv").config();

const mongoose = require("mongoose");

const Receta = require("./modelos/receta");

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

let recetas = [
  {
    nombre: "pizza barbacoa",
    cocina: "americana",
    ingredientes: ["harina", "carne", "salsa barbacoa", "queso"],
  },
  {
    nombre: "rissoto",
    cocina: "italiana",
    ingredientes: ["arroz", "setas", "queso"],
  },
  {
    nombre: "paella",
    cocina: "española",
    ingredientes: ["arroz", "marisco", "vegetales"],
  },
];

Receta.deleteMany()
  .then(() => {
    console.log(`Recetas antiguas eliminadas.`)
    return Receta.create(recetas);
  })
  .then((recetasCreadas) => {
    console.log(
      `${recetasCreadas.length} recetas creadas con los siguientes nombres:`
    );
    recetasCreadas.forEach((receta) => {
      console.log(receta.nombre);
    });
  })
  .then(() => {
    mongoose.disconnect();
    console.log("Nos hemos desconectado de la base de datos.");
  })
  .catch((error) => {
    console.log("Ha ocurrido el siguiente error:");
    console.log(error);
  });
