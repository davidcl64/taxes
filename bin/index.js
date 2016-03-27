var taxes = require("../lib");
var _     = require("lodash/fp");

var tests = [
  require('../test/fixtures/test1.json'),
  require('../test/fixtures/test2.json'),
  require('../test/fixtures/test3.json')
];

_.map(taxes.finalize())(tests);
