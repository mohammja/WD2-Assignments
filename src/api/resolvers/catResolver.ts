// TODO: Add resolvers for cat
// 1. Queries
// 1.1. cats
// 1.2. catById
// 1.3. catsByOwner
// 1.4. catsByArea
// 2. Mutations
// 2.1. createCat
// 2.2. updateCat
// 2.3. deleteCat

import {Cat} from '../../interfaces/Cat';
import {User} from '../../interfaces/User';
import catModel from '../models/catModel';
import userModel from '../models/userModel';

export default {
  Query: {
    async cats() {
      return await catModel.find();
    },
    async catById(_: undefined, args: Cat) {
      console.log(args.id);
      const cat = await catModel.findById(args.id).populate('owner');
      if (!cat) {
        throw new Error('Cat not found');
      }
      const owner = await userModel.findById(cat.owner);
      console.log(cat);
      cat.owner = owner as User;

      return cat;
    },
    async catsByOwner(_: undefined, args: Cat) {
      return await catModel.find({owner: args.owner});
    },
    async catsByArea(_: undefined, args: {area: string}) {
      return await catModel.find({area: args.area});
    },
  },

  Mutation: {
    async createCat(_: undefined, args: Cat) {
      console.log(args);
      //Get owner
      const owner = await userModel.findById(args.owner);
      const newCat = new catModel(args);
      if (!owner) {
        throw new Error('Owner not found');
      }
      newCat.owner = owner as User;
      await newCat.save();
      console.log(newCat);
      return newCat;
    },
    async updateCat(_: undefined, args: Cat) {
      return await catModel.findByIdAndUpdate(
        args.id,
        {...args},
        {
          new: true,
        }
      );
    },
    async deleteCat(_: undefined, args: Cat) {
      return await catModel.findByIdAndDelete(args.id);
    },
  },
};
