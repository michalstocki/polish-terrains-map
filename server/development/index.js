const http = require('http');
const fs = require('fs');
const path = require('path');
const mime = require('mime-types');

const server = http.createServer((request, response) => {
  console.log('request URL:', request.url);
  if (request.url === '/') {
    respondWithHTML(response);
  } else {
    respondWithStatic(request.url, response);
  }
});

function respondWithStatic(url, response) {
  fs.readFile(path.join(__dirname, `../../static${url}`), (err, data) => {
    if (err) {
      response.writeHead(404);
      response.end();
    } else {
      response.writeHead(200, {
        'Content-Type': mime.contentType(path.extname(url)),
      });
      response.end(data);
    }
  });
}

function respondWithHTML(response) {
  response.writeHead(200, {
    'Content-Type': 'text/html',
  });
  fs.readFile(path.join(__dirname, '../../static/index.html'), (err, data) => {
    if (err) throw err;
    response.end(data);
  });
}

server.listen(8888);
console.log('Server running at http://0.0.0.0:8888/');
