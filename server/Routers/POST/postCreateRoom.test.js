const checkIfColorIsValid = (color) => {
  return ["red", "blue", "green", "yellow", "white"].includes(color);
};

test("check if a string has a valid color", () => {
  expect(checkIfColorIsValid("red")).toBe(true);
  expect(checkIfColorIsValid("purple")).toBe(false);
});
