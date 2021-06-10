import React, { Component } from 'react';
import CompanionWindow from 'mirador/dist/es/src/containers/CompanionWindow';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import SvgIcon from '@material-ui/core/SvgIcon';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import * as actions from 'mirador/dist/es/src/state/actions';
import { UnfoldLess } from '@material-ui/icons';
import ContentStateShareSelect from './ContentStateShareSelect';
import { OSDReferences } from 'mirador/dist/es/src/plugins/OSDReferences';
import OpenSeadragon from 'openseadragon';
import { getManifestoInstance } from 'mirador/dist/es/src/state/selectors/manifests';
import { getVisibleCanvases } from 'mirador/dist/es/src/state/selectors/canvases';

class ContentStateShareCompanionWindow extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selection: undefined
    };
    this.setSelection = this.setSelection.bind(this);
    this.clearSelection = this.clearSelection.bind(this);
  }

  componentDidMount() {
    const { windowId } = this.props;
    this.OSDReference = OSDReferences.get(windowId);
  }
  
  toViewport(x,y) {
    const viewport = this.OSDReference.current.viewport;
    return viewport.viewportToImageCoordinates(viewport.pointFromPixel(new OpenSeadragon.Point(x,y)));
  }

  clearSelection() {
    this.setSelection(undefined);
  }

  setSelection(selection) {
    if(!selection) {
      this.setState({selection_screen: undefined, selection: undefined});
    }
    else {
      const { x1, y1, x2, y2 } = selection;
      const { x: vx1, y: vy1} = this.toViewport(x1, y1);
      const { x: vx2, y: vy2} = this.toViewport(x2, y2);
      this.setState(
        {
          selection_screen: { x1, y1, x2, y2},
          selection: { x: Math.round(vx1), y: Math.round(vy1), w: Math.round(vx2-vx1), h: Math.round(vy2-vy1)}
        });
    }
  }

  contentStateJson({ manifestUri, canvasUri, xywh, linkText }) {
    if(typeof(xywh) == 'object') {
      const {x,y,w,h} = xywh;
      xywh = `${x},${y},${w},${h}`;
    }
    const manifestJson = {
      "id": manifestUri,
      "type":"Manifest"
    };
    if(canvasUri) {
      const canvasJson = {
        "id": canvasUri + (xywh ? ("#xywh="+xywh) : ""), 
        "type":"Canvas", 
        "partOf": manifestJson
      }
      if(xywh) {
        var json = {
          "@context": "http://iiif.io/api/presentation/0/context.json", 
          "id": canvasUri+"_xywh_"+xywh, 
          "type": "Annotation", 
          "motivation": ["contentState"], 
          "target": canvasJson
        };
        if(linkText) {
          json["resource"] = {
            "type": "dctypes:Text", 
            "format":"text/plain", 
            "chars": linkText
          };
        }          
        return json;
      }
      else return canvasJson;
    }
    else return manifestJson;
  }

  encodeContentState(s) {
    if(typeof(s) == 'object') s = JSON.stringify(s);
    return btoa(encodeURI(s)).replaceAll('+','-').replaceAll('/','_').replaceAll('=','');
  }

  fullCanvasUrl() {
    if(!this.props.canvases) return undefined;
    const canonicalUrl = this.props.canvases[0].getCanonicalImageUri();
    return canonicalUrl.replace(/\/full\/[^\/]+\/0\//,`/full/full/0/`);
  }

  croppedCanvasUrl({x, y, w, h}) {
    if(!this.props.canvases) return undefined;
    const canonicalUrl = this.props.canvases[0].getCanonicalImageUri();
    return canonicalUrl.replace(/\/full\/[^\/]+\/0\//,`/${x},${y},${w},${h}/full/0/`);
  }

  copyToClipboard(content_) {
    const content = typeof(content_) == 'object' ? content_ : {'text/plain': content_};
    return (e => {
      function listener(e) { 
        e.clipboardData.clearData();        
        for( var type in content ){
          e.clipboardData.setData(type, content[type]);
        }
        e.preventDefault();
      }
      document.addEventListener("copy", listener);
      document.execCommand("copy");
      document.removeEventListener("copy", listener);  
    });
  }

  render() {
    const { closeCompanionWindow, id, windowId } = this.props;
    const { selection: sel } = this.state;
    const { x1, y1, x2, y2 } = this.state.selection_screen || {};

//         <ContentStateShareSelect updateGeometry={this.updateGeometry} windowId={windowId} svg={svg}/>
    const copyIcon = (<SvgIcon xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#000000"><path d="M0 0h24v24H0z" fill="none"/><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></SvgIcon>);

    const pageUri = window.location.href.replace(/[?#].*$/,'');
    const manifestUri = this.props.manifestId;
    const canvasUri = this.props.canvases && this.props.canvases.length > 0 ? this.props.canvases[0].id : undefined;
    const contentStateJson = JSON.stringify(this.contentStateJson({ manifestUri, canvasUri, xywh: sel, linkText: "Link target"}));
    const contentStateEncoded = this.encodeContentState(contentStateJson);
    const contentStateUrl = `${pageUri}?iiif-content=${contentStateEncoded}`;
    const imageUrl = sel ? this.croppedCanvasUrl(sel) : this.fullCanvasUrl();
    const htmlEmbed = `<a href="${contentStateUrl}"><img src="${imageUrl}" /></a>`;
    const markdownEmbed = `[![](${imageUrl})](${contentStateUrl})`;

//    { sel && (<Grid item xs={12}><IconButton aria-label="copy">{copyIcon}</IconButton>XYWH={sel.x},{sel.y},{sel.w},{sel.h}</Grid>) }
    return (
      <CompanionWindow title='Sharing' windowId={windowId} id={id}>
        <ContentStateShareSelect windowId={windowId} setSelection={this.setSelection} x1={x1} y1={y1} x2={x2} y2={y2}/>
        <Grid container spacing={2}>
          { sel ? (<Grid item xs={12}><Button onClick={this.clearSelection}>Clear selection</Button></Grid>) : ""}
          <Grid item xs={12}><IconButton onClick={this.copyToClipboard(contentStateUrl)} aria-label="copy link">{copyIcon}</IconButton><a href={contentStateUrl}>{sel ? "Link to selection" : "Link to canvas"}</a></Grid>
          <Grid item xs={12}><IconButton onClick={this.copyToClipboard(manifestUri)} aria-label="copy manifest file">{copyIcon}</IconButton><a href={manifestUri}>Manifest file</a></Grid>
          <Grid item xs={12}><IconButton onClick={this.copyToClipboard(imageUrl)} aria-label="copy cropped image">{copyIcon}</IconButton><a href={imageUrl} target="_blank">{sel ? "Cropped image" : "Full image"}</a></Grid>
          <Grid item xs={12}><IconButton onClick={this.copyToClipboard({"text/html": htmlEmbed, "text/plain": htmlEmbed})} aria-label="copy HTML embed">{copyIcon}</IconButton>HTML embed</Grid>
          <Grid item xs={12}><IconButton onClick={this.copyToClipboard({"text/markdown": markdownEmbed, "text/x-markdown": markdownEmbed, "text/plain": markdownEmbed})} aria-label="copy markdown embed">{copyIcon}</IconButton>Markdown embed</Grid>
          <Grid item xs={12}><IconButton onClick={this.copyToClipboard(contentStateJson)} aria-label="copy content State JSON">{copyIcon}</IconButton>Content State JSON</Grid>
          <Grid item xs={12}><IconButton onClick={this.copyToClipboard(contentStateEncoded)} aria-label="copy content State encoded">{copyIcon}</IconButton>Content State encoded</Grid>
          <Grid item xs={12}><Button onClick={closeCompanionWindow}>Close</Button></Grid>
        </Grid>
      </CompanionWindow>
    );
  }
}

ContentStateShareCompanionWindow.propTypes = {
  closeCompanionWindow: PropTypes.func,
  id: PropTypes.string.isRequired,
  windowId: PropTypes.string.isRequired,
};

ContentStateShareCompanionWindow.defaultProps = {
  closeCompanionWindow: () => {},
};

const mapDispatchToProps = (dispatch, { id, windowId }) => ({
  closeCompanionWindow: () => dispatch(
    actions.removeCompanionWindow(windowId, id),
  )
});

function mapStateToProps(state, { windowId } ) {
  return {
    config: state.config,
    manifestId: getManifestoInstance(state, { windowId }).id,
    canvases: getVisibleCanvases(state, { windowId })
  };
}

export default {
  companionWindowKey: 'content-state-sharing',
  component: ContentStateShareCompanionWindow, // TODO: could add withStyles
  mapDispatchToProps,
  mapStateToProps
}