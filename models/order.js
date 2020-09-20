const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderSchema = new Schema({
  items: Array,
  date: String,
  userId: String,
});

module.exports = mongoose.model("Order", orderSchema);
