// TODO: create the following functions:
// - userGet - get user by id
// - userListGet - get all users
// - userPost - create new user. Remember to hash password
// - userPutCurrent - update current user
// - userDeleteCurrent - delete current user
// - checkToken - check if current user token is valid: return data from req.user. No need for database query

import {Request, Response, NextFunction} from 'express';
import CustomError from '../../classes/CustomError';
import {User, UserOutput} from '../../interfaces/User';
import DBMessageResponse from '../../interfaces/DBMessageResponse';
import UserModel from '../models/userModel';
import bcrypt from 'bcrypt';
import {validationResult} from 'express-validator';

const userGet = async (
  req: Request<{id: string}, {}, {}>,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await UserModel.findById(req.params.id).select(
      '-password -role -__v'
    );
    if (!user) {
      throw new CustomError('User not found', 404);
    }
    res.json(user);
  } catch (err) {
    next(err);
  }
};

const userListGet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await UserModel.find().select('-password -role -__v');
    res.json(users);
  } catch (err) {
    next(err);
  }
};

const userPost = async (
  req: Request<{}, {}, User>,
  res: Response,
  next: NextFunction
) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const messages = errors
        .array()
        .map((error) => `${error.msg}: ${error.param}`)
        .join(', ');
      next(new CustomError(messages, 400));
      return;
    }
    const user = req.body;
    user.password = await bcrypt.hash(user.password, 12);
    if (!user.role) {
      user.role = 'User';
    }

    const newUser = await UserModel.create(user);

    const response: DBMessageResponse = {
      message: 'User created',
      data: {
        _id: newUser._id,
        user_name: newUser.user_name,
        email: newUser.email,
      },
    };
    res.json(response);
  } catch (err) {
    next(new CustomError('User creation failed', 500));
  }
};
const userPutCurrent = async (
  req: Request<{id: string}, {}, User>,
  res: Response,
  next: NextFunction
) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const message = errors
        .array()
        .map((error) => `${error.msg}: ${error.param}`)
        .join(', ');
      throw new CustomError(message, 400);
    }
    const id = (req.user as User)._id;
    const user = await UserModel.findByIdAndUpdate(id, req.body, {
      new: true,
    }).select('-password -role');
    if (!user) {
      next(new CustomError('User not found', 404));
      return;
    }
    const response: DBMessageResponse = {
      message: 'User updated',
      data: user,
    };
    res.json(response);
  } catch (error) {
    next(new CustomError((error as Error).message, 500));
  }
};

const userDeleteCurrent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = (req.user as User)._id;
    const user = await UserModel.findByIdAndDelete(id).select(
      '-role -password -__v'
    );
    if (!user) {
      next(new CustomError('User not found', 404));
      return;
    }
    const response: DBMessageResponse = {
      message: 'User deleted',
      data: user,
    };
    res.json(response);
  } catch (error) {
    next(new CustomError((error as Error).message, 500));
  }
};

// - checkToken - check if current user token is valid: return data from req.user. No need for database query
const checkToken = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    next(new CustomError('token not valid', 403));
  } else {
    const userOutput: UserOutput = {
      _id: (req.user as User)._id,
      user_name: (req.user as User).user_name,
      email: (req.user as User).email,
    };
    res.json(userOutput);
  }
};

export {
  userGet,
  userListGet,
  userPost,
  userPutCurrent,
  userDeleteCurrent,
  checkToken,
};
