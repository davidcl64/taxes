var EXEMPTIONS = {
  book:     true,
  food:     true,
  medical:  true
};

function isExempt(item)     { return EXEMPTIONS[item.class] || false; }
function isDutyExempt(item) { return !item.imported; }

module.exports.EXEMPTIONS   = EXEMPTIONS;
module.exports.isExempt     = isExempt;
module.exports.isDutyExempt = isDutyExempt;

