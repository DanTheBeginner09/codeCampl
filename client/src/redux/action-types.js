import { createTypes, createAsyncTypes } from '../utils/create-types';

export const ns = 'app';

export const actionTypes = createTypes(
  [
    'appMount',
    'hardGoTo',
    'allowBlockDonationRequests',
    'setRenderStartTime',
    'hideCodeAlly',
    'preventBlockDonationRequests',
    'setSessionChallNumProgressModalShown',
    'setShowMultipleProgressModals',
    'openDonationModal',
    'closeDonationModal',
    'openSignoutModal',
    'closeSignoutModal',
    'onlineStatusChange',
    'serverStatusChange',
    'resetUserData',
    'tryToShowCodeAlly',
    'tryToShowDonationModal',
    'executeGA',
    'showCodeAlly',
    'startExam',
    'stopExam',
    'submitComplete',
    'updateComplete',
    'updateFailed',
    'updateDonationFormState',
    'updateUserToken',
    'postChargeProcessing',
    'updateAllChallengesInfo',
    ...createAsyncTypes('fetchUser'),
    ...createAsyncTypes('postCharge'),
    ...createAsyncTypes('fetchProfileForUser'),
    ...createAsyncTypes('acceptTerms'),
    ...createAsyncTypes('showCert'),
    ...createAsyncTypes('reportUser'),
    ...createAsyncTypes('deleteUserToken'),
    ...createAsyncTypes('saveChallenge')
  ],
  ns
);
