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
    if(files && !files.document || !files.document.length) {
      response.sendStatus(422);
      response.end("No Document");
    };
    var document = files.document[0];

    var uniquePath = path.join(tmpFolder, fileUUID);

    shell.cp(document.path, uniquePath + ".tmp");
    var docPath = uniquePath + ".tmp";

    exec(libreBinaryLocation + " --headless --convert-to pdf " +  docPath + " --outdir " + tmpFolder, function(error) {
      if (error)  {
        response.sendStatus(422);
        response.end("Error during Conversion");
      }

      var pdfFileName = uniquePath + ".pdf";
      response.sendFile(pdfFileName);
    });
  });
});

app.listen(port, function() {
  console.log("Roasting cashews on port", port);
});
