var createVNode = require('virtual-dom/h');
var htmltree = require("htmltree");

module.exports = virtualHTML;

function virtualHTML (html, callback) {
  if (typeof html == 'function') html = html();

  htmltree(html, function (err, dom) {
    if (err) return callback(err);
    callback(undefined, vnode(dom.root[0]));
  });
}

function vnode (parent) {
  if (parent.type == "text") return parent.data;
  if (parent.type != "tag") return;

  var children;
  var child;
  var len;
  var i;

  if (parent.children.length) {
    children = [];
    len = parent.children.length;
    i = -1;

    while (++i < len) {
      child = vnode(parent.children[i]);
      if (!child) continue;
      children.push(child);
    }
  }

  if (parent.attributes.style) parent.attributes.style = style(parent.attributes.style);
  if (parent.attributes['class']) parent.attributes.className = parent.attributes['class'];

  parent.attributes.dataset = createDataSet(parent.attributes);

  return createVNode(parent.name, parent.attributes, children);
}

function style (raw) {
  if (!raw) return {};

  var result = {};
  var fields = raw.split(/;\s?/);
  var len = fields.length;
  var i = -1;
  var s;

  while (++i < len) {
    s = fields[i].indexOf(':');
    result[fields[i].slice(0, s)] = fields[i].slice(s + 1).trim();
  }

  return result;
}

function createDataSet (props) {
  var dataset;
  var key;

  for (key in props) {
    if (key.slice(0, 5) == 'data-') {
      dataset || (dataset = {});
      dataset[key.slice(5)] = props[key];
    }
  }

  return dataset;
}
