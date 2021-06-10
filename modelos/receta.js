const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const esquemaReceta = new Schema(
  {
    nombre: String,
    cocina: String,
    ingredientes: Array,
  },
  {
    timestamps: {
      createdAt: "creado",
      updatedAt: "actualizado",
    },
  }
);

const Receta = mongoose.model("Receta", esquemaReceta);
module.exports = Receta;
