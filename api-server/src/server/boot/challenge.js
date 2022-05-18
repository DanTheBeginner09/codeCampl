/* eslint-disable no-unused-vars */
/**
 *
 * Any ref to fixCompletedChallengesItem should be removed post
 * a db migration to fix all completedChallenges
 *
 * NOTE: it's been 4 years, so any active users will have been migrated. We
 * should still try to migrate the rest at some point.
 *
 */
import debug from 'debug';
import dedent from 'dedent';
import { isEmpty, pick, omit, uniqBy } from 'lodash';
import { ObjectID } from 'mongodb';
import { Observable } from 'rx';
import isNumeric from 'validator/lib/isNumeric';
import isURL from 'validator/lib/isURL';

import jwt from 'jsonwebtoken';
import { jwtSecret } from '../../../../config/secrets';

import { environment, deploymentEnv } from '../../../../config/env.json';
import {
  fixPartiallyCompletedChallengeItem,
  fixSavedChallengeItem
} from '../../common/utils';
import { getChallenges } from '../utils/get-curriculum';
import { ifNoUserSend } from '../utils/middleware';
import {
  getRedirectParams,
  normalizeParams,
  getPrefixedLandingPath
} from '../utils/redirection';

const log = debug('fcc:boot:challenges');

export default async function bootChallenge(app, done) {
  const send200toNonUser = ifNoUserSend(true);
  const api = app.loopback.Router();
  const router = app.loopback.Router();
  const challengeUrlResolver = await createChallengeUrlResolver(
    getChallenges()
  );
  const redirectToCurrentChallenge = createRedirectToCurrentChallenge(
    challengeUrlResolver,
    normalizeParams,
    getRedirectParams
  );

  api.post(
    '/modern-challenge-completed',
    send200toNonUser,
    isValidChallengeCompletion,
    modernChallengeCompleted
  );

  api.post('/challenges-completed', send200toNonUser, challengesCompleted);

  api.post('/project-completed', send200toNonUser, projectCompleted);

  api.post(
    '/backend-challenge-completed',
    send200toNonUser,
    isValidChallengeCompletion,
    backendChallengeCompleted
  );

  api.post(
    '/save-challenge',
    send200toNonUser,
    isValidChallengeCompletion,
    saveChallenge
  );

  router.get('/challenges/current-challenge', redirectToCurrentChallenge);

  const coderoadChallengeCompleted = createCoderoadChallengeCompleted(app);

  api.post('/coderoad-challenge-completed', coderoadChallengeCompleted);

  app.use(api);
  app.use(router);
  done();
}

/**
 * Handles submissions for all challenges.
 * @param {Request} req
 * @param {Response} res
 * @param {Next} next
 * @returns Another good question??
 */
function challengesCompleted(req, res, next) {
  // Challenges should only include `id` and `challengeType`
  const { user, body } = req;

  // Ensure `body` is an array:
  if (!Array.isArray(body) || !body.length) {
    return res.status(400).json({
      type: 'error',
      message: 'Invalid request format. Expected `body` to be an array.'
    });
  }
  const completedChallenges = [];
  for (const challenge of body) {
    const { id, challengeType } = challenge;

    // Ensure `id` and `challengeType` exist on `challenge`
    if (typeof id !== 'string' || typeof challengeType !== 'number') {
      return res.status(400).json({
        type: 'error',
        message:
          'Invalid request format. Expected `id` and `challengeType` to be present.'
      });
    }

    const isChallengeValid = validateChallenge(id, challengeType);

    if (!isChallengeValid) {
      return res.status(403).json({
        type: 'error',
        message: 'Invalid challenge submission.'
      });
    }

    // Add `timestamp` to challenge
    // NOTE: Consider what will happen if this comes with a batch
    const timestamp = Date.now();

    const completedChallenge = {
      challengeType,
      id,
      timestamp
    };

    completedChallenges.push(completedChallenge);
  }

  // TODO: Update user's completed challenges
}

/**
 * Handles submissions for all certification projects.
 * @param {Request} req
 * @param {Response} res
 * @param {Next} _next
 * @returns Good question??
 */
function projectCompleted(req, res, next) {
  const { user, body } = req;

  // Ensure `body` is an object
  if (!body || typeof body !== 'object') {
    return res.status(400).json({
      type: 'error',
      message: 'Invalid request format. Expected `body` to be an object.'
    });
  }

  // `body` can exist as the following structures:
  /*
  # RWD Projects and JS Algorithm Projects
  { 
    challengeType: number,
    files: [
      {
        contents: string,
        ext: string,
        history: string,
        key: string,
        name: string
      }
    ]
    id: string,
  }
  # Front End Libraries and Data Visualisation and APIs
  {
    challengeType: number,
    id: string,
    solution: string,
  }
  # Back End Development / Quality Assurance / Scientific Computing with Python / Data Analysis with Python / Information Security / Machine Learning with Python
  {
    challengeType: number,
    id: string,
    solution: string,
    githubLink?: string,
  }
  # Relational Database
  {
    ???
  }
  # Take Home Projects
  {
    id: string,
    solution: string,
  }
  */

  const { id } = body;

  // Find the structure, based on the `id` of the project
  const isProjectValid = validateProject(id, body);

  if (!isProjectValid) {
    return res.status(403).json({
      type: 'error',
      message: 'Invalid project submission.'
    });
  }

  // Handle all the different types of project
}

const expectedProjectStructures = [
  {
    'responsive-web-design': [
      'challengeType',
      'files',
      'files.contents',
      'files.ext',
      'files.history',
      'files.key',
      'files.name',
      'id'
    ]
  },
  {
    'javascript-algorithms-and-data-structures': [
      'challengeType',
      'files',
      'files.contents',
      'files.ext',
      'files.history',
      'files.key',
      'files.name',
      'id'
    ]
  },
  {
    'front-end-development-libraries': ['challengeType', 'id', 'solution']
  },
  {
    'data-visualization-and-apis': ['challengeType', 'id', 'solution']
  },

  {
    'back-end-development': ['challengeType', 'id', 'solution', 'githubLink']
  },
  {
    'quality-assurance': ['challengeType', 'id', 'solution', 'githubLink']
  },
  {
    'scientific-computing-with-python': [
      'challengeType',
      'id',
      'solution',
      'githubLink'
    ]
  },
  {
    'data-analysis-with-python': [
      'challengeType',
      'id',
      'solution',
      'githubLink'
    ]
  },
  {
    'information-security': ['challengeType', 'id', 'solution', 'githubLink']
  },
  {
    'machine-learning-with-python': [
      'challengeType',
      'id',
      'solution',
      'githubLink'
    ]
  },
  {
    'take-home-projects': ['id', 'solution']
  }
];

/**
 * Validates the `id` submitted is a valid challenge.
 * @param {string} id
 * @param {number} challengeType
 * @returns {boolean}
 */
function validateChallenge(id, challengeType) {
  // Ensure challenge `id` exists, and is not a Certification Project
  return false;
}

/**
 * Validates the submitted project is a Certification Project (or Take Home Project), and all required fields are present.
 * @param {string} id - Id of the Certification Project or Take Home Project challenge file
 * @param {Request.body} body - Request body
 * @returns {boolean}
 */
function validateProject(id, body) {
  // Ensure project `id` exists, and IS a Certification Project

  // Ensure `body` matches the expected structure
  // TODO: Do we care, if `body` contains too many fields?

  return false;
}

const jsCertProjectIds = [
  'aaa48de84e1ecc7c742e1124',
  'a7f4d8f2483413a6ce226cac',
  '56533eb9ac21ba0edf2244e2',
  'aff0395860f5d3034dc0bfc9',
  'aa2e6f85cab2ab736c9a9b24'
];

const multifileCertProjectIds = getChallenges()
  .filter(challenge => challenge.challengeType === 14)
  .map(challenge => challenge.id);

const savableChallenges = getChallenges()
  .filter(challenge => challenge.challengeType === 14)
  .map(challenge => challenge.id);

function buildNewSavedChallenges({
  user,
  challengeId,
  completedDate = Date.now(),
  files
}) {
  const { savedChallenges } = user;
  const challengeToSave = {
    id: challengeId,
    lastSavedDate: completedDate,
    files: files?.map(file =>
      pick(file, ['contents', 'key', 'name', 'ext', 'history'])
    )
  };

  const newSavedChallenges = uniqBy(
    [challengeToSave, ...savedChallenges.map(fixSavedChallengeItem)],
    'id'
  );

  return newSavedChallenges;
}

export function buildUserUpdate(
  user,
  challengeId,
  _completedChallenge,
  timezone
) {
  const { files, completedDate = Date.now() } = _completedChallenge;
  let completedChallenge = {};
  if (
    jsCertProjectIds.includes(challengeId) ||
    multifileCertProjectIds.includes(challengeId)
  ) {
    completedChallenge = {
      ..._completedChallenge,
      files: files?.map(file =>
        pick(file, ['contents', 'key', 'index', 'name', 'path', 'ext'])
      )
    };
  } else {
    completedChallenge = omit(_completedChallenge, ['files']);
  }
  let finalChallenge;
  const $push = {},
    $set = {},
    $pull = {};
  const {
    timezone: userTimezone,
    completedChallenges = [],
    needsModeration = false
  } = user;

  const oldIndex = completedChallenges.findIndex(
    ({ id }) => challengeId === id
  );

  const alreadyCompleted = oldIndex !== -1;
  const oldChallenge = alreadyCompleted ? completedChallenges[oldIndex] : null;

  if (alreadyCompleted) {
    finalChallenge = {
      ...completedChallenge,
      completedDate: oldChallenge.completedDate
    };
    $set[`completedChallenges.${oldIndex}`] = finalChallenge;
  } else {
    finalChallenge = {
      ...completedChallenge
    };
    $push.progressTimestamps = completedDate;
    $push.completedChallenges = finalChallenge;
  }

  let newSavedChallenges;

  if (savableChallenges.includes(challengeId)) {
    newSavedChallenges = buildNewSavedChallenges({
      user,
      challengeId,
      completedDate,
      files
    });

    // if savableChallenge, update saved array when submitting
    $set.savedChallenges = newSavedChallenges;
  }

  // remove from partiallyCompleted on submit
  $pull.partiallyCompletedChallenges = { id: challengeId };

  if (
    timezone &&
    timezone !== 'UTC' &&
    (!userTimezone || userTimezone === 'UTC')
  ) {
    $set.timezone = userTimezone;
  }

  if (needsModeration) $set.needsModeration = true;

  const updateData = {};
  if (!isEmpty($set)) updateData.$set = $set;
  if (!isEmpty($push)) updateData.$push = $push;
  if (!isEmpty($pull)) updateData.$pull = $pull;

  return {
    alreadyCompleted,
    updateData,
    completedDate: finalChallenge.completedDate,
    savedChallenges: newSavedChallenges
  };
}

export function buildChallengeUrl(challenge) {
  const { superBlock, block, dashedName } = challenge;
  return `/learn/${superBlock}/${block}/${dashedName}`;
}

// this is only called once during boot, so it can be slow.
export function getFirstChallenge(allChallenges) {
  const first = allChallenges.find(
    ({ challengeOrder, superOrder, order }) =>
      challengeOrder === 0 && superOrder === 0 && order === 0
  );

  return first ? buildChallengeUrl(first) : '/learn';
}

function getChallengeById(allChallenges, targetId) {
  return allChallenges.find(({ id }) => id === targetId);
}

export async function createChallengeUrlResolver(
  allChallenges,
  { _getFirstChallenge = getFirstChallenge } = {}
) {
  const cache = new Map();
  const firstChallenge = _getFirstChallenge(allChallenges);

  return function resolveChallengeUrl(id) {
    if (isEmpty(id)) {
      return Promise.resolve(firstChallenge);
    } else {
      return new Promise(resolve => {
        if (cache.has(id)) {
          resolve(cache.get(id));
        }

        const challenge = getChallengeById(allChallenges, id);
        if (isEmpty(challenge)) {
          resolve(firstChallenge);
        } else {
          const challengeUrl = buildChallengeUrl(challenge);
          cache.set(id, challengeUrl);
          resolve(challengeUrl);
        }
      });
    }
  };
}

export function isValidChallengeCompletion(req, res, next) {
  const {
    body: { id, challengeType, solution }
  } = req;

  // ToDO: Validate other things (challengeFiles, etc)
  const isValidChallengeCompletionErrorMsg = {
    type: 'error',
    message: 'That does not appear to be a valid challenge submission.'
  };

  if (!ObjectID.isValid(id)) {
    log('isObjectId', id, ObjectID.isValid(id));
    return res.status(403).json(isValidChallengeCompletionErrorMsg);
  }
  if ('challengeType' in req.body && !isNumeric(String(challengeType))) {
    log('challengeType', challengeType, isNumeric(challengeType));
    return res.status(403).json(isValidChallengeCompletionErrorMsg);
  }
  if ('solution' in req.body && !isURL(solution)) {
    log('isObjectId', id, ObjectID.isValid(id));
    return res.status(403).json(isValidChallengeCompletionErrorMsg);
  }
  return next();
}

export function modernChallengeCompleted(req, res, next) {
  const user = req.user;
  return user
    .getCompletedChallenges$()
    .flatMap(() => {
      const completedDate = Date.now();
      const { id, files, challengeType } = req.body;

      const completedChallenge = {
        id,
        files,
        completedDate
      };

      // if multifile cert project
      if (challengeType === 14) {
        completedChallenge.isManuallyApproved = false;
        user.needsModeration = true;
      }

      // We only need to know the challenge type if it's a project. If it's a
      // step or normal challenge we can avoid storing in the database.
      if (
        jsCertProjectIds.includes(id) ||
        multifileCertProjectIds.includes(id)
      ) {
        completedChallenge.challengeType = challengeType;
      }

      const { alreadyCompleted, savedChallenges, updateData } = buildUserUpdate(
        user,
        id,
        completedChallenge
      );

      const points = alreadyCompleted ? user.points : user.points + 1;
      const updatePromise = new Promise((resolve, reject) =>
        user.updateAttributes(updateData, err => {
          if (err) {
            return reject(err);
          }
          return resolve();
        })
      );
      return Observable.fromPromise(updatePromise).map(() => {
        return res.json({
          points,
          alreadyCompleted,
          completedDate,
          savedChallenges
        });
      });
    })
    .subscribe(() => {}, next);
}

function backendChallengeCompleted(req, res, next) {
  const { user, body = {} } = req;

  const completedChallenge = pick(body, ['id', 'solution']);
  completedChallenge.completedDate = Date.now();

  return user
    .getCompletedChallenges$()
    .flatMap(() => {
      const { alreadyCompleted, updateData } = buildUserUpdate(
        user,
        completedChallenge.id,
        completedChallenge
      );

      const updatePromise = new Promise((resolve, reject) =>
        user.updateAttributes(updateData, err => {
          if (err) {
            return reject(err);
          }
          return resolve();
        })
      );
      return Observable.fromPromise(updatePromise).doOnNext(() => {
        return res.json({
          alreadyCompleted,
          points: alreadyCompleted ? user.points : user.points + 1,
          completedDate: completedChallenge.completedDate
        });
      });
    })
    .subscribe(() => {}, next);
}

function saveChallenge(req, res, next) {
  const user = req.user;
  const { id: challengeId, files = [] } = req.body;

  if (!savableChallenges.includes(challengeId)) {
    return res.status(403).send('That challenge type is not savable');
  }

  const newSavedChallenges = buildNewSavedChallenges({
    user,
    challengeId,
    completedDate: Date.now(),
    files
  });

  return user
    .getSavedChallenges$()
    .flatMap(() => {
      const updateData = {};
      updateData.$set = {
        savedChallenges: newSavedChallenges
      };
      const updatePromise = new Promise((resolve, reject) =>
        user.updateAttributes(updateData, err => {
          if (err) {
            return reject(err);
          }
          return resolve();
        })
      );
      return Observable.fromPromise(updatePromise).doOnNext(() => {
        return res.json({
          savedChallenges: newSavedChallenges
        });
      });
    })
    .subscribe(() => {}, next);
}

const codeRoadChallenges = getChallenges().filter(
  ({ challengeType }) => challengeType === 12 || challengeType === 13
);

function createCoderoadChallengeCompleted(app) {
  /* Example request coming from CodeRoad:
   * req.body: { tutorialId: 'freeCodeCamp/learn-bash-by-building-a-boilerplate:v1.0.0' }
   * req.headers: { coderoad-user-token: '8kFIlZiwMioY6hqqt...' }
   */

  const { UserToken, User } = app.models;

  return async function coderoadChallengeCompleted(req, res) {
    const { 'coderoad-user-token': encodedUserToken } = req.headers;
    const { tutorialId } = req.body;

    if (!tutorialId) return res.send(`'tutorialId' not found in request body`);

    if (!encodedUserToken)
      return res.send(`'coderoad-user-token' not found in request headers`);

    let userToken;

    try {
      userToken = jwt.verify(encodedUserToken, jwtSecret)?.userToken;
    } catch {
      return res.send(`invalid user token`);
    }

    const tutorialRepo = tutorialId?.split(':')[0];
    const tutorialOrg = tutorialRepo?.split('/')?.[0];

    // this allows any GH account to host the repo in development or staging
    // .org submissions should always be from repos hosted on the fCC GH org
    if (deploymentEnv !== 'staging' && environment !== 'development') {
      if (tutorialOrg !== 'freeCodeCamp')
        return res.send('Tutorial not hosted on freeCodeCamp GitHub account');
    }

    // validate tutorial name is in codeRoadChallenges object
    const challenge = codeRoadChallenges.find(challenge =>
      challenge.url?.endsWith(tutorialRepo)
    );

    if (!challenge) return res.send('Tutorial name is not valid');

    const { id: challengeId, challengeType } = challenge;

    try {
      // check if user token is in database
      const tokenInfo = await UserToken.findOne({
        where: { id: userToken }
      });

      if (!tokenInfo) return res.send('User token not found');

      const { userId } = tokenInfo;

      // check if user exists for user token
      const user = await User.findOne({
        where: { id: userId }
      });

      if (!user) return res.send('User for user token not found');

      // submit challenge
      const completedDate = Date.now();
      const { completedChallenges = [], partiallyCompletedChallenges = [] } =
        user;

      let userUpdateInfo = {};

      const isCompleted = completedChallenges.some(
        challenge => challenge.id === challengeId
      );

      // if CodeRoad cert project and not in completedChallenges,
      // add to partiallyCompletedChallenges
      if (challengeType === 13 && !isCompleted) {
        const finalChallenge = {
          id: challengeId,
          completedDate
        };

        userUpdateInfo.updateData = {};
        userUpdateInfo.updateData.$set = {
          partiallyCompletedChallenges: uniqBy(
            [
              finalChallenge,
              ...partiallyCompletedChallenges.map(
                fixPartiallyCompletedChallengeItem
              )
            ],
            'id'
          )
        };

        // else, add to or update completedChallenges
      } else {
        userUpdateInfo = buildUserUpdate(user, challengeId, {
          id: challengeId,
          completedDate
        });
      }
      const updatedUser = await user.updateAttributes(
        userUpdateInfo?.updateData
      );

      if (!updatedUser)
        return res.send('An error occurred trying to submit the challenge');
    } catch (e) {
      return res.send('An error occurred trying to submit the challenge');
    }

    return res.send('Successfully submitted challenge');
  };
}

// TODO: extend tests to cover www.freecodecamp.org/language and
// chinese.freecodecamp.org
export function createRedirectToCurrentChallenge(
  challengeUrlResolver,
  normalizeParams,
  getRedirectParams
) {
  return async function redirectToCurrentChallenge(req, res, next) {
    const { user } = req;
    const { origin, pathPrefix } = getRedirectParams(req, normalizeParams);

    const redirectBase = getPrefixedLandingPath(origin, pathPrefix);
    if (!user) {
      return res.redirect(redirectBase + '/learn');
    }

    const challengeId = user && user.currentChallengeId;
    const challengeUrl = await challengeUrlResolver(challengeId).catch(next);
    if (challengeUrl === '/learn') {
      // this should normally not be hit if database is properly seeded
      throw new Error(dedent`
        Attempted to find the url for ${challengeId || 'Unknown ID'}'
        but came up empty.
        db may not be properly seeded.
      `);
    }
    return res.redirect(`${redirectBase}${challengeUrl}`);
  };
}
