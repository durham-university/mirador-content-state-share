import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Tool } from '@psychobolt/react-paperjs';

/** */
class MouseListenerTool extends Component {
  /** */
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Tool
        onMouseDown={this.props.onMouseDown}
        onMouseDrag={this.props.onMouseDrag}
        onMouseMove={this.props.onMouseMove}
        onMouseUp={this.props.onMouseUp}
      />
    );
  }
}

MouseListenerTool.propTypes = {
  onMouseDown: PropTypes.func.isRequired,
  onMouseUp: PropTypes.func.isRequired,
  onMouseDrag: PropTypes.func.isRequired,
  onMouseMove: PropTypes.func.isRequired,
};

export default React.forwardRef((props, ref) => <MouseListenerTool innerRef={ref} {...props} />);