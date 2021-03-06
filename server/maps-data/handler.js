'use strict';

const https = require('https');

module.exports.mapdata = (event, context, callback) => {
  const mapId = event.queryStringParameters.mid;
  const mapUrl = `https://www.google.com/maps/d/kml?forcekml=1&mid=${mapId}`;

  https.get(mapUrl, (res) => {

    res.setEncoding('utf-8');
    const rawData = [];
    res.on('data', (chunk) => { rawData.push(chunk); });
    res.on('end', () => {
      const collectedData = rawData.join('');
      const fixedKML = collectedData.replace(/\n<\/km$/, '\n</kml>\n');
      const response = {
        statusCode: 200,
        body: fixedKML ,
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
