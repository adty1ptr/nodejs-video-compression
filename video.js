const fs = require("fs");
const ffmpeg = require("fluent-ffmpeg");
var readline = require('readline');
var progress = 0;

function printProgress(prg){
  // process.stdout.clearLine();
  // process.stdout.cursorTo(0);
  // process.stdout.write(progress + '%');
  // readline.clearLine(process.stdout);
  console.log(`waiting ... ${prg}%`);
  // readline.cursorTo(process.stdout, 0);
  // process.stdout.write(`waiting ... ${prg}%`);
}

process.on("message", (payload) => {
  const { tempFilePath, name } = payload;

  const endProcess = (endPayload) => {
    const { statusCode, text } = endPayload;
    // Remove temp file
    fs.unlink(tempFilePath, (err) => {
      if (err) {
        process.send({ statusCode: 500, text: err.message });
      }
    });
    // Format response so it fits the api response
    process.send({ statusCode, text });
    // End process
    process.exit();
  };

  // Process video and send back the result
  ffmpeg(tempFilePath)
    .fps(20)
    .videoBitrate('256k')
    .audioBitrate(128)
    .on('progress', function(data) {
      // let p = (Math.round(data.percent * 100) / 100);
      let p = Math.round(data.percent);
      if (progress == 0) {
        console.log("start processing ...");
        progress = 1;
      }
      if (p != progress) {
        if (p == 2 || p == 5 || p == 10 || p == 20 || p == 30 || p == 40 || p == 50 || p == 60 || p == 70 || p == 80 || p == 90 || p == 99) {
          printProgress(p);
          progress = p;
        }
      }
    })
    .on("end", () => {
      endProcess({ statusCode: 200, text: "Success" });
    })
    .on("error", (err) => {
      endProcess({ statusCode: 500, text: err.message });
    })
    .save(`./temp/${name}`);
});
