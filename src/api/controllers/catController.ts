// TODO: create following functions:

import {Request, Response, NextFunction} from 'express';
import CustomError from '../../classes/CustomError';
import {LoginUser, User} from '../../interfaces/User';
import DBMessageResponse from '../../interfaces/DBMessageResponse';
import {Cat} from '../../interfaces/Cat';
import CatModel from '../models/catModel';
import {validationResult} from 'express-validator';
import {Types} from 'mongoose';

// - catGetByUser - get all cats by current user id
const catGetByUser = async (
  req: Request,
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

    const cats = await CatModel.find({owner: (req.user as User)._id}).populate(
      'owner'
    );
    if (!cats) {
      next(new CustomError('Cats not found', 404));
      return;
    }
    res.json(cats);
  } catch (err) {
    next(new CustomError('Something went wrong', 500));
  }
};
// - catPutAdmin - only admin can change cat owner
// Admin can change everything
const catPutAdmin = async (
  req: Request<{id: string}, {}, Cat>,
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
    if (res.locals.role !== 'Admin') {
      throw new CustomError('Not authorized', 403);
    }

    const cat = await CatModel.findById(req.params.id);
    if (!cat) {
      throw new CustomError('Cat not found', 404);
    }
    const updatedCat = await CatModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      {new: true}
    );
    res.json(updatedCat);
  } catch (err) {
    next(new CustomError('Something wrong happend', 500));
  }
};

// - catGet - get cat by id
const catGet = async (
  req: Request<{id: string}, {}, {}>,
  res: Response,
  next: NextFunction
) => {
  try {
    const cat = await CatModel.findById(req.params.id);
    if (!cat) {
      throw new CustomError('Cat not found', 404);
    }
    res.json(cat);
  } catch (err) {
    next(err);
  }
};

// - catListGet - get all cats
const catListGet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cats = await CatModel.find();
    res.json(cats);
  } catch (err) {
    next(err);
  }
};

// - catGetByBoundingBox - get all cats by bounding box coordinates (getJSON)
const catGetByBoundingBox = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {minLat, maxLat, minLng, maxLng} = req.query;
    const cats = await CatModel.find({
      location: {
        $geoWithin: {
          $geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [minLng, minLat],
                [minLng, maxLat],
                [maxLng, maxLat],
                [maxLng, minLat],
                [minLng, minLat],
              ],
            ],
          },
        },
      },
    });
    res.json(cats);
  } catch (err) {
    next(err);
  }
};

// - catPost - create new cat
//  should upload a cat
// should upload a cat with GPS and without GPS
const catPost = async (
  req: Request<{}, {}, Cat>,
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
    if (!req.body.owner) {
      req.body.owner = (req.user as User)._id;
    }
    if (!req.body.location) {
      req.body.location = {
        type: 'Point',
        coordinates: [0, 0],
      };
    }
    const cat = req.body;
    const newCat = await CatModel.create(cat);
    const response: DBMessageResponse = {
      message: 'Cat created',
      data: newCat,
    };
    res.json(response);
  } catch (err) {
    next(new CustomError('Cat creation failed', 500));
  }
};

// const catPost = async (
//   req: Request<{}, {}, Cat>,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       const messages = errors
//         .array()
//         .map((error) => `${error.msg}: ${error.param}`)
//         .join(', ');
//       next(new CustomError(messages, 400));
//       return;
//     }
//     if (!req.body.filename && req.file) {
//       req.body.filename = req.file.filename;
//     }

//     // to make sure that the function makeThumbnail is passing
//     if (!req.body.owner) {
//       req.body.owner = (req.user as User)._id;
//     }
//     if (!req.body.location) {
//       req.body.location = {
//         type: 'Point',
//         coordinates: [0, 0],
//       };
//     }

//     const cat = req.body;
//     const newCat = await CatModel.create(cat);
//     console.log(newCat);
//     const response: DBMessageResponse = {
//       message: 'Cat created',
//       data: newCat,
//     };
//     res.json(response);
//   } catch (err) {
//     next(new CustomError('Cat creation failed', 500));
//   }
// };

// - catPut - only owner can update cat
const catPut = async (
  req: Request<{id: string}, {}, Cat>,
  res: Response<{}, {user: LoginUser; role: string}>,
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

    if (req.body.owner._id.toString() === req.params.id) {
      const updatedCat = (await CatModel.findByIdAndUpdate(
        req.params.id,
        req.body,
        {new: true}
      )) as Cat;
      res.json(updatedCat);
    } else {
      throw new CustomError('Not authorized', 403);
    }
  } catch (err) {
    next(new CustomError('Something went wrong', 500));
  }
};

// - catDelete - only owner can delete cat
const catDelete = async (
  req: Request<{id: string}, {}, {}>,
  res: Response<{}, {user: LoginUser; role: string}>,
  next: NextFunction
) => {
  try {
    const cat = await CatModel.findById(req.params.id);
    if (!cat) {
      throw new CustomError('Cat not found', 404);
    }
    if (cat.owner._id.toString() === req.params.id) {
      const deletedCat = await CatModel.findByIdAndDelete(req.params.id);
      if (!deletedCat) {
        throw new CustomError('Cat not found', 404);
      }
      const response: DBMessageResponse = {
        message: 'Cat deleted',
        data: deletedCat,
      };
      res.json(response);
    } else {
      throw new CustomError('Not authorized', 403);
    }
  } catch (err) {
    next(new CustomError('Something went wrong', 500));
  }
};

// - catDeleteAdmin - only admin can delete cat
const catDeleteAdmin = async (
  req: Request<{id: string}, {}, {}>,
  res: Response<{}, {user: LoginUser; role: string}>,
  next: NextFunction
) => {
  try {
    if (res.locals.role !== 'Admin') {
      throw new CustomError('Not authorized', 403);
    }
    const deletedCat = await CatModel.findByIdAndDelete(req.params.id);
    if (!deletedCat) {
      throw new CustomError('Cat not found', 404);
    }
    const response: DBMessageResponse = {
      message: 'Cat deleted',
      data: deletedCat,
    };
    res.json(response);
  } catch (err) {
    next(new CustomError('Something went wrong', 500));
  }
};

// const catDelete = async (
//   req: Request<{id: string}, {}, {}>,
//   res: Response<{}, {user: LoginUser; role: string}>,
//   next: NextFunction
// ) => {
//   try {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       const messages = errors
//         .array()
//         .map((error) => `${error.msg}: ${error.param}`)
//         .join(', ');
//       next(new CustomError(messages, 400));
//       return;
//     }

//     if (res.locals.role !== 'Admin') {
//       const cat = await CatModel.findById(req.params.id);
//       if (!cat) {
//         throw new CustomError('Cat not found', 404);
//       }
//       if (cat.owner.toString() !== res.locals.user._id.toString()) {
//         throw new CustomError('Not authorized', 403);
//       }
//     }
//     const deletedCat = await CatModel.findByIdAndDelete(req.params.id);
//     if (!deletedCat) {
//       throw new CustomError('Cat not found', 404);
//     }
//     res.json(deletedCat);
//   } catch (err) {
//     next(err);
//   }
// };

export {
  catGetByUser,
  catPutAdmin,
  catGet,
  catListGet,
  catGetByBoundingBox,
  catPost,
  catPut,
  catDelete,
  catDeleteAdmin,
};
