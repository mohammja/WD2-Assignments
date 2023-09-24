// TODO: Add resolvers for user
// 1. Queries
// 1.1. users
// 1.2. userById
// 2. Mutations
// 2.1. createUser
// 2.2. updateUser
// 2.3. deleteUser

import {User} from '../../interfaces/User';
import userModel from '../models/userModel';

export default {
  Query: {
    async users(_: undefined, args: User) {
      return await userModel.find();
    },
    async userById(_: undefined, args: User) {
      console.log(args.id);
      return await userModel.findById(args.id);
    },
  },

  Mutation: {
    async createUser(_: undefined, args: User) {
      const newUser = new userModel({
        user_name: args.user_name,
        email: args.email,
      });
      await newUser.save();
      return newUser;
    },
    async updateUser(_: undefined, args: User) {
      return await userModel.findByIdAndUpdate(args.id, args, {
        new: true,
      });
    },
    // args should be the id of the user to delete
    async deleteUser(_: undefined, args: {id: String}) {
      return await userModel.findByIdAndDelete(args.id);
    },
  },
};
