const graphql = require("graphql");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const Product = require("../models/product");

const {
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLBoolean,
  GraphQLList,
  GraphQLSchema,
  GraphQLNonNull,
  GraphQLFloat,
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

const ProductType = new GraphQLObjectType({
  name: "Product",
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    type: { type: GraphQLString },
    price: { type: GraphQLFloat },
    img: { type: GraphQLString },
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
      args: {
        accessToken: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve(parent, args) {
        let user = {};
        jwt.verify(
          args.accessToken,
          process.env.ACCESS_TOKEN_SECRET,
          (err, authData) => {
            user = User.findById(authData.user.id);
          }
        );
        return user;
      },
    },
    products: {
      type: new GraphQLList(ProductType),
      resolve() {
        return Product.find({});
      },
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
    addProduct: {
      type: ProductType,
      args: {
        name: { type: new GraphQLNonNull(GraphQLString) },
        type: { type: new GraphQLNonNull(GraphQLString) },
        price: { type: new GraphQLNonNull(GraphQLFloat) },
        img: { type: new GraphQLNonNull(GraphQLString) },
      },
      async resolve(parent, args) {
        const { name, type, price, img } = args;
        const existentProduct = await Product.findOne({ name });
        try {
          if (!existentProduct) {
            let product = new Product({
              name,
              type,
              price,
              img,
            });

            return await product.save();
          } else {
            return null;
          }
        } catch (error) {
          return { error: error };
        }
      },
    },
  },
});

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation,
});
