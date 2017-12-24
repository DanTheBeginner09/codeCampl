import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Button, Tooltip, OverlayTrigger } from 'react-bootstrap';

const unlockWarning = (
  <Tooltip id='tooltip'>
    <h4>
      <strong>Careful!</strong> Only run code you trust
    </h4>
  </Tooltip>
);

const propTypes = {
  executeChallenge: PropTypes.func.isRequired,
  helpChatRoom: PropTypes.string,
  hint: PropTypes.string,
  isCodeLocked: PropTypes.bool,
  makeToast: PropTypes.func.isRequired,
  openBugModal: PropTypes.func.isRequired,
  unlockUntrustedCode: PropTypes.func.isRequired,
  updateHint: PropTypes.func.isRequired
};

export default class ToolPanel extends PureComponent {
  constructor(...props) {
    super(...props);
    this.makeHint = this.makeHint.bind(this);
    this.makeReset = this.makeReset.bind(this);
  }
  makeHint() {
    this.props.makeToast({
      message: this.props.hint,
      timeout: 4000
    });
    this.props.updateHint();
  }

  makeReset() {
    this.props.makeToast({
      message: 'This will restore your code editor to its original state.',
      action: 'clear my code',
      actionCreator: 'clickOnReset',
      timeout: 4000
    });
  }

  renderHint(hint, makeHint) {
    if (!hint) {
      return null;
    }
    return (
      <Button
        block={ true }
        bsStyle='primary'
        className='btn-big'
        onClick={ makeHint }
        >
        Hint
      </Button>
    );
  }

  renderExecute(isCodeLocked, executeChallenge, unlockUntrustedCode) {
    if (isCodeLocked) {
      return (
        <OverlayTrigger
          overlay={ unlockWarning }
          placement='right'
          >
          <Button
            block={ true }
            bsStyle='primary'
            className='btn-big'
            onClick={ unlockUntrustedCode }
            >
            Code Locked. Unlock?
          </Button>
        </OverlayTrigger>
      );
    }
    return (
      <Button
        block={ true }
        bsStyle='primary'
        className='btn-big'
        onClick={ executeChallenge }
        >
        Run tests (ctrl + enter)
      </Button>
    );
  }

  render() {
    const {
      executeChallenge,
      helpChatRoom,
      hint,
      isCodeLocked,
      openBugModal,
      unlockUntrustedCode
    } = this.props;

    return (
      <div>
        { this.renderHint(hint, this.makeHint) }
        {
          this.renderExecute(
            isCodeLocked,
            executeChallenge,
            unlockUntrustedCode
          )
        }
        <div className='button-spacer' />
          <Button
            bsStyle='primary'
            className='btn-big btn-block'
            onClick={ this.makeReset }
            >
          Reset your code
          </Button>
          <div className='button-spacer' />
          <Button
            bsStyle='primary'
            className='btn-big btn-block'
            componentClass='a'
            href={ `https://gitter.im/freecodecamp/${helpChatRoom}` }
            target='_blank'
            >
          Get a hint
          </Button>
          <div className='button-spacer' />
          <Button
            bsStyle='primary'
            className='btn-big btn-block'
            onClick={ openBugModal }
            >
          Ask for help on the forum
          </Button>
        <div className='button-spacer' />
      </div>
    );
  }
}

ToolPanel.displayName = 'ToolPanel';
ToolPanel.propTypes = propTypes;
