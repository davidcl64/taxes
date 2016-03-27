'use strict';
var chai   = require('chai');
var expect = chai.expect;
var taxes  = require('../lib');
var _      = require('lodash/fp');

describe('trains', function () {
  /*jshint -W030 */ // Allow chai stuff like '...to.exist;'

  var tests = [
    require('./fixtures/test1.json'),
    require('./fixtures/test2.json'),
    require('./fixtures/test3.json')
  ];

  var desiredResults = [
    [ { qty: '1', name: 'book:',                       price: '12.49'  },
      { qty: '1', name: 'music CD:',                   price: '16.49'  },
      { qty: '1', name: 'chocolate bar:',              price:  '0.85'  },
      { qty: '',  name: 'Sales Taxes:',                price:  '1.50'  },
      { qty: '',  name: 'Total:',                      price: '29.83'  } ],

    [ { qty: '1', name: 'imported box of chocolates:', price: '10.50'  },
      { qty: '1', name: 'imported bottle of perfume:', price: '54.65'  },
      { qty: '',  name: 'Sales Taxes:',                price:  '7.65'  },
      { qty: '',  name: 'Total:',                      price: '65.15'  } ],

    [ { qty: '1', name: 'imported bottle of perfume:', price: '32.19'  },
      { qty: '1', name: 'bottle of perfume:',          price: '20.89'  },
      { qty: '1', name: 'packet of headache pills:',   price:  '9.75'  },
      { qty: '1', name: 'box of imported chocolates:', price: '11.85'  },
      { qty: '',  name: 'Sales Taxes:',                price:  '6.70'  },
      { qty: '',  name: 'Total:',                      price: '74.68'  } ]
  ];

  var formatOnly = taxes._.formatItem;
  var skipLF     = taxes._.noLinefeed;

  describe('coding challenge questions', function() {
    tests.forEach(function(test, idx) {
      describe('test ' + (idx + 1), function() {
        var expected = desiredResults[idx];
        var output, parsedOut;

        // Parse the actual line output so we can compare it to expected values later
        function parseLine(line) {
          return {
            qty:    (line.match(/(?:^|\s)([0-9]+)(?:$|\s)/) || [''])[0].trim(),
            name:   (line.match(/[a-zA-Z:]+( [a-zA-Z:]+)*/) || ['NO MATCH!'])[0].trim(),
            price:  (line.match(/([0-9\.]*)$/) || ['NO MATCH!'])[0]
          };
        }

        before(function() {
          output = taxes.finalize(formatOnly, skipLF)(tests[idx]);
          parsedOut = _.map(parseLine)(output);
        });

        it('should have the same number of line items', function() {
          expect(expected.length).to.equal(output.length);
        });

        it('should have the right output', function() {
          parsedOut.forEach(function(line, idx) {
            expect(expected[idx].qty,   'quantity').to.equal(line.qty);
            expect(expected[idx].name,  'name').to.equal(line.name);
            expect(expected[idx].price, 'price').to.equal(line.price);
          });
        });
      });
    });
  });

});
