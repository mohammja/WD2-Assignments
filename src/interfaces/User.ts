// TODO: user interface
import {Document, Types} from 'mongoose';

interface User extends Document {
  user_name: string;
  email: string;
  role: 'Admin' | 'User';
  password: string;
}

type UserOutput = {
  _id: Types.ObjectId;
  user_name: string;
  email: string;
};

type LoginUser = {
  user_name: string;
  password: string;
};

interface TokenUser {
  _id: string;
  role: 'Admin' | 'User';
}

type UserTest = Partial<User>;

export {User, UserOutput, TokenUser, LoginUser, UserTest};
