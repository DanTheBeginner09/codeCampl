import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import { challengeSelector } from '../../redux';
import { challengeUpdated } from './redux';

import CompletionModal from './Completion-Modal.jsx';
import AppChildContainer from '../../Child-Container.jsx';
import { OverlayLoader } from '../../helperComponents';
import { fullBlocksSelector } from '../../entities';
import { paramsSelector } from '../../Router/redux';

const mapStateToProps = createSelector(
  challengeSelector,
  fullBlocksSelector,
  paramsSelector,
  (challenge, fullBlocks, { block }) => ({
      challenge,
      showLoading: !fullBlocks.includes(block)
    })
);

const mapDispatchToProps = { challengeUpdated };

const propTypes = {
  challenge: PropTypes.object,
  challengeUpdated: PropTypes.func.isRequired,
  children: PropTypes.node,
  showLoading: PropTypes.bool
};

class ChildContainer extends PureComponent {
  componentDidUpdate(prevProps) {
    const { challenge = {}, challengeUpdated } = this.props;
    if (prevProps.showLoading && !this.props.showLoading) {
      challengeUpdated(challenge);
    }
  }
  render() {
    const { children, showLoading, ...props } = this.props;
    return (
      <AppChildContainer { ...props }>
        {
            showLoading ? <OverlayLoader /> : null
          }
        { children }
        <CompletionModal />
      </AppChildContainer>
    );
  }
}

ChildContainer.propTypes = propTypes;

export default connect(mapStateToProps, mapDispatchToProps)(ChildContainer);
