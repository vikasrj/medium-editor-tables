function extend(dest, source) {
    var prop;
    dest = dest || {};
    for (prop in source) {
        if (source.hasOwnProperty(prop) && !dest.hasOwnProperty(prop)) {
            dest[prop] = source[prop];
        }
    }
    return dest;
}

function getSelectionText(doc) {
    if (doc.getSelection) {
        return doc.getSelection().toString();
    }
    if (doc.selection && doc.selection.type !== 'Control') {
        return doc.selection.createRange().text;
    }
    return '';
}

function getSelectionStart(doc) {
    var tempNode = doc.getSelection().baseNode ? doc.getSelection().baseNode : doc.getSelection().anchorNode,
        node = $(tempNode).closest('td').find('li').length === 0 ? ($(tempNode).closest('td')[0]) : tempNode,
        startNode = (node && node.nodeType === 3 ? node.parentNode : node);

    return startNode;
}

function placeCaretAtNode(doc, node, before) {
    var isIE = /*@cc_on!@*/false || !!document.documentMode;
    if (doc.getSelection !== undefined && node) {
        if (!isIE) {
            var range = doc.createRange(),
                selection = doc.getSelection();

            if (before) {
                range.setStartBefore(node);
            } else {
                range.setStartAfter(node);
            }

            range.collapse(true);

            selection.removeAllRanges();
            selection.addRange(range);
        } else {
            var rangeObj = document.body.createTextRange();
            rangeObj.moveToElementText(node);
            rangeObj.moveStart('character', 0);
            rangeObj.collapse(true);
            rangeObj.select();
        }
    }
}

function isInsideElementOfTag(node, tag) {
    if (!node) {
        return false;
    }

    var parentNode = node.parentNode,
        tagName = parentNode.tagName.toLowerCase();

    while (tagName !== 'body') {
        if (tagName === tag) {
            return true;
        }
        parentNode = parentNode.parentNode;

        if (parentNode && parentNode.tagName) {
            tagName = parentNode.tagName.toLowerCase();
        } else {
            return false;
        }
    }

    return false;
}

function getParentOf(el, tagTarget) {
    var tagName = el && el.tagName ? el.tagName.toLowerCase() : false;

    if (!tagName) {
        return false;
    }
    while (tagName && tagName !== 'body') {
        if (tagName === tagTarget) {
            return el;
        }
        el = el.parentNode;
        tagName = el && el.tagName ? el.tagName.toLowerCase() : false;
    }
}
