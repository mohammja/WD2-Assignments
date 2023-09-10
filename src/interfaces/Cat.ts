// TODO: cat interface
import {Point} from 'geojson';
import {Document} from 'mongoose';
import {UserOutput} from './User';

interface Cat extends Document {
  cat_name: string;
  weight: number;
  filename: string;
  birthdate: Date;
  location: Point;
  owner: UserOutput;
}

export {Cat};
