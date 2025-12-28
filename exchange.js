
const userModel = require('../models/user');
const announcementModel = require('../models/announcement');
const {verifyToken} = require('../utils/token');
const {validationResult} = require('express-validator');
const {logger} = require('../utils/logger');
const {ERROR} = require('../constants');

module.exports.isAuth = async (req, res, next) => {
  const {access_token} = req.cookies;
  const user = await userModel.findOne({
    accessTokens: access_token
  });
  if (user) {
    verifyToken(access_token, async err => {
      if (err) {
        logger.log({
          token: user._id,
          action: 'middleware isAuth',
          level: 'info',
          message: ERROR.INVALID_TOKEN.message
        });
        return res.status(400).json({
          status: 'error',
          message: ERROR.INVALID_TOKEN.message
        });
      }
      req.currentUserId = user.id;
      req.currentUserRole = user.role;
      return next();
    });
  } else {
    return res.status(400).json({status: 'error'});
  }
};

module.exports.access = roles => {
  return async (req, res, next) => {
    if (roles) {
      return next();
    }

    return res.status(400).json({status: 'error'});
  };
};

module.exports.validation = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({errors: errors.array({onlyFirstError: true})});
  } else {
    return next();
  }
};


index.js 2

Accessibility information
This page has four areas: Information about the challenge, a tree view “File Explorer” containing the project files, a “Code blocks” section with a list of code blocks that can be chosen as answers to be submitted, and a code viewer section. The code viewer section has tabs displaying opened files, with the currently opened file presented in a table. This table has three columns: Code block indicator (only present on the first line of a code block) which can be used to select the code block as an answer, line number, and the code itself. Each line of code within a code block is prefixed with ‘CBX’, where X is a number used to distinguish between code blocks. Opening category information or pressing the hints or submit buttons will open a modal dialog.

Skip to Code Editor
Locate the vulnerability
Fix the vulnerability
Locate the vulnerability
Review the highlighted code blocks in the source code and select 1 code block that causes the vulnerability listed below.

Vulnerability Category
Access Control - Missing Object Level Access Control

Actions
0/1 code block(s) selected

Attempts left: 1

View shortcuts keyboard hotkey:?

File Explorer
Highlighted files only: 17 files hidden


middlewares1 code blocks left, 0 code blocks ignored
index.js1 code blocks left, 0 code blocks ignored
1
routes3 code blocks left, 0 code blocks ignored
index.js3 code blocks left, 0 code blocks ignored
3
Code blocks
index.js:38-40
index.js:81-81
index.js:160-160
index.js:226-226
const router = require('express').Router();
const {
  body,
  param,
  cookie,
  sanitizeBody,
  sanitizeParam,
  sanitizeCookie
} = require('express-validator');
const AuthController = require('../controllers/auth.controller');
const AnnouncementsController = require('../controllers/announcements.controller');
const UsersController = require('../controllers/users.controller');
const {isAuth, access, validation} = require('../middlewares');

router.post(
  '/registration',
  [
    body('firstName')
      .isString()
      .trim()
      .notEmpty()
      .isLength({max: 50}),
    body('lastName')
      .isString()
      .trim()
      .notEmpty()
      .isLength({max: 50}),
    body('email')
      .isEmail()
      .notEmpty()
      .isLength({max: 50}),
    body('phone')
      .isMobilePhone('any')
      .notEmpty()
      .isLength({max: 50}),
    body('password')
      .notEmpty()
      .isLength({min: 10, max: 160})
      .custom(value => {
        if (/[A-Z]/.test(value)) {
          if (/[a-z]/.test(value)) {
            if (/[0-9]/.test(value)) {
              return true;
            }
          }
        }
        throw new Error('Password is not correct');
      }),
    body(
      'passwordConfirmation',
      'passwordConfirmation field must have the same value as the password field'
    )
      .exists()
      .custom((value, {req}) => value === req.body.password),
    sanitizeBody(['firstName', 'lastName', 'email', 'phone']).escape()
  ],
  validation,
  AuthController.registration
);

router.post(
  '/login',
  [
    body('email')
      .isEmail()
      .notEmpty(),
    body('password').notEmpty()
  ],
  validation,
  AuthController.login
);

router.get('/announcements', AnnouncementsController.getListAnnouncements);
router.get(
  '/announcements/all',
  cookie('access_token')
    .notEmpty()
    .isJWT(),
  sanitizeCookie('access_token').escape(),
  validation,
  isAuth,
  access(['admin']),
  AnnouncementsController.getListAnnouncements
);

router.post(
  '/announcements',
  [
    body('title')
      .notEmpty()
      .trim()
      .isString()
      .isLength({max: 70}),
    body('description')
      .notEmpty()
      .trim()
      .isString()
      .isLength({max: 500}),
    body('published').isBoolean(),
    cookie('access_token')
      .notEmpty()
      .isJWT(),
    sanitizeCookie('access_token').escape(),
    sanitizeBody(['title', 'description', 'published']).escape()
  ],
  validation,
  isAuth,
  AnnouncementsController.addAnnouncement
);

router.get(
  '/announcements/view/:id',
  param('id')
    .notEmpty()
    .isUUID('4'),
  sanitizeParam(['id']).escape(),
  validation,
  AnnouncementsController.viewAnnouncement
);

router.get(
  '/announcements/user',
  cookie('access_token')
    .notEmpty()
    .isJWT(),
  sanitizeCookie('access_token').escape(),
  validation,
  isAuth,
  AnnouncementsController.getListAnnouncementsAuthor
);

router.get(
  '/announcements/user/:id',
  param('id')
    .notEmpty()
    .isUUID('4'),
  cookie('access_token')
    .notEmpty()
    .isJWT(),
  sanitizeCookie('access_token').escape(),
  sanitizeParam(['id']).escape(),
  validation,
  isAuth,
  access(['admin']),
  AnnouncementsController.getListAnnouncementsAuthor
);

router.get(
  '/announcements/edit/:id',
  param('id')
    .notEmpty()
    .isUUID('4'),
  cookie('access_token')
    .notEmpty()
    .isJWT(),
  sanitizeCookie('access_token').escape(),
  sanitizeParam(['id']).escape(),
  validation,
  isAuth,
  access(['admin', 'author']),
  AnnouncementsController.getAnnouncement
);

router.put(
  '/announcements/edit/:id',
  [
    body('title')
      .notEmpty()
      .trim()
      .isString()
      .isLength({max: 70}),
    body('description')
      .notEmpty()
      .trim()
      .isString()
      .isLength({max: 500}),
    body('published').isBoolean(),
    param('id')
      .notEmpty()
      .isUUID('4'),
    cookie('access_token')
      .notEmpty()
      .isJWT(),
    sanitizeCookie('access_token').escape(),
    sanitizeParam(['id']).escape(),
    sanitizeBody(['title', 'description', 'published']).escape()
  ],
  validation,
  isAuth,
  access(['admin', 'author']),
  AnnouncementsController.editAnnouncement
);

router.delete(
  '/announcements/delete/:id',
  param('id')
    .notEmpty()
    .isUUID('4'),
  cookie('access_token')
    .notEmpty()
    .isJWT(),
  sanitizeCookie('access_token').escape(),
  sanitizeParam(['id']).escape(),
  validation,
  isAuth,
  access(['admin', 'author']),
  AnnouncementsController.deleteAnnouncement
);

router.post(
  '/announcements/approve/:id',
  [
    body('approved').isBoolean(),
    param('id')
      .notEmpty()
      .isUUID('4'),
    cookie('access_token')
      .notEmpty()
      .isJWT(),
    sanitizeCookie('access_token').escape(),
    sanitizeParam(['id']).escape()
  ],
  validation,
  isAuth,
  access(['admin']),
  AnnouncementsController.approveAnnouncement
);

router.post(
  '/announcements/publish/:id',
  [
    body('published').isBoolean(),
    param('id')
      .notEmpty()
      .isUUID('4'),
    cookie('access_token')
      .notEmpty()
      .isJWT(),
    sanitizeCookie('access_token').escape(),
    sanitizeParam(['id']).escape()
  ],
  validation,
  isAuth,
  access(['admin', 'author']),
  AnnouncementsController.publishAnnouncement
);

router.get(
  '/user/activate/:activateToken',
  param('activateToken')
    .notEmpty()
    .isJWT(),
  validation,
  UsersController.activate
);

router.post(
  '/user/reset',
  body('email')
    .isEmail()
    .notEmpty(),
  validation,
  UsersController.resetPassword
);

router.get(
  '/user/reset/:resetToken',
  param('resetToken')
    .notEmpty()
    .isJWT(),
  validation,
  UsersController.resetPassword
);

router.post(
  '/user/reset/:resetToken',
  [
    param('resetToken')
      .notEmpty()
      .isJWT(),
    body('password')
      .notEmpty()
      .isLength({min: 10, max: 160})
      .custom(value => {
        if (/[A-Z]/.test(value)) {
          if (/[a-z]/.test(value)) {
            if (/[0-9]/.test(value)) {
              return true;
            }
          }
        }
        throw new Error('Password is not correct');
      }),
    body(
      'passwordConfirmation',
      'passwordConfirmation field must have the same value as the password field'
    )
      .exists()
      .custom((value, {req}) => value === req.body.password)
  ],
  validation,
  UsersController.resetPassword
);

router.get(
  '/user/info/:id',
  param('id')
    .notEmpty()
    .isUUID('4'),
  cookie('access_token')
    .notEmpty()
    .isJWT(),
  sanitizeCookie('access_token').escape(),
  sanitizeParam(['id']).escape(),
  validation,
  isAuth,
  access(['admin']),
  UsersController.getUserInfo
);

router.get(
  '/user/info',
  cookie('access_token')
    .notEmpty()
    .isJWT(),
  sanitizeCookie('access_token').escape(),
  validation,
  isAuth,
  UsersController.getUserInfo
);

router.put(
  '/user/info',
  [
    body('firstName')
      .isString()
      .trim()
      .notEmpty()
      .isLength({max: 50}),
    body('lastName')
      .isString()
      .trim()
      .notEmpty()
      .isLength({max: 50}),
    body('phone')
      .isMobilePhone('any')
      .notEmpty()
      .isLength({max: 50}),
    cookie('access_token')
      .notEmpty()
      .isJWT(),
    sanitizeCookie('access_token').escape(),
    sanitizeBody(['firstName', 'lastName', 'phone']).escape()
  ],
  validation,
  isAuth,
  UsersController.editUserInfo
);

router.get(
  '/logout',
  cookie('access_token')
    .notEmpty()
    .isJWT(),
  sanitizeCookie('access_token').escape(),
  validation,
  isAuth,
  AuthController.logout
);

module.exports = router;
