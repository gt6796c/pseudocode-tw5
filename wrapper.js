/*\
title: $:/plugins/gt6796c/pseudocode-tw5/wrapper.js
type: application/javascript
module-type: widget

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";
     var uniqueID = 1;

    var Widget = require("$:/core/modules/widgets/widget.js").widget;
    var Rocklib = require("$:/plugins/gt6796c/rocklib/widget-tools.js").rocklib;
    if ($tw.browser && !window.pseudocode) {
        window.rocklib = new Rocklib();
        window.pseudocode = require("$:/plugins/gt6796c/pseudocode-tw5/pseudocode.js");
    }


    var PseudocodeWidget = function(parseTreeNode, options) {
        this.initialise(parseTreeNode, options);
    };

    PseudocodeWidget.prototype = new Widget();

    /*
     Render this widget into the DOM
     */
    PseudocodeWidget.prototype.render = function(parent,nextSibling) {
        this.parentDomNode = parent;
        this.computeAttributes();
        this.execute();

        var tag = 'pseudocode';
        var scriptBody = rocklib.getScriptBody(this,"text");
        var divNode = rocklib.getCanvas(this,tag);
        try {
            var options = {}; // lineNumber: true};
            rocklib.getOptions(this, tag, options);
            var prolog = "\\begin{algorithm}\n"
            console.error(options['caption'])
            if (options['caption'])
              prolog += "\\caption{" + options['caption'] + "}\n"
            prolog += "\\begin{algorithmic}"
            var postlog ="\\end{algorithmic}\n\\end{algorithm}"
            pseudocode.render(prolog + scriptBody + postlog, divNode, options);
        }
        catch(ex)
        {
            divNode.innerText = ex;
        }
        parent.insertBefore(divNode, nextSibling);

        this.domNodes.push(divNode);
    };

    PseudocodeWidget.prototype.execute = function() {
        // Nothing to do
    };

    /*
     Selectively refreshes the widget if needed. Returns true if the widget or any of its children needed re-rendering
     */
    PseudocodeWidget.prototype.refresh = function(changedTiddlers) {
        return false;
    };

    exports.pseudocode = PseudocodeWidget;

})();
