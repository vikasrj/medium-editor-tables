function Table(editor) {
    return this.init(editor);
}

var TAB_KEY_CODE = 9;

Table.prototype = {
    init: function (editor) {
        this._editor = editor;
        this._doc = this._editor.options.ownerDocument;
        this._bindTabBehavior();
    },

    insert: function (rows, cols) {
        var html = this._html(rows, cols);

        this._editor.pasteHTML(
            '<table class="medium-editor-table table-resizable" id="medium-editor-table"' +
            ' width="100%">' +
            '<tbody id="medium-editor-table-tbody">' +
            html +
            '</tbody>' +
            '</table>', {
                cleanAttrs: [],
                cleanTags: []
            }
        );

        var table = this._doc.getElementById('medium-editor-table'),
            tbody = this._doc.getElementById('medium-editor-table-tbody');
        if (0 === $(table).find('#medium-editor-table-tbody').length) {
            //Edge case, where tbody gets appended outside table tag
            $(tbody).detach().appendTo(table);
        }
        tbody.removeAttribute('id');
        table.removeAttribute('id');
        placeCaretAtNode(this._doc, table.querySelector('td'), true);

        //Resize stuff code here;
        var _this = this,
            newTableObject = $('.table-resizable').not('.ui-resizable');
        $(newTableObject).resizable({
            resize: function (event, element) {
                _this._editor.trigger('editableInput');
            }
        });

        this._editor.trigger('domUpdated', 'table_added');
        this._editor.trigger('focusEditor', this);
        this._editor.checkSelection();
    },

    _html: function (rows, cols) {
        var html = '',
            x, y,
            text = getSelectionText(this._doc);

        if (!text) {
            text = '<br />';
        }
        for (x = 0; x <= rows; x++) {
            html += '<tr>';
            for (y = 0; y <= cols; y++) {
                html += '<td>' + (x === 0 && y === 0 ? text : '<br />') + '</td>';
            }
            html += '</tr>';
        }
        return html;
    },

    _bindTabBehavior: function () {
        var self = this;
        [].forEach.call(this._editor.elements, function (el) {
            el.addEventListener('keydown', function (e) {
                self._onKeyDown(e);
            });
        });
    },

    _onKeyDown: function (e) {
        var el = getSelectionStart(this._doc),
            table;

        if (e.which === TAB_KEY_CODE && isInsideElementOfTag(el, 'table')) {
            e.preventDefault();
            e.stopPropagation();
            table = this._getTableElements(el);
            if (!e.shiftKey) {
                if (this._isLastCell(el, table.row, table.root)) {
                    var p = this._doc.createElement('p');
                    p.innerHTML = '<br>';
                    var node = getParentOf(el, 'table');
                    $(node).after(p);
                    e.preventDefault();
                    placeCaretAtNode(this._doc, node);
                    MediumEditor.selection.moveCursor(this._doc, node.nextSibling);
                } else {
                    this._tabForwords(el, table.row);
                }
            }
        }
    },

    _getTableElements: function (el) {
        return {
            cell: getParentOf(el, 'td'),
            row: getParentOf(el, 'tr'),
            root: getParentOf(el, 'table')
        };
    },

    _tabForwords: function (el, row) {
        var isIE = /*@cc_on!@*/false || !!document.documentMode,
        isFirefox = typeof InstallTrigger !== 'undefined',
        isChrome = !!window.chrome && !!window.chrome.webstore;
        if (isIE) {
            if (this._isLastCellOfRow(el, row)) {
                el = row.nextSibling.firstChild;
                placeCaretAtNode(this._doc, el);
            } else {
                placeCaretAtNode(this._doc, el.nextSibling);
            }
        } else if (isFirefox) {
            if (this._isLastCellOfRow(el, row)) {
                el = row.nextSibling.firstChild;
                placeCaretAtNode(this._doc, el);
                MediumEditor.selection.moveCursor(this._doc, el);
            } else {
                placeCaretAtNode(this._doc, el);
                MediumEditor.selection.moveCursor(this._doc, el.nextSibling);
            }
        } else {
            placeCaretAtNode(this._doc, el);
        }
    },

    _tabBackwards: function (el, row) {
        el = el || this._getPreviousRowLastCell(row);
        placeCaretAtNode(this._doc, el, true);
    },

    _insertRow: function (tbody, cols) {
        var tr = document.createElement('tr'),
            html = '',
            i;

        for (i = 0; i < cols; i += 1) {
            html += '<td><br /></td>';
        }
        tr.innerHTML = html;
        tbody.appendChild(tr);
    },

    _isLastCell: function (el, row, table) {
        return (
          (row.cells.length - 1) === el.cellIndex &&
          (table.rows.length - 1) === row.rowIndex
        );
    },

    _isLastCellOfRow: function (el, row) {
        return (row.cells.length - 1) === el.cellIndex;
    },

    _getPreviousRowLastCell: function (row) {
        row = row.previousSibling;
        if (row) {
            return row.cells[row.cells.length - 1];
        }
    }
};
