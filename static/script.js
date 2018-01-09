// This example creates a custom overlay called USGSOverlay, containing
// a U.S. Geological Survey (USGS) image of the relevant area on the map.

// Set the custom overlay object's prototype to a new instance
// of OverlayView. In effect, this will subclass the overlay class therefore
// it's simpler to load the API synchronously, using
// google.maps.event.addDomListener().
// Note that we set the prototype to an instance, rather than the
// parent class itself, because we do not wish to modify the parent class.

const IMG_SIZE = {
  width: 2048,
  height: 1150,
};

const WILNO_IMAGE_PIXEL_COORDS = {
  x: 1001,
  y: 188,
};

const WILNO_FRACTAL_COORDS = {
  x: WILNO_IMAGE_PIXEL_COORDS.x / IMG_SIZE.width,
  y: WILNO_IMAGE_PIXEL_COORDS.y / IMG_SIZE.height,
};

const KRAKOW_IMAGE_PIXEL_COORDS = {
  x: 584,
  y: 824,
};

const KRAKOW_FRACTAL_COORDS = {
  x: KRAKOW_IMAGE_PIXEL_COORDS.x / IMG_SIZE.width,
  y: KRAKOW_IMAGE_PIXEL_COORDS.y / IMG_SIZE.height,
};

const WILNO_KRAKOW_IMAGE_DISTANCE = {
  horizontal: WILNO_IMAGE_PIXEL_COORDS.x - KRAKOW_IMAGE_PIXEL_COORDS.x,
  vertical: KRAKOW_IMAGE_PIXEL_COORDS.y - WILNO_IMAGE_PIXEL_COORDS.y,
};

const WILNO_KRAKOW_LINEAR_IMAGE_DISTANCE = getLinearDistance(
  WILNO_KRAKOW_IMAGE_DISTANCE.horizontal,
  WILNO_KRAKOW_IMAGE_DISTANCE.vertical
);

const WILNO_LAT_LONG = {
  lat: 54.687300,
  long: 25.278854,
};

const KRAKOW_LAT_LONG = {
  lat: 50.061791,
  long: 19.937452
};

function getLinearDistance(a, b) {
  return Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2));
}

let overlay;
USGSOverlay.prototype = new google.maps.OverlayView();

// Initialize the map and the custom overlay.

function initMap() {
  const map = new google.maps.Map(document.getElementById('map'), {
    zoom: 6,
    center: { lat: 52.249322, lng: 19.203971 },
  });

  const bounds = new google.maps.LatLngBounds(
    new google.maps.LatLng(KRAKOW_LAT_LONG.lat, KRAKOW_LAT_LONG.long),
    new google.maps.LatLng(WILNO_LAT_LONG.lat, WILNO_LAT_LONG.long)
  );

  const srcImage = 'http://localhost:8888/images/polish-terrains-map.jpg';

  // The custom USGSOverlay object contains the USGS image,
  // the bounds of the image, and a reference to the map.
  overlay = new USGSOverlay(bounds, srcImage, map);
}

/** @constructor */
function USGSOverlay(bounds, image, map) {

  // Initialize all properties.
  this.bounds_ = bounds;
  this.image_ = image;
  this.map_ = map;

  // Define a property to hold the image's div. We'll
  // actually create this div upon receipt of the onAdd()
  // method so we'll leave it null for now.
  this.div_ = null;

  // Explicitly call setMap on this overlay.
  this.setMap(map);
}

/**
 * onAdd is called when the map's panes are ready and the overlay has been
 * added to the map.
 */
USGSOverlay.prototype.onAdd = function() {

  const div = document.createElement('div');
  div.style.borderStyle = 'none';
  div.style.borderWidth = '0px';
  div.style.position = 'absolute';

  // Create the img element and attach it to the div.
  const img = document.createElement('img');
  img.src = this.image_;
  img.style.width = '100%';
  img.style.height = '100%';
  img.style.position = 'absolute';
  img.style.opacity = '0.5';
  div.appendChild(img);

  this.div_ = div;

  // Add the element to the "overlayLayer" pane.
  const panes = this.getPanes();
  panes.overlayLayer.appendChild(div);
};

USGSOverlay.prototype.draw = function() {

  // We use the south-west and north-east
  // coordinates of the overlay to peg it to the correct position and size.
  // To do this, we need to retrieve the projection from the overlay.
  const overlayProjection = this.getProjection();

  // Retrieve the south-west and north-east coordinates of this overlay
  // in LatLngs and convert them to pixel coordinates.
  // We'll use these coordinates to resize the div.
  const sw = overlayProjection.fromLatLngToDivPixel(this.bounds_.getSouthWest());
  const ne = overlayProjection.fromLatLngToDivPixel(this.bounds_.getNorthEast());

  // Resize the image's div to fit the indicated dimensions.

  const wilnoKrakowVerticalMapDistance = sw.y - ne.y;
  const wilnoKrakowHorizontalMapDistance = ne.x - sw.x;
  const wilnoKrakowLinearMapDistance = getLinearDistance(wilnoKrakowVerticalMapDistance, wilnoKrakowHorizontalMapDistance);
  const scale = wilnoKrakowLinearMapDistance / WILNO_KRAKOW_LINEAR_IMAGE_DISTANCE;

  const imageWidthOnMap = IMG_SIZE.width * scale;
  const imageHeightOnMap = IMG_SIZE.height * scale;
  const imageXOnMap = ne.x - (WILNO_FRACTAL_COORDS.x * imageWidthOnMap);
  const imageYOnMap = ne.y - (WILNO_FRACTAL_COORDS.y * imageHeightOnMap);


  const div = this.div_;
  div.style.left = imageXOnMap + 'px';
  div.style.top = imageYOnMap + 'px';
  div.style.width = imageWidthOnMap + 'px';
  div.style.height = imageHeightOnMap + 'px';
};

// The onRemove() method will be called automatically from the API if
// we ever set the overlay's map property to 'null'.
USGSOverlay.prototype.onRemove = function() {
  this.div_.parentNode.removeChild(this.div_);
  this.div_ = null;
};

google.maps.event.addDomListener(window, 'load', initMap);
