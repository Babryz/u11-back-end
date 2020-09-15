const graphql = require("graphql");
const User = require("../models/user");

const {
  GraphQLObject,
  GraphQLID,
  GraphQLString,
  GraphQLList,
  GraphQLSchema,
} = graphql;

const UserType = new GraphQLObject({
  name: "User",
  fields: () => ({
    id: { type: GraphQLID },
    username: { type: GraphQLString },
    email: { type: GraphQLString },
    password: { type: GraphQLString },
  }),
});

const RootQuery = new GraphQLObject({
  name: "RootQueryType",
  fields: () => ({
    users: {
      type: new GraphQLList(UserType),
      resolve(parent, args) {
        return User.find({});
      },
    },
  }),
});

module.exports = new GraphQLSchema({
  query: RootQuery,
});
