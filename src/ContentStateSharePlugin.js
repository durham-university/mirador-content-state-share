import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import MenuItem from '@material-ui/core/MenuItem';
import IconButton from '@material-ui/core/IconButton';
import ShareIcon from '@material-ui/icons/ShareSharp';
import { getManifestoInstance } from 'mirador/dist/es/src/state/selectors/manifests';
import * as actions from 'mirador/dist/es/src/state/actions';
import MiradorMenuButton from 'mirador/dist/es/src/containers/MiradorMenuButton';

const mapDispatchToProps = (dispatch, props) => ({
  addCompanionWindow: (content, additionalProps) => dispatch(
    actions.addCompanionWindow(props.windowId, { content, ...additionalProps }),
  )
});

const mapStateToProps = (state, props) => ({
  config: state.config
});

class ContentStateShareComponent extends Component {

  constructor(props){
    super(props);
    this.openContentStateShareCompanionWindow = this.openContentStateShareCompanionWindow.bind(this);
  }

  openContentStateShareCompanionWindow(e) {
    const { addCompanionWindow } = this.props;
    addCompanionWindow('content-state-sharing', { position: 'right' });
  }
  
  openCompanionWindowAndClose() {
    const { openShareCompanionWindow, handleClose } = this.props;

    openShareCompanionWindow();
//    handleClose();
  }

  render() {
    return (
        <MiradorMenuButton aria-label="Share" onClick={() => this.openContentStateShareCompanionWindow()}>
          <ShareIcon />
        </MiradorMenuButton>
    );
  }
}


ContentStateShareComponent.propTypes = {
  addCompanionWindow: PropTypes.func.isRequired,
//  handleClose: PropTypes.func.isRequired,
};


export default {
  target: 'WindowTopBarPluginArea',
  mode: 'add',
  name: 'ContentStateSharePlugin',
  component: ContentStateShareComponent,
  mapDispatchToProps,
  mapStateToProps,
  reducers: {
    dummy: (state = {}, action) => { return state; }
  },
};
