var fs = require('fs');
var page = require('webpage').create();
var system = require('system');
var homeUrl = 'https://www.facebook.com/';
var createPageUrl = 'https://www.facebook.com/pages/create/';

var auth = {
  email: system.args[1],
  pass: system.args[2]
};

var outputFile = system.args[3] || './data.json';

console.log('');

page.onLoadFinished = function (status) {
  if (status !== 'success') {
    console.log('  無法開啟 ' + page.url);
    console.log('');
    phantom.exit();
    return;
  }

  if (page.url === homeUrl) {
    if (logined()) {
      login();
    } else {
      page.open(createPageUrl);
    }
    return;
  }

  var json = parse();

  console.log('  save file');
  fs.write(outputFile, json, 'w');

  console.log('');
  phantom.exit();
};

page.open(homeUrl);

function logined() {
  var res = page.evaluate(function () {
    return document.querySelector('#login_form') ? 'yes' : '';
  });
  return Boolean(res);
}

function login() {
  console.log('  login');
  page.evaluate(function (email, pass) {
    var login = document.querySelector('#login_form');
    var emailInput = login.querySelector('[name="email"]');
    var passInput = login.querySelector('[name="pass"]');

    emailInput.value = email;
    passInput.value = pass;

    login.submit();
  }, auth.email, auth.pass);
}

function parse() {
  console.log('  parse');
  return page.evaluate(function () {
    var queryAll = function (el, selector) {
      var list = el.querySelectorAll(selector);
      return Array.prototype.slice.call(list);
    };

    var boxes = queryAll(document, '.tall_box');
    var selectors = queryAll(document, '#category');
    var data = {};

    // 最後一個 box 沒有 select
    boxes.pop();

    boxes.forEach(function (box, index) {
      var options = queryAll(selectors[index], 'option');
      data[box.id] = options.map(function (option) {
        return {
          label: option.textContent,
          value: option.value
        };
      });
    });

    return JSON.stringify(data);
  });
}
