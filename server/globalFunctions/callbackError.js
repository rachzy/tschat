const callbackError = (res, err) => {
  res.send({
    errors: [err],
    queryStatus: 500,
  });
};

module.exports = callbackError;
