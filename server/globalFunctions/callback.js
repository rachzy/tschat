//Default callback

const callback = (res, result) => {
  res.send({
    result: result,
    queryStatus: 200,
  });
};

module.exports = callback;
