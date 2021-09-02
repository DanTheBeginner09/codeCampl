import { User } from 'loopback';
import { nanoidCharSet } from '../../common/models/user';
import { getRedirectParams } from '../utils/redirection';

const createDebugger = require('debug');
const { customAlphabet } = require('nanoid');

const log = createDebugger('fcc:boot:discourse');

const { FORUM_LOCATION, DISCOURSE_SECRET, HOME_LOCATION } = process.env;

// TODO: Should /discourse/badges be a route in here?
// Or, leave in user.js
export default function discourseBoot(app) {
  const router = app.loopback.Router();
  log('discourse booting');
  router.put('/discourse/connect', connectDiscourse);
  router.get(
    '/auth/discourse/callback',
    checkDidAuthenticate,
    addDiscourseUserId,
    handleSuccessfulConnection
  );
  // const User = app.models.User;
}

// redirect user to https://forum.freecodecamp.org/session/sso_provider?sso=URL_ENCODED_PAYLOAD&sig=HEX_SIGNATURE
function connectDiscourse(req, res) {
  // Generate nonce
  const nonce = customAlphabet(nanoidCharSet, 20);
  // Create payload with nonce and return url: nonce=NONCE&return_sso_url=RETURN_URL
  const payload = `nonce=${nonce}&return_sso_url=${HOME_LOCATION}/auth/discourse/callback`;
  // BASE64 encode payload: BASE64_PAYLOAD
  const BASE64_PAYLOAD = Buffer.from(payload).toString('base64');
  // URL encode payload: URL_ENCODED_PAYLOAD
  const URL_ENCODED_PAYLOAD = encodeURIComponent(BASE64_PAYLOAD);

  // Generate HMAC-SHA256 signature from BASE64_PAYLOAD and secret:
  const signature = crypto.createHmac('sha256', DISCOURSE_SECRET);
  signature.update(BASE64_PAYLOAD);
  const HEX_SIGNATURE = signature.digest('hex');
  res.redirect(
    `${FORUM_LOCATION}/session/sso_provider?sso=${URL_ENCODED_PAYLOAD}&sig=${HEX_SIGNATURE}`
  );
}

function checkDidAuthenticate(req, res, next) {
  // Discourse will redirect logged in user to return_sso_url
  // Query string will include `sig` and `sso` with some user info
  log(req.query);
  // Compute the HMAC-SHA256 of sso using sso provider secret as key
  // Convert `sig` from hex string into bytes: SIGNATURE_BYTES
  // Compare HMAC-SHA256 signature with SIGNATURE_BYTES (must be equal)
  // BASE64 decode sso - shuold be equal to passed embedded query string.
  // Take `nonce` key and compare it with nonce generated
}

function addDiscourseUserId(req, res, next) {
  // drop generated nonce.
  // Use query string with user information to store DISCOURSE_USER_ID in fCC DB
  const { id } = req.query;
  log(id);
  User.findById(userId, (err, user) => {
    if (err) {
      req.flash('info', 'We were unable to find your account');
      const { origin } = getRedirectParams(req);
      return res.redirectWithFlash(origin);
    }
    user.discourseId = id;
    return user.save(err => {
      if (err) {
        req.flash('error', 'We were unable to link your Discourse account');
        const { origin } = getRedirectParams(req);
        return res.redirectWithFlash(origin);
      }
      return next();
    });
  });
}

function handleSuccessfulConnection(req, res) {
  req.flash(
    'success',
    'You have successfully connected your Discourse account'
  );
  const { origin } = getRedirectParams(req);
  // Should this just redirect to /settings ?
  return res.redirectWithFlash(origin);
}
