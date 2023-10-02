/* eslint-disable @typescript-eslint/unbound-method */
import {
  ControlLabel,
  FormControl,
  Alert,
  FormGroup
} from '@freecodecamp/react-bootstrap';
import React, { Component } from 'react';
import type { TFunction } from 'i18next';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import type { Dispatch } from 'redux';
import { createSelector } from 'reselect';

import { isValidUsername } from '../../../../shared/utils/validate';
import { usernameValidationSelector } from '../../redux/settings/selectors';
import {
  validateUsername,
  submitNewUsername
} from '../../redux/settings/actions';
import BlockSaveButton from '../helpers/form/block-save-button';
import FullWidthRow from '../helpers/full-width-row';

type UsernameProps = {
  isValidUsername: boolean;
  submitNewUsername: (name: string) => void;
  t: TFunction;
  username: string;
  validateUsername: (name: string) => void;
  validating: boolean;
};

type UsernameState = {
  isFormPristine: boolean;
  formValue: string;
  characterValidation: {
    valid: boolean;
    error: null | string;
  };
  submitClicked: boolean;
  isUserNew: boolean;
};

const mapStateToProps = createSelector(
  usernameValidationSelector,
  ({
    isValidUsername,
    fetchState
  }: {
    isValidUsername: boolean;
    fetchState: {
      pending: boolean;
      complete: boolean;
      errored: boolean;
      error: boolean | null;
    };
  }) => ({
    isValidUsername,
    validating: fetchState.pending
  })
);

const mapDispatchToProps = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      submitNewUsername,
      validateUsername
    },
    dispatch
  );

const hex = '[0-9a-f]';
const tempUserRegex = new RegExp(`^fcc${hex}{8}-(${hex}{4}-){3}${hex}{12}$`);

class UsernameSettings extends Component<UsernameProps, UsernameState> {
  static displayName: string;
  constructor(props: UsernameProps) {
    super(props);

    this.state = {
      isFormPristine: true,
      formValue: props.username,
      characterValidation: { valid: false, error: null },
      submitClicked: false,
      isUserNew: tempUserRegex.test(props.username)
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.validateFormInput = this.validateFormInput.bind(this);
  }

  componentDidUpdate(prevProps: UsernameProps, prevState: UsernameState) {
    const { username: prevUsername } = prevProps;
    const { formValue: prevFormValue } = prevState;
    const { username } = this.props;
    const { formValue } = this.state;
    if (prevUsername !== username && prevFormValue === formValue) {
      return this.setState({
        isFormPristine: username === formValue,
        submitClicked: false,
        isUserNew: tempUserRegex.test(username)
      });
    }
    return null;
  }

  handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const { submitNewUsername } = this.props;
    const {
      formValue,
      characterValidation: { valid }
    } = this.state;

    return this.setState({ submitClicked: true }, () =>
      valid ? submitNewUsername(formValue) : null
    );
  }

  handleChange(e: React.FormEvent<HTMLInputElement>) {
    e.preventDefault();
    const { username, validateUsername } = this.props;
    const newValue = (e.target as HTMLInputElement).value;
    return this.setState(
      {
        formValue: newValue,
        isFormPristine: username === newValue,
        characterValidation: this.validateFormInput(newValue),
        submitClicked: false
      },
      () =>
        this.state.isFormPristine ||
        this.state.characterValidation.error ||
        username.toLowerCase().trim() === newValue.toLowerCase().trim()
          ? null
          : validateUsername(this.state.formValue)
    );
  }

  validateFormInput(formValue: string) {
    return isValidUsername(formValue);
  }

  renderAlerts(
    validating: boolean,
    error: string | null,
    isValidUsername: boolean
  ) {
    const { t } = this.props;

    if (!validating && error) {
      return (
        <Alert bsStyle='danger' closeLabel={t('buttons.close')}>
          {t(`settings.username.${error}`, {
            username: this.state.formValue
          })}
        </Alert>
      );
    }
    if (!validating && !isValidUsername) {
      return (
        <Alert bsStyle='warning' closeLabel={t('buttons.close')}>
          {t('settings.username.unavailable')}
        </Alert>
      );
    }
    if (validating) {
      return (
        <Alert bsStyle='info' closeLabel={t('buttons.close')}>
          {t('settings.username.validating')}
        </Alert>
      );
    }
    if (!validating && isValidUsername && this.state.isUserNew) {
      return (
        <Alert bsStyle='success' closeLabel={t('buttons.close')}>
          {t('settings.username.available')}
        </Alert>
      );
    } else if (!validating && isValidUsername && !this.state.isUserNew) {
      return (
        <>
          <Alert bsStyle='success' closeLabel={t('buttons.close')}>
            {t('settings.username.available')}
          </Alert>
          <Alert bsStyle='info' closeLabel={t('buttons.close')}>
            {t('settings.username.change')}
          </Alert>
        </>
      );
    }
    return null;
  }

  render() {
    const {
      isFormPristine,
      formValue,
      characterValidation: { valid, error },
      submitClicked
    } = this.state;
    const { isValidUsername, t, validating } = this.props;
    const isDisabled =
      !(isValidUsername && valid && !isFormPristine) || submitClicked;
    return (
      <form
        id='usernameSettings'
        onSubmit={this.handleSubmit}
        data-cy='username-form'
      >
        <FullWidthRow>
          <FormGroup>
            <ControlLabel htmlFor='username-settings'>
              <strong>{t('settings.labels.username')}</strong>
            </ControlLabel>
            <FormControl
              name='username-settings'
              onChange={this.handleChange}
              value={formValue}
              data-cy='username-input'
              id='username-settings'
            />
          </FormGroup>
          {!isFormPristine &&
            this.renderAlerts(validating, error, isValidUsername)}
          <BlockSaveButton
            aria-disabled={isDisabled}
            bgSize='lg'
            {...(isDisabled && { tabIndex: -1 })}
          >
            {t('buttons.save')}{' '}
            <span className='sr-only'>{t('settings.labels.username')}</span>
          </BlockSaveButton>
        </FullWidthRow>
      </form>
    );
  }
}

UsernameSettings.displayName = 'UsernameSettings';

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withTranslation()(UsernameSettings));
