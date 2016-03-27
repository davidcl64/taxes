
var exemptions = require('./exemptions');
var taxRate    = 10;
var importDuty =  5;
var _          = require('lodash/fp');
var sprintf    = require('sprintf-js').sprintf;
var debug      = require('debug')('taxes');
var tapDebug   = _.tap(debug);

function tax(name, rate, isTaxed) {
  return function(item) {
    var finalTax = 0;
    if(!isTaxed(item)) {
      debug('raw %s: %s', name, (item.price * item.qty * rate) / 100);
      finalTax = (5 * Math.ceil((item.price * item.qty * rate) / 5)) / 100;
    }

    return _.merge(item)(_.set(name, finalTax)({}));
  };
}

var salesTax  = tax('salesTax', taxRate,    exemptions.isExempt);
var importTax = tax('duty',     importDuty, exemptions.isDutyExempt);

function formatItem(item) {
  var total = item.price + item.salesTax + item.duty;
  return sprintf(item.fmt, item.qty, item.name + ':', parseFloat(total).toFixed(2));
}

function printItem(item) {
  var item = formatItem(item);
  console.log(item);
  return item;
}

var sumTaxes = _.reduce(function(sum, item) {
  return (sum * 100 + item.salesTax * 100 + item.duty * 100)/100;
}, 0.00);

var total = _.reduce(function(sum, item) {
  return (sum * 100 + item.price * 100)/100;
}, 0.00);

// Pushes item onto a new copy of items
function addItem(items, name, sumFn) {
  return items.slice(0).concat([{
    qty:      '',
    name:     name,
    price:    sumFn(items),
    salesTax: 0,
    duty:     0
  }]);
}

function maxLengths(items) {
  return _.reduce(function(max, item) {
    max.qty   = Math.max(max.qty,   String(item.qty).length);
    max.name  = Math.max(max.name,  (item.name || '').length);
    max.price = Math.max(max.price, String(parseFloat(item.price).toFixed(2)).length)

    return max;
  }, { qty: 0, name: 0, price: 0 })(items);
}

function format(items) {
  var lengths = maxLengths(items);

  var fmt = "%" + (lengths.qty + 2) + "s  %-" + (lengths.name + 1) + "s  %" + lengths.price + "s";

  return _.map(_.merge({fmt: fmt}))(items);
}

var calcTaxes   = _.flow(salesTax, tapDebug, importTax, tapDebug);
var addTax      = function(items) { return addItem(items, 'Sales Taxes', sumTaxes); };
var addTotal    = function(items) { return addItem(items, 'Total',       total); };
var linefeed    = function(arg)   { console.log(); return arg; };
var noLinefeed  = function(arg)   { return arg; };

var finalize    = function(printer, lf) {
  return _.flow(
    _.map(calcTaxes),
    tapDebug,
    addTax,
    addTotal,
    tapDebug,
    format,
    _.map(printer || printItem),
    lf || linefeed);
};

module.exports = exports = {
  _: {
    salesTax:   salesTax,
    importTax:  importTax,
    sumTaxes:   sumTaxes,
    total:      total,
    addItem:    addItem,
    maxLengths: maxLengths,
    format:     format,
    calcTaxes:  calcTaxes,
    addTax:     addTax,
    formatItem: formatItem,
    printItem:  printItem,
    linefeed:   linefeed,
    noLinefeed: noLinefeed
  },

  finalize: finalize
};



