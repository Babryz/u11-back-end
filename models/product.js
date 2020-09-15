const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productSchema = new Schema({
  name: String,
  type: String,
  price: Number,
  img: String,
});

module.exports = mongoose.model("Product", productSchema);
