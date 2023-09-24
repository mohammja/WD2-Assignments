// TODO: create a controller to send the data of uploaded cat
// to the client
// data to send is described in UploadMessageResponse interface

import {Request, Response, NextFunction} from 'express';
import UploadMessageResponse from '../../interfaces/UploadMessageResponse';
import CustomError from '../../classes/CustomError';

const catPost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      throw new CustomError('File not found', 400);
    }
    console.log(res.locals.coords);

    //Response
    const response: UploadMessageResponse = {
      message: 'cat uploaded',
      data: {
        filename: req.file.filename + '_thumb',
        location: res.locals.coords,
      },
    };

    //Send response
    res.send(response);
  } catch (error) {
    next(new CustomError('Internal Server error', 500));
  }
};

export {catPost};
