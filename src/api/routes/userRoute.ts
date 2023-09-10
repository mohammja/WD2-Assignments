import express from 'express';
import {
  checkToken,
  userDeleteCurrent,
  userGet,
  userListGet,
  userPost,
  userPutCurrent,
} from '../controllers/userController';
import passport from '../../passport';
import {body, param} from 'express-validator';

const router = express.Router();

// TODO: add validation

router
  .route('/')
  .get(userListGet)
  .post(userPost)
  .put(passport.authenticate('jwt', {session: false}), userPutCurrent)
  .delete(passport.authenticate('jwt', {session: false}), userDeleteCurrent);

router.get(
  '/token',
  passport.authenticate('jwt', {session: false}),
  checkToken
);
// checking user_name and email and password
router
  .route('/:id')
  .get(param('id').isMongoId(), userGet)
  .put(
    param('id').isMongoId(),
    body('email').optional().isLength({min: 5}).isString().escape(),
    body('password').optional().isLength({min: 5}).isString().escape(),
    body('user_name').optional().isLength({min: 3}).isString().escape(),
    body('role').optional().isString().escape(),
    userPutCurrent
  )
  .delete(param('id').isMongoId(), userDeleteCurrent);

export default router;
