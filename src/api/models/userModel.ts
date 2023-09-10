// TODO: mongoose schema for user
import {Schema, model} from 'mongoose';
import {User} from '../../interfaces/User';

const userSchema = new Schema<User>({
  user_name: {
    type: String,
    required: true,
    unique: true,
    minlength: 3,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
  },
  role: {
    type: String,
    required: true,
    enum: ['Admin', 'User'],
  },
  password: {
    type: String,
    required: true,
    minlength: 3,
  },
});

export default model<User>('User', userSchema);
