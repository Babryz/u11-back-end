const graphql = require("graphql");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const {
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLBoolean,
  GraphQLList,
  GraphQLSchema,
  GraphQLNonNull,
} = graphql;

const UserType = new GraphQLObjectType({
  name: "User",
  fields: () => ({
    id: { type: GraphQLID },
    username: { type: GraphQLString },
    email: { type: GraphQLString },
    admin: { type: GraphQLBoolean },
    accessToken: { type: GraphQLString },
  }),
});

const AccessType = new GraphQLObjectType({
  name: "Access",
  fields: () => ({
    accessToken: { type: GraphQLString },
  }),
});

const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: () => ({
    users: {
      type: new GraphQLList(UserType),
      resolve() {
        return User.find({});
      },
    },
    user: {
      type: UserType,
      resolve(parent, args) {},
    },
  }),
});

const Mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    signUp: {
      type: UserType,
      args: {
        username: { type: new GraphQLNonNull(GraphQLString) },
        email: { type: new GraphQLNonNull(GraphQLString) },
        password: { type: new GraphQLNonNull(GraphQLString) },
      },
      async resolve(parent, args) {
        const { email, username, password } = args;
        const existentUser = await User.findOne({ email });
        try {
          if (!existentUser) {
            const hashedPassword = await bcrypt.hash(password, 10);

            let user = new User({
              username: username,
              email: email,
              password: hashedPassword,
              admin: false,
            });

            return await user.save();
          } else {
            return null;
          }
        } catch (error) {
          return { error: error };
        }
      },
    },
    login: {
      type: AccessType,
      args: {
        email: { type: new GraphQLNonNull(GraphQLString) },
        password: { type: new GraphQLNonNull(GraphQLString) },
      },
      async resolve(parent, args, { res }) {
        const { email, password } = args;
        const existentuser = await User.findOne({ email });
        try {
          if (existentuser) {
            if (await bcrypt.compare(password, existentuser.password)) {
              const user = {
                id: existentuser._id,
              };
              const SECRET = process.env.ACCESS_TOKEN_SECRET;
              const accessToken = jwt.sign({ user }, SECRET, {
                expiresIn: "7d",
              });
              user.accessToken = accessToken;

              return user;
            }
          }
        } catch (error) {}
      },
    },
  },
});

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation,
});
