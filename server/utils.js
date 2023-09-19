const fs = require("fs");

const handleSuccess = (res) => {
  res.status(200).contentType("text/plain").end();
};

const handleSuccessAndReturnToken = (res, token) => {
  res.status(200).contentType("text/plain").end(token);
};

const handleError = (err, res) => {
  res.status(500).contentType("text/plain").end(err);
};

function unlinksAndSuccess(files, res) {
  files.forEach((el) => {
    fs.unlink(el.path, (err) => {
      if (err) return handleError(err, res);
    });
  });
  handleSuccess(res);
}

function unlinksAndError(files, errorMsg, res) {
  files.forEach((el) => {
    fs.unlink(el.path, (err) => {
      if (err) return handleError(err, res);
    });
  });
  handleError(errorMsg, res);
}

function base64_encode(file) {
  // read binary data
  var bitmap = fs.readFileSync(file);
  // convert binary data to base64 encoded string
  return new Buffer(bitmap).toString("base64");
}

function removeExtFromName(picName) {
  const array = picName.split(".");
  array.pop();
  return array.length > 0 ? array.join(".") : picName;
}

function addPicturesToArray(files, array) {
  files.forEach((file) => {
    let fileObj = {};
    fileObj.name = removeExtFromName(file.originalname);
    fileObj.base64 = base64_encode(file.path);
    array.push(fileObj);
  });

  return array;
}

function removeValuesFromArray(values, array) {
  values
    .split(",")
    .sort(function (a, b) {
      return b - a;
    })
    .forEach((picture) => {
      array.splice(picture, 1);
    });

  return array;
}

module.exports = {
  handleSuccess,
  handleSuccessAndReturnToken,
  handleError,
  unlinksAndSuccess,
  unlinksAndError,
  base64_encode,
  removeExtFromName,
  addPicturesToArray,
  removeValuesFromArray,
};
