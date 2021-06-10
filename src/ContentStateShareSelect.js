import React, { Component } from 'react';
import ReactDOM, { unstable_renderSubtreeIntoContainer } from 'react-dom';
import PropTypes from 'prop-types';
import { OSDReferences } from 'mirador/dist/es/src/plugins/OSDReferences';

class ContentStateShareSelect extends Component {
  constructor(props) {
    super(props);

    this.state = {
      drag: undefined
    };

    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);

    this.mousePos = this.mousePos.bind(this);
    this.selectBoxSections = this.selectBoxSections.bind(this);
    this.ref = React.createRef();
  }

  componentDidMount() {
    const { windowId } = this.props;
    this.OSDReference = OSDReferences.get(windowId);
  }

  mousePos(e){
    const rect = this.ref.current.getBoundingClientRect();
    return {x: e.clientX - rect.left, y: e.clientY - rect.top};
  }

  selectBoxSections() {
    const x1=Math.min(this.props.x1, this.props.x2);
    const y1=Math.min(this.props.y1, this.props.y2);
    const x2=Math.max(this.props.x1, this.props.x2);
    const y2=Math.max(this.props.y1, this.props.y2);
    return {
      x1: x1,
      y1: y1,
      x2: x2,
      y2: y2,
      x1m: x1+Math.min(Math.round((x2-x1)/4),30),
      y1m: y1+Math.min(Math.round((y2-y1)/4),30),
      x2m: x2-Math.min(Math.round((x2-x1)/4),30),
      y2m: y2-Math.min(Math.round((y2-y1)/4),30)
    };
  }

  onMouseDown(e) {
    const {x, y} = this.mousePos(e);
    if(this.props.x1 === undefined) {
      this.props.setSelection({x1: x, y1: y, x2: x, y2: y})
      this.setState( { drag: 'br', ox: 0, oy: 0 });
    }
    else {
      const {x1,y1,x2,y2,x1m,y1m,x2m,y2m} = this.selectBoxSections();

      if(x>=x1 && y>=y1 && x<x1m && y<y1m) this.setState( { drag: 'tl', ox: x-this.props.x1, oy: y-this.props.y1 } );           
      if(x>=x1m && y>=y1 && x<x2m && y<y1m) this.setState( { drag: 't', ox: 0, oy: y-this.props.y1 } );           
      if(x>=x2m && y>=y1 && x<x2 && y<y1m) this.setState( { drag: 'tr', ox: x-this.props.x2, oy: y-this.props.y1 } );           
      if(x>=x1 && y>=y1m && x<x1m && y<y2m) this.setState( { drag: 'l', ox: x-this.props.x1, oy: 0 } );           
      if(x>=x1m && y>=y1m && x<x2m && y<y2m) this.setState( { drag: 'm', ox: x-this.props.x1, oy: y-this.props.y1 } );           
      if(x>=x2m && y>=y1m && x<x2 && y<y2m) this.setState( { drag: 'r', ox: x-this.props.x2, oy: 0 } );           
      if(x>=x1 && y>=y2m && x<x1m && y<y2) this.setState( { drag: 'bl', ox: x-this.props.x1, oy: y-this.props.y2 } );           
      if(x>=x1m && y>=y2m && x<x2m && y<y2) this.setState( { drag: 'b', ox: 0, oy: y-this.props.y2 } );           
      if(x>=x2m && y>=y2m && x<x2 && y<y2) this.setState( { drag: 'br', ox: x-this.props.x2, oy: y-this.props.y2 } );           
    }
  }
  onMouseUp(e) {
    if(this.state.drag) {
      const b = this.newBounds(e);
      this.setState({drag: undefined});
      this.props.setSelection({
        x1: Math.min(b.x1, b.x2), 
        y1: Math.min(b.y1, b.y2), 
        x2: Math.max(b.x1, b.x2),
        y2: Math.max(b.y1, b.y2)
      });
      var moo = 1;
    }
  }

  onMouseMove(e) {
    const b = this.newBounds(e);
    if(b) this.props.setSelection(b);
  }
    
  newBounds(e) {
    if(!this.state.drag) return undefined;
    const {x: ex, y: ey} = this.mousePos(e);
    const x = ex-this.state.ox;
    const y = ey-this.state.oy;
    const w = this.props.x2-this.props.x1;
    const h = this.props.y2-this.props.y1;
    switch(this.state.drag) {
      case 'tl': return { x1: x, y1: y, x2: this.props.x2, y2: this.props.y2 };
      case 't': return { x1: this.props.x1, y1: y, x2: this.props.x2, y2: this.props.y2 };
      case 'tr': return { x1: this.props.x1, y1: y, x2: x, y2: this.props.y2 };
      case 'l': return { x1: x, y1: this.props.y1, x2: this.props.x2, y2: this.props.y2 };
      case 'm': return { x1: x, y1: y, x2: x+w, y2: y+h };
      case 'r': return { x1: this.props.x1, y1: this.props.y1, x2: x, y2: this.props.y2 };
      case 'bl': return { x1: x, y1: this.props.y1, x2: this.props.x2, y2: y };
      case 'b': return { x1: this.props.x1, y1: this.props.y1, x2: this.props.x2, y2: y };
      case 'br': return { x1: this.props.x1, y1: this.props.y1, x2: x, y2: y };
    }
    return undefined;
  }

  paperThing() {

    function selectBox(x1, y1, x2, y2, key) {
      const boxStyle = {
        position: 'absolute',
        border: '1px solid white',
        outline: '1px dashed black',
        outlineOffset: '-1px',
        top: y1+'px',
        left: x1+'px',
        width: (x2-x1-1)+'px',
        height: (y2-y1-1)+'px'
      };
      return (<div key={key} style={boxStyle}/>);
    }

    var contents = []
    
    if( this.props.x1 !== undefined ) {
      const {x1,y1,x2,y2,x1m,y1m,x2m,y2m} = this.selectBoxSections();

      contents.push(selectBox(x1, y1, x1m, y1m, 'tl'));
      contents.push(selectBox(x1m, y1, x2m, y1m, 't'));
      contents.push(selectBox(x2m, y1, x2, y1m, 'tr'));
      contents.push(selectBox(x1, y1m, x1m, y2m, 'l'));
      contents.push(selectBox(x1m, y1m, x2m, y2m, 'm'));
      contents.push(selectBox(x2m, y1m, x2, y2m, 'r'));
      contents.push(selectBox(x1, y2m, x1m, y2, 'bl'));
      contents.push(selectBox(x1m, y2m, x2m, y2, 'b'));
      contents.push(selectBox(x2m, y2m, x2, y2, 'br'));
    }

    return (
      <>
        <style>
          {".contentStateShareSelectBox>div {background-color: rgba(255,255,255,0.2); user-select: none;} .contentStateShareSelectBox>div:hover { background-color: rgba(255,255,255,0.5); }"}
        </style>
        <div
          ref={this.ref}
          className="contentStateShareSelectBox"
          style={{
            height: '100%', left: 0, position: 'absolute', top: 0, width: '100%',
          }}
          onMouseDown={this.onMouseDown}
          onMouseUp={this.onMouseUp}
          onMouseMove={this.onMouseMove}
        >{ contents }</div>
      </>
    );
  }

  render() {
    const { windowId } = this.props;
    this.OSDReference = OSDReferences.get(windowId).current;
    return (
      ReactDOM.createPortal(this.paperThing(), this.OSDReference.element)
    );
  }
}

ContentStateShareSelect.propTypes = {
//  svg: PropTypes.string,
  setSelection: PropTypes.func.isRequired,
  windowId: PropTypes.string.isRequired,
  x1: PropTypes.number,
  y1: PropTypes.number,
  x2: PropTypes.number,
  y2: PropTypes.number
};

ContentStateShareSelect.defaultProps = {
};

export default ContentStateShareSelect;
