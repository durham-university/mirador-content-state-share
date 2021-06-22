import mirador from 'mirador';

import contentStateSharePlugin from './ContentStateSharePlugin';
import contentStateShareCompanionWindow from './ContentStateShareCompanionWindow';

const miradorInstance = mirador.viewer({
  id: 'root',
  windows: [{
    view: 'single',
    loadedManifest: 'https://iiif.durham.ac.uk/manifests/trifle/32150/t1/m2/f7/t1m2f75r801v/manifest',
  }]
}, [
  contentStateSharePlugin,
  contentStateShareCompanionWindow,
]);

export default miradorInstance;
