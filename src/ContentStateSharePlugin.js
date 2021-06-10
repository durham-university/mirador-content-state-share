import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import MenuItem from '@material-ui/core/MenuItem';
import ShareIcon from '@material-ui/icons/ShareSharp';
import { getManifestoInstance } from 'mirador/dist/es/src/state/selectors/manifests';
import * as actions from 'mirador/dist/es/src/state/actions';

const mapDispatchToProps = (dispatch, props) => ({
  addCompanionWindow: (content, additionalProps) => dispatch(
    actions.addCompanionWindow(props.targetProps.windowId, { content, ...additionalProps }),
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
    handleClose();
  }

  render() {
    return (
      <MenuItem onClick={this.openContentStateShareCompanionWindow}>
        <ListItemIcon>
          <ShareIcon />
        </ListItemIcon>
        <ListItemText primaryTypographyProps={{ variant: 'body1' }}>
          Share
        </ListItemText>
      </MenuItem>
    );
  }
}

//ContentStateShareComponent.propTypes = {
//  addCompanionWindow: PropTypes.func.isRequired,
//  handleClose: PropTypes.func.isRequired,
//};


export default {
  target: 'WindowTopBarPluginMenu',
  mode: 'wrap', // TODO: this should be add but causes strange problems
  name: 'ContentStateSharePlugin',
  component: ContentStateShareComponent,
  mapDispatchToProps,
  mapStateToProps,
  reducers: {},
};
