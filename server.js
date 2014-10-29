var port = process.env.PORT || 8888;

var wkhtmltopdf = require('wkhtmltopdf'),
    io          = require('socket.io')();

io.on('connection', function(socket) {
  socket.on("render_pdf", function(data) {
    buffers = [];

    data.options["disableJavascript"] = true;
    content = "<html><body>" + data.content + "</body></html>";
    console.log(content);
    pdf = wkhtmltopdf(content, data.options);

    pdf.on('data', function(d) { buffers.push(d); });

    pdf.on('finish', function() {
      var buffer = Buffer.concat(buffers);
      socket.emit("rendered_pdf", { buffer: buffer });
    });
  });
});

io.listen(port);

console.log('Started listening on port ' + port);
