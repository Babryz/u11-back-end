const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const { graphqlHTTP } = require("express-graphql");
const cors = require("cors");
const schema = require("./schema/schema");

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_TOKEN, {
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
