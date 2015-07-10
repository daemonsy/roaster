var path = require('path');
var exec = require('child_process').exec;
var fs = require('fs');
var shell = require('shelljs')
var uuid = require('node-uuid');

var libreBinaryLocation = process.env.LIBRE_BINARY_LOCATION || '/Applications/LibreOffice.app/Contents/MacOS/soffice';
var port = process.env.PORT || 8888;
var tmpFolder = path.resolve('./tmp');


shell.mkdir(tmpFolder);

var express = require('express'),
    http = require('http'),
    compression = require('compression'),
    util        = require('util');
    multiparty = require('multiparty');

var app = express();

app.use(compression());

app.post('/convert', function(request, response) {
  var form = new multiparty.Form();
  form.parse(request, function(error, fields, files) {
    var fileUUID = uuid.v4();
    var document = files.document[0];
    var outputFileName = path.join(tmpFolder, fileUUID);
    shell.mv(document.path, outputFileName + ".tmp");

    exec(libreBinaryLocation + " --headless --convert-to pdf " + outputFileName + ".tmp" + " --outdir " + tmpFolder, function(error, output) {
      if (error) throw error;
      fs.readFile(outputFileName + ".pdf", function (error, data) {
        if (error) throw error;
        response.setHeader('Content-type', 'application/pdf');
        response.end(data);
      });
    });
  });
});

app.listen(port);
