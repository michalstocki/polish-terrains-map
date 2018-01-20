'use strict';

const https = require('https');

module.exports.mapdata = (event, context, callback) => {
  const mapId = event.queryStringParameters.mid;
  const mapUrl = `https://www.google.com/maps/d/kml?forcekml=1&mid=${mapId}`;

  https.get(mapUrl, (res) => {
    const { statusCode } = res;

    res.setEncoding('utf8');
    let rawData = '';
    res.on('data', (chunk) => { rawData += chunk; });
    res.on('end', () => {
      const response = {
        statusCode,
        body: rawData + 'l>\n',
        headers: {
          'content-type': 'text/plain; charset=utf-8'
        }
      };

      callback(null, response);
    });
  }).on('error', (e) => {
    const response = {
      statusCode: 500,
      body: `Got error: ${e.message}`,
    };

    callback(null, response);
  });
};
