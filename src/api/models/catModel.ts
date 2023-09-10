const mongoose = require('mongoose');
const Schema = mongoose;

export const catSchema = mongoose.Schema({
  cat_name: {
    type: String,
  },
  weight: {
    type: Number,
  },
  filename: {
    type: String,
  },
  birthdate: {
    type: String,
  },
  location: {
    type: {
      type: String,
    },
    lat: {
      type: Number,
    },
    lon: {
      type: Number,
    },
  },
  owner: {
    _id: {
      type: Schema.Types.ObjectId,
      reqired: true,
    },
    user_name: {
      type: String,
      reqired: true,
    },
    email: {
      type: String,
      reqired: true,
    },
  },
});

const Cat = mongoose.model('Cat', catSchema);

module.exports = Cat;

export default Cat;
