const express = require("express");
const mongoose = require("mongoose");
const { graphqlHTTP } = require("express-graphql");
const cors = require("cors");
const schema = require("./schema/schema");

const app = express();

app.use(cors());

const MongoDB =
  "mongodb+srv://BabryzDev:1dJEwPdI0IxiLcT7@privatecluster-dfosw.mongodb.net/u11-db?retryWrites=true&w=majority";

mongoose.connect(MongoDB, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
mongoose.connection.once("open", () => {
  console.log("MongoDB connected and ready to fire!");
});

app.use(
  "/graphql",
  graphqlHTTP({
    schema,
    graphiql: true,
  })
);

app.listen(4000, () => {
  console.log("Server up and running");
});
