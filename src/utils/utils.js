import moment from "moment";

function formatPhoneNumber(phoneNumberString) {
  var cleaned = ('' + phoneNumberString).replace(/\D/g, '');
  var match = cleaned.match(/^(1|)?(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    // eslint-disable-next-line
    var intlCode = (match[1] ? '+1 ' : '');
    return ['(', match[2], ') ', match[3], '-', match[4]].join('');
  }
  return null;
}

// Create our number formatter.
var currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',

  // These options are needed to round to whole numbers if that's what you want.
  //minimumFractionDigits: 0, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
  maximumFractionDigits: 0, // (causes 2500.99 to be printed as $2,501)
});

const relativeTime = (date) => {
  return moment(date, "DD-MMM-YYYY hh:mmA").fromNow();
};

const ShortenCurrencyFormatter = (number) => {
  if (number > 1000000000) {
    return "$" + (number / 1000000000).toString() + "B";
  } else if (number > 1000000) {
    return "$" + (number / 1000000).toString() + "M";
  } else if (number > 1000) {
    return "$" + (number / 1000).toString() + "K";
  } else {
    return "$" + number.toString();
  }
};

export { ShortenCurrencyFormatter, relativeTime, currencyFormatter, formatPhoneNumber }