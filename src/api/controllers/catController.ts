import {Request, Response, NextFunction} from 'express';
import {Cat} from '../../interfaces/Cat';
import {User} from '../../interfaces/User';
import CustomError from '../../classes/CustomError';
import catModel from '../models/catModel';
import mongoose from 'mongoose';

// Get all cats by current user id

const catGetByUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user: User = req.user as User;
  console.log(user._id);
  const cats: Cat[] = await catModel.find({
    'owner._id': user._id,
  });
  console.log(cats);
  if (cats.length > 0) {
    res.json(cats);
  } else {
    next(new CustomError('Cats not found', 404));
  }
};

// catGetByBoundingBox - get all cats by bounding box coordinates (getJSON)

const catGetByBoundingBox = async (req: Request, res: Response) => {
  try {
    const cats = await catModel
      .find()
      .where('location.lat')
      .gt(0)
      .lt(100)
      .where('location.lon')
      .gt(0)
      .lt(100);
    if (cats) {
      return res.json(cats);
    } else {
      res.status(404).json({message: 'Cats not found'});
    }
  } catch (err) {
    res.status(500).json(err);
  }
};

const catPutAdmin = async (
  req: Request<{id: string}>,
  res: Response,
  next: NextFunction
) => {
  //const {id} = req.params;
  const cat: Cat = await catModel.findById(req.params.id);

  if (!cat) {
    next(new CustomError('Cat or user not found', 404));
    return;
  }
  cat.cat_name = req.body.cat_name;
  res.json({message: 'cat modified', data: cat});
  next(cat);
};

const catDeleteAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user as User;
  const cat = await catModel.findById(req.params.id);
  console.log(cat);
  if (!cat) {
    next(new CustomError('Cat not found', 404));
    return;
  }
  console.log(user.role);
  if (user.role === 'User') {
    next(new CustomError('Only admin can delete cat', 403));
    return;
  }
  //Deleting cat
  const deletedCat = await catModel.deleteOne({_id: cat._id});
  console.log(deletedCat);
  res.json({message: 'cat deleted', data: cat});
  return;
};

//Should delete cat by id and the owner should be the current user

const catDelete = async (req: Request, res: Response, next: NextFunction) => {
  const user = req.user as User;
  const cat = await catModel.findById(req.params.id);
  console.log(cat);
  if (!cat) {
    next(new CustomError('Cat not found', 404));
    return;
  }
  if (
    !(cat.owner._id as unknown as mongoose.Types.ObjectId).equals(
      user._id as unknown as mongoose.Types.ObjectId
    )
  ) {
    next(new CustomError('Only owner can delete cat', 403));
    return;
  }
  //Deleting cat
  const deletedCat = await catModel.deleteOne({_id: cat._id});
  console.log(deletedCat);
  res.json({message: 'cat deleted', data: cat});
  return;
};

const catPut = async (req: Request, res: Response, next: NextFunction) => {
  const {id} = req.params;
  const user: User = req.user as User;

  const {cat_name, birthdate, weight} = req.body;
  const cat: Cat = await catModel.findById(id);
  if (!cat) {
    next(new CustomError('Cat not found', 404));
    return;
  }
  if (
    !(cat.owner._id as unknown as mongoose.Types.ObjectId).equals(
      user._id as unknown as mongoose.Types.ObjectId
    )
  ) {
    next(new CustomError('Only owner can update cat', 403));
    return;
  }
  const updatedCat: Cat = await catModel.findByIdAndUpdate(
    id,
    {cat_name, birthdate, weight},
    {new: true}
  );

  res.json({message: 'cat updated', data: updatedCat});
  next(cat);
};

const catGet = async (req: Request, res: Response, next: NextFunction) => {
  const {id} = req.params;
  const cat: Cat = await catModel.findById(id);
  if (!cat) {
    next(new CustomError('Cat not found', 404));
    return;
  }
  res.json(cat);
  next(cat);
};

const catListGet = async (req: Request, res: Response, next: NextFunction) => {
  const cats: Cat[] = await catModel.find();
  res.json(cats);
  next(cats);
};

const catPost = async (req: Request, res: Response, next: NextFunction) => {
  const user: User = req.user as User;
  const {cat_name, birthdate, weight, filename} = req.body;
  const location = {type: 'Point', lat: 71.38, lon: 60.2};
  const newCat: Cat = await catModel.create({
    cat_name,
    birthdate,
    weight,
    filename,
    location: location,
    owner: {
      _id: user._id,
      user_name: user.user_name,
      email: user.email,
    },
  });
  if (!newCat) {
    next(new CustomError('Cat not added', 400));
    return;
  }
  res.json({message: 'cat added', data: newCat, path: 'type'});
  next(newCat);
};

export {
  catGetByUser,
  catGetByBoundingBox,
  catPutAdmin,
  catDeleteAdmin,
  catDelete,
  catPut,
  catGet,
  catListGet,
  catPost,
};
