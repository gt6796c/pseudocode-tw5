(function (e) {
    if (typeof exports === "object" && typeof module !== "undefined") {
        module.exports = e()
    } else if (typeof define === "function" && define.amd) {
        define([], e)
    } else {
        var t;
        if (typeof window !== "undefined") {
            t = window
        } else if (typeof global !== "undefined") {
            t = global
        } else if (typeof self !== "undefined") {
            t = self
        } else {
            t = this
        }
        t.pseudocode = e()
    }
})(function () {
    var e, t, n;
    return function i(e, t, n) {
        function r(s, a) {
            if (!t[s]) {
                if (!e[s]) {
                    var l = typeof require == "function" && require;
                    if (!a && l)return l(s, !0);
                    if (o)return o(s, !0);
                    var h = new Error("Cannot find module '" + s + "'");
                    throw h.code = "MODULE_NOT_FOUND", h
                }
                var p = t[s] = {exports: {}};
                e[s][0].call(p.exports, function (t) {
                    var n = e[s][1][t];
                    return r(n ? n : t)
                }, p, p.exports, i, e, t, n)
            }
            return t[s].exports
        }

        var o = typeof require == "function" && require;
        for (var s = 0; s < n.length; s++)r(n[s]);
        return r
    }({
        1: [function (e, t, n) {
            var i = e("./src/ParseError");
            var r = e("./src/Lexer");
            var o = e("./src/Parser");
            var s = e("./src/Renderer");
            t.exports = {
                ParseError: i, renderToString: function (e, t) {
                    if (e === null || e === undefined)throw"input cannot be empty";
                    var n = new r(e);
                    var i = new o(n);
                    var a = new s(i, t);
                    return a.toMarkup()
                }, render: function (e, t, n) {
                    if (e === null || e === undefined)throw"input cannot be empty";
                    var i = new r(e);
                    var a = new o(i);
                    var l = new s(a, n);
                    var h = l.toDOM();
                    if (t)t.appendChild(h);
                    return h
                }
            }
        }, {"./src/Lexer": 2, "./src/ParseError": 3, "./src/Parser": 4, "./src/Renderer": 5}], 2: [function (e, t, n) {
            var i = e("./utils");
            var r = e("./ParseError");
            var o = function (e) {
                this._input = e;
                this._remain = e;
                this._pos = 0;
                this._nextAtom = this._currentAtom = null;
                this._next()
            };
            o.prototype.accept = function (e, t) {
                if (this._nextAtom.type === e && this._matchText(t)) {
                    this._next();
                    return this._currentAtom.text
                }
                return null
            };
            o.prototype.expect = function (e, t) {
                var n = this._nextAtom;
                if (n.type !== e)throw new r("Expect an atom of " + e + " but received " + n.type, this._pos, this._input);
                if (!this._matchText(t))throw new r("Expect `" + t + "` but received `" + n.text + "`", this._pos, this._input);
                this._next();
                return this._currentAtom.text
            };
            o.prototype.get = function () {
                return this._currentAtom
            };
            var s = {
                exec: function (e) {
                    var t = [{start: "$", end: "$"}, {start: "\\(", end: "\\)"}];
                    var n = e.length;
                    for (var i = 0; i < t.length; i++) {
                        var o = t[i].start;
                        if (e.indexOf(o) !== 0)continue;
                        var s = t[i].end;
                        var a = o.length;
                        var l = e.slice(a);
                        while (a < n) {
                            var h = l.indexOf(s);
                            if (h < 0)throw new r("Math environment is not closed", this._pos, this._input);
                            if (h > 0 && l[h - 1] === "\\") {
                                var p = h + s.length;
                                l = l.slice(p);
                                a += p;
                                continue
                            }
                            var u = [e.slice(0, a + h + s.length), e.slice(o.length, a + h)];
                            return u
                        }
                    }
                    return null
                }
            };
            var a = {
                special: /^(\\\\|\\{|\\}|\\\$|\\&|\\#|\\%|\\_)/,
                math: s,
                func: /^\\([a-zA-Z]+)/,
                open: /^\{/,
                close: /^\}/,
                quote: /^(`|``|'|'')/,
                ordinary: /^[^\\{}$&#%_\s]+/
            };
            var l = /^%.*/;
            var h = /^\s+/;
            o.prototype._skip = function (e) {
                this._pos += e;
                this._remain = this._remain.slice(e)
            };
            o.prototype._next = function () {
                var e = false;
                while (1) {
                    var t = h.exec(this._remain);
                    if (t) {
                        e = true;
                        var n = t[0].length;
                        this._skip(n)
                    }
                    var i = l.exec(this._remain);
                    if (!i)break;
                    var o = i[0].length;
                    this._skip(o)
                }
                this._currentAtom = this._nextAtom;
                if (this._remain === "") {
                    this._nextAtom = {type: "EOF", text: null, whitespace: false};
                    return false
                }
                for (var s in a) {
                    var p = a[s];
                    var u = p.exec(this._remain);
                    if (!u)continue;
                    var c = u[0];
                    var f = u[1] ? u[1] : c;
                    this._nextAtom = {type: s, text: f, whitespace: e};
                    this._pos += c.length;
                    this._remain = this._remain.slice(u[0].length);
                    return true
                }
                throw new r("Unrecoganizable atom", this._pos, this._input)
            };
            o.prototype._matchText = function (e) {
                if (e === null || e === undefined)return true;
                if (i.isString(e))return e.toLowerCase() === this._nextAtom.text.toLowerCase(); else {
                    e = e.map(function (e) {
                        return e.toLowerCase()
                    });
                    return e.indexOf(this._nextAtom.text.toLowerCase()) >= 0
                }
            };
            t.exports = o
        }, {"./ParseError": 3, "./utils": 6}], 3: [function (e, t, n) {
            function i(e, t, n) {
                var i = "Error: " + e;
                if (t !== undefined && n !== undefined) {
                    i += " at position " + t + ": `";
                    n = n.slice(0, t) + "↱" + n.slice(t);
                    var r = Math.max(0, t - 15);
                    var o = t + 15;
                    i += n.slice(r, o) + "`"
                }
                this.message = i
            }

            i.prototype = Object.create(Error.prototype);
            i.prototype.constructor = i;
            t.exports = i
        }, {}], 4: [function (e, t, n) {
            var i = e("./utils");
            var r = function (e, t) {
                this.type = e;
                this.value = t;
                this.children = []
            };
            r.prototype.toString = function (e) {
                if (!e)e = 0;
                var t = "";
                for (var n = 0; n < e; n++)t += "  ";
                var r = t + "<" + this.type + ">";
                if (this.value)r += " (" + i.toString(this.value) + ")";
                r += "\n";
                if (this.children) {
                    for (var o = 0; o < this.children.length; o++) {
                        var s = this.children[o];
                        r += s.toString(e + 1)
                    }
                }
                return r
            };
            r.prototype.addChild = function (e) {
                if (!e)throw"argument cannot be null";
                this.children.push(e)
            };
            var o = function (e, t, n) {
                this.type = e;
                this.value = t;
                this.children = null;
                this.whitespace = !!n
            };
            o.prototype = r.prototype;
            var s = function (e) {
                this._lexer = e
            };
            s.prototype.parse = function () {
                var e = new r("root");
                while (true) {
                    var t = this._acceptEnvironment();
                    if (t === null)break;
                    var n;
                    if (t === "algorithm")n = this._parseAlgorithmInner(); else if (t === "algorithmic")n = this._parseAlgorithmicInner(); else throw new ParseError("Unexpected environment " + t);
                    this._closeEnvironment(t);
                    e.addChild(n)
                }
                this._lexer.expect("EOF");
                return e
            };
            s.prototype._acceptEnvironment = function () {
                var e = this._lexer;
                if (!e.accept("func", "begin"))return null;
                e.expect("open");
                var t = e.expect("ordinary");
                e.expect("close");
                return t
            };
            s.prototype._closeEnvironment = function (e) {
                var t = this._lexer;
                t.expect("func", "end");
                t.expect("open");
                t.expect("ordinary", e);
                t.expect("close")
            };
            s.prototype._parseAlgorithmInner = function () {
                var e = new r("algorithm");
                while (true) {
                    var t = this._acceptEnvironment();
                    if (t !== null) {
                        if (t !== "algorithmic")throw new ParseError("Unexpected environment " + t);
                        var n = this._parseAlgorithmicInner();
                        this._closeEnvironment();
                        e.addChild(n);
                        continue
                    }
                    var i = this._parseCaption();
                    if (i) {
                        e.addChild(i);
                        continue
                    }
                    break
                }
                return e
            };
            s.prototype._parseAlgorithmicInner = function () {
                var e = new r("algorithmic");
                var t;
                while (true) {
                    t = this._parseCommand(a);
                    if (t) {
                        e.addChild(t);
                        continue
                    }
                    t = this._parseBlock();
                    if (t.children.length > 0) {
                        e.addChild(t);
                        continue
                    }
                    break
                }
                return e
            };
            s.prototype._parseCaption = function () {
                var e = this._lexer;
                if (!e.accept("func", "caption"))return null;
                var t = new r("caption");
                e.expect("open");
                t.addChild(this._parseCloseText());
                e.expect("close");
                return t
            };
            s.prototype._parseBlock = function () {
                var e = new r("block");
                while (true) {
                    var t = this._parseControl();
                    if (t) {
                        e.addChild(t);
                        continue
                    }
                    var n = this._parseFunction();
                    if (n) {
                        e.addChild(n);
                        continue
                    }
                    var i = this._parseCommand(l);
                    if (i) {
                        e.addChild(i);
                        continue
                    }
                    var o = this._parseComment();
                    if (o) {
                        e.addChild(o);
                        continue
                    }
                    break
                }
                return e
            };
            s.prototype._parseControl = function () {
                var e;
                if (e = this._parseIf())return e;
                if (e = this._parseLoop())return e
            };
            s.prototype._parseFunction = function () {
                var e = this._lexer;
                if (!e.accept("func", ["function", "procedure"]))return null;
                var t = this._lexer.get().text;
                e.expect("open");
                var n = e.expect("ordinary");
                e.expect("close");
                e.expect("open");
                var i = this._parseCloseText();
                e.expect("close");
                var o = this._parseBlock();
                e.expect("func", "end" + t);
                var s = new r("function", {type: t, name: n});
                s.addChild(i);
                s.addChild(o);
                return s
            };
            s.prototype._parseIf = function () {
                if (!this._lexer.accept("func", "if"))return null;
                var e = new r("if");
                this._lexer.expect("open");
                e.addChild(this._parseCond());
                this._lexer.expect("close");
                e.addChild(this._parseBlock());
                var t = 0;
                while (this._lexer.accept("func", ["elif", "elsif", "elseif"])) {
                    this._lexer.expect("open");
                    e.addChild(this._parseCond());
                    this._lexer.expect("close");
                    e.addChild(this._parseBlock());
                    t++
                }
                var n = false;
                if (this._lexer.accept("func", "else")) {
                    n = true;
                    e.addChild(this._parseBlock())
                }
                this._lexer.expect("func", "endif");
                e.value = {numElif: t, hasElse: n};
                return e
            };
            s.prototype._parseLoop = function () {
                if (!this._lexer.accept("func", ["FOR", "FORALL", "WHILE"]))return null;
                var e = this._lexer.get().text.toLowerCase();
                var t = new r("loop", e);
                this._lexer.expect("open");
                t.addChild(this._parseCond());
                this._lexer.expect("close");
                t.addChild(this._parseBlock());
                var n = e !== "forall" ? "end" + e : "endfor";
                this._lexer.expect("func", n);
                return t
            };
            var a = ["ensure", "require"];
            var l = ["state", "print", "return"];
            s.prototype._parseCommand = function (e) {
                if (!this._lexer.accept("func", e))return null;
                var t = this._lexer.get().text.toLowerCase();
                var n = new r("command", t);
                n.addChild(this._parseOpenText());
                return n
            };
            s.prototype._parseComment = function () {
                if (!this._lexer.accept("func", "comment"))return null;
                var e = new r("comment");
                this._lexer.expect("open");
                e.addChild(this._parseCloseText());
                this._lexer.expect("close");
                return e
            };
            s.prototype._parseCall = function () {
                var e = this._lexer;
                if (!e.accept("func", "call"))return null;
                var t = e.get().whitespace;
                e.expect("open");
                var n = e.expect("ordinary");
                e.expect("close");
                var i = new r("call");
                i.whitespace = t;
                i.value = n;
                e.expect("open");
                var o = this._parseCloseText();
                i.addChild(o);
                e.expect("close");
                return i
            };
            s.prototype._parseCond = s.prototype._parseCloseText = function () {
                return this._parseText("close")
            };
            s.prototype._parseOpenText = function () {
                return this._parseText("open")
            };
            s.prototype._parseText = function (e) {
                var t = new r(e + "-text");
                var n = false;
                var i;
                while (true) {
                    i = this._parseAtom() || this._parseCall();
                    if (i) {
                        if (n)i.whitespace |= n;
                        t.addChild(i);
                        continue
                    }
                    if (this._lexer.accept("open")) {
                        i = this._parseCloseText();
                        n = this._lexer.get().whitespace;
                        i.whitespace = n;
                        t.addChild(i);
                        this._lexer.expect("close");
                        n = this._lexer.get().whitespace;
                        continue
                    }
                    break
                }
                return t
            };
            var h = {
                ordinary: {tokenType: "ordinary"},
                math: {tokenType: "math"},
                special: {tokenType: "special"},
                "cond-symbol": {tokenType: "func", tokenValues: ["and", "or", "not", "true", "false", "to"]},
                "quote-symbol": {tokenType: "quote"},
                "sizing-dclr": {
                    tokenType: "func",
                    tokenValues: ["tiny", "scriptsize", "footnotesize", "small", "normalsize", "large", "Large", "LARGE", "huge", "Huge"]
                },
                "font-dclr": {
                    tokenType: "func",
                    tokenValues: ["normalfont", "rmfamily", "sffamily", "ttfamily", "upshape", "itshape", "slshape", "scshape", "bfseries", "mdseries", "lfseries"]
                },
                "font-cmd": {
                    tokenType: "func",
                    tokenValues: ["textnormal", "textrm", "textsf", "texttt", "textup", "textit", "textsl", "textsc", "uppercase", "lowercase", "textbf", "textmd", "textlf"]
                },
                "text-symbol": {tokenType: "func", tokenValues: ["textbackslash"]}
            };
            s.prototype._parseAtom = function () {
                for (var e in h) {
                    var t = h[e];
                    var n = this._lexer.accept(t.tokenType, t.tokenValues);
                    if (n === null)continue;
                    var i = this._lexer.get().whitespace;
                    if (e !== "ordinary")n = n.toLowerCase();
                    return new o(e, n, i)
                }
                return null
            };
            t.exports = s
        }, {"./utils": 6}], 5: [function (e, t, n) {
            var i = e("./utils");

            function r(e) {
                this._css = {};
                this._fontSize = this._outerFontSize = e !== undefined ? e : 1
            }

            r.prototype.outerFontSize = function (e) {
                if (e !== undefined)this._outerFontSize = e;
                return this._outerFontSize
            };
            r.prototype.fontSize = function () {
                return this._fontSize
            };
            r.prototype._fontCommandTable = {
                normalfont: {"font-family": "KaTeX_Main"},
                rmfamily: {"font-family": "KaTeX_Main"},
                sffamily: {"font-family": "KaTeX_SansSerif_Replace"},
                ttfamily: {"font-family": "KaTeX_Typewriter_Replace"},
                bfseries: {"font-weight": "bold"},
                mdseries: {"font-weight": "medium"},
                lfseries: {"font-weight": "lighter"},
                upshape: {"font-style": "normal", "font-variant": "normal"},
                itshape: {"font-style": "italic", "font-variant": "normal"},
                scshape: {"font-style": "normal", "font-variant": "small-caps"},
                slshape: {"font-style": "oblique", "font-variant": "normal"},
                textnormal: {"font-family": "KaTeX_Main"},
                textrm: {"font-family": "KaTeX_Main"},
                textsf: {"font-family": "KaTeX_SansSerif_Replace"},
                texttt: {"font-family": "KaTeX_Typewriter_Replace"},
                textbf: {"font-weight": "bold"},
                textmd: {"font-weight": "medium"},
                textlf: {"font-weight": "lighter"},
                textup: {"font-style": "normal", "font-variant": "normal"},
                textit: {"font-style": "italic", "font-variant": "normal"},
                textsc: {"font-style": "normal", "font-variant": "small-caps"},
                textsl: {"font-style": "oblique", "font-variant": "normal"},
                uppercase: {"text-transform": "uppercase"},
                lowercase: {"text-transform": "lowercase"}
            };
            r.prototype._sizingScalesTable = {
                tiny: .68,
                scriptsize: .8,
                footnotesize: .85,
                small: .92,
                normalsize: 1,
                large: 1.17,
                Large: 1.41,
                LARGE: 1.58,
                huge: 1.9,
                Huge: 2.28
            };
            r.prototype.updateByCommand = function (e) {
                var t = this._fontCommandTable[e];
                if (t !== undefined) {
                    for (var n in t)this._css[n] = t[n];
                    return
                }
                var i = this._sizingScalesTable[e];
                if (i !== undefined) {
                    this._outerFontSize = this._fontSize;
                    this._fontSize = i;
                    return
                }
                throw new ParserError("unrecogniazed text-style command")
            };
            r.prototype.toCSS = function () {
                var e = "";
                for (var t in this._css) {
                    var n = this._css[t];
                    if (n === undefined)continue;
                    e += t + ":" + n + ";"
                }
                if (this._fontSize !== this._outerFontSize) {
                    e += "font-size:" + this._fontSize / this._outerFontSize + "em;"
                }
                return e
            };
            function o(e, t) {
                this._nodes = e;
                this._textStyle = t
            }

            o.prototype._renderCloseText = function (e) {
                var t = new r(this._textStyle.fontSize());
                var n = new o(e.children, t);
                if (e.whitespace)this._html.putText(" ");
                this._html.putSpan(n.renderToHTML())
            };
            o.prototype.renderToHTML = function () {
                this._html = new s;
                var t;
                while ((t = this._nodes.shift()) !== undefined) {
                    var n = t.type;
                    var i = t.value;
                    if (t.whitespace)this._html.putText(" ");
                    switch (n) {
                        case"ordinary":
                            this._html.putText(i);
                            break;
                        case"math":
                            if (!katex) {
                                try {
                                    katex = e("katex")
                                } catch (a) {
                                    throw"katex is required to render math"
                                }
                            }
                            var l = katex.renderToString(i);
                            this._html.putSpan(l);
                            break;
                        case"cond-symbol":
                            this._html.beginSpan("ps-keyword").putText(i.toLowerCase()).endSpan();
                            break;
                        case"special":
                            if (i === "\\\\") {
                                this._html.putHTML("<br/>");
                                break
                            }
                            var h = {
                                "\\{": "{",
                                "\\}": "}",
                                "\\$": "$",
                                "\\&": "&",
                                "\\#": "#",
                                "\\%": "%",
                                "\\_": "_"
                            };
                            var p = h[i];
                            this._html.putText(p);
                            break;
                        case"text-symbol":
                            var u = {textbackslash: "\\"};
                            var c = u[i];
                            this._html.putText(c);
                            break;
                        case"quote-symbol":
                            var f = {"`": "‘", "``": "“", "'": "’", "''": "”"};
                            var d = f[i];
                            this._html.putText(d);
                            break;
                        case"call":
                            this._html.beginSpan("ps-funcname").putText(i).endSpan();
                            this._html.write("(");
                            var _ = t.children[0];
                            this._renderCloseText(_);
                            this._html.write(")");
                            break;
                        case"close-text":
                            this._renderCloseText(t);
                            break;
                        case"font-dclr":
                        case"sizing-dclr":
                            this._textStyle.updateByCommand(i);
                            this._html.beginSpan(null, this._textStyle.toCSS());
                            var m = new o(this._nodes, this._textStyle);
                            this._html.putSpan(m.renderToHTML());
                            this._html.endSpan();
                            break;
                        case"font-cmd":
                            var v = this._nodes[0];
                            if (v.type !== "close-text")continue;
                            var y = new r(this._textStyle.fontSize());
                            y.updateByCommand(i);
                            this._html.beginSpan(null, y.toCSS());
                            var x = new o(v.children, y);
                            this._html.putSpan(x.renderToHTML());
                            this._html.endSpan();
                            break;
                        default:
                            throw new ParseError("Unexpected ParseNode of type " + t.type)
                    }
                }
                return this._html.toMarkup()
            };
            function s() {
                this._body = [];
                this._textBuf = []
            }

            s.prototype.beginDiv = function (e, t, n) {
                this._beginTag("div", e, t, n);
                this._body.push("\n");
                return this
            };
            s.prototype.endDiv = function () {
                this._endTag("div");
                this._body.push("\n");
                return this
            };
            s.prototype.beginP = function (e, t, n) {
                this._beginTag("p", e, t, n);
                this._body.push("\n");
                return this
            };
            s.prototype.endP = function () {
                this._flushText();
                this._endTag("p");
                this._body.push("\n");
                return this
            };
            s.prototype.beginSpan = function (e, t, n) {
                this._flushText();
                return this._beginTag("span", e, t, n)
            };
            s.prototype.endSpan = function () {
                this._flushText();
                return this._endTag("span")
            };
            s.prototype.putHTML = s.prototype.putSpan = function (e) {
                this._flushText();
                this._body.push(e);
                return this
            };
            s.prototype.putText = function (e) {
                this._textBuf.push(e);
                return this
            };
            s.prototype.write = function (e) {
                this._body.push(e)
            };
            s.prototype.toMarkup = function () {
                this._flushText();
                var e = this._body.join("");
                return e.trim()
            };
            s.prototype.toDOM = function () {
                var e = this.toMarkup();
                var t = document.createElement("div");
                t.innerHTML = e;
                return t.firstChild
            };
            s.prototype._flushText = function () {
                if (this._textBuf.length === 0)return;
                var e = this._textBuf.join("");
                this._body.push(this._escapeHtml(e));
                this._textBuf = []
            };
            s.prototype._beginTag = function (e, t, n, r) {
                var o = "<" + e;
                if (t)o += ' class="' + t + '"';
                if (n) {
                    var s;
                    if (i.isString(n))s = n; else {
                        s = "";
                        for (var a in n) {
                            attrVal = n[a];
                            s += a + ":" + attrVal + ";"
                        }
                    }
                    if (r)s += r;
                    o += ' style="' + s + '"'
                }
                o += ">";
                this._body.push(o);
                return this
            };
            s.prototype._endTag = function (e) {
                this._body.push("</" + e + ">");
                return this
            };
            var a = {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;", "/": "&#x2F;"};
            s.prototype._escapeHtml = function (e) {
                return String(e).replace(/[&<>"'\/]/g, function (e) {
                    return a[e]
                })
            };
            function l(e) {
                e = e || {};
                this.indentSize = e.indentSize ? this._parseEmVal(e.indentSize) : 1.2;
                this.commentDelimiter = e.commentDelimiter || " // ";
                this.lineNumberPunc = e.lineNumberPunc || ":";
                this.lineNumber = e.lineNumber !== undefined ? e.lineNumber : false;
                this.noEnd = e.noEnd !== undefined ? e.noEnd : false;
                if (e.captionCount !== undefined)h.captionCount = e.captionCount
            }

            l.prototype._parseEmVal = function (e) {
                e = e.trim();
                if (e.indexOf("em") !== e.length - 2)throw"option unit error; no `em` found";
                return Number(e.substring(0, e.length - 2))
            };
            function h(e, t) {
                this._root = e.parse();
                this._options = new l(t);
                this._openLine = false;
                this._blockLevel = 0;
                this._textLevel = -1;
                this._globalTextStyle = new r
            }

            h.captionCount = 0;
            h.prototype.toMarkup = function () {
                var e = this._html = new s;
                this._buildTree(this._root);
                delete this._html;
                return e.toMarkup()
            };
            h.prototype.toDOM = function () {
                var e = this.toMarkup();
                var t = document.createElement("div");
                t.innerHTML = e;
                return t.firstChild
            };
            h.prototype._beginGroup = function (e, t, n) {
                this._closeLineIfAny();
                this._html.beginDiv("ps-" + e + (t ? " " + t : ""), n)
            };
            h.prototype._endGroup = function (e) {
                this._closeLineIfAny();
                this._html.endDiv()
            };
            h.prototype._beginBlock = function () {
                var e = this._options.lineNumber && this._blockLevel === 0 ? .6 : 0;
                var t = this._options.indentSize + e;
                this._beginGroup("block", null, {"margin-left": t + "em"});
                this._blockLevel++
            };
            h.prototype._endBlock = function () {
                this._closeLineIfAny();
                this._endGroup();
                this._blockLevel--
            };
            h.prototype._newLine = function () {
                this._closeLineIfAny();
                this._openLine = true;
                this._globalTextStyle.outerFontSize(1);
                var e = this._options.indentSize;
                if (this._blockLevel > 0) {
                    this._numLOC++;
                    this._html.beginP("ps-line ps-code", this._globalTextStyle.toCSS());
                    if (this._options.lineNumber) {
                        this._html.beginSpan("ps-linenum", {left: -((this._blockLevel - 1) * (e * 1.25)) + "em"}).putText(this._numLOC + this._options.lineNumberPunc).endSpan()
                    }
                } else {
                    this._html.beginP("ps-line", {
                        "text-indent": -e + "em",
                        "padding-left": e + "em"
                    }, this._globalTextStyle.toCSS())
                }
            };
            h.prototype._closeLineIfAny = function () {
                if (!this._openLine)return;
                this._html.endP();
                this._openLine = false
            };
            h.prototype._typeKeyword = function (e) {
                this._html.beginSpan("ps-keyword").putText(e).endSpan()
            };
            h.prototype._typeFuncName = function (e) {
                this._html.beginSpan("ps-funcname").putText(e).endSpan()
            };
            h.prototype._typeText = function (e) {
                this._html.write(e)
            };
            h.prototype._buildTreeForAllChildren = function (e) {
                var t = e.children;
                for (var n = 0; n < t.length; n++)this._buildTree(t[n])
            };
            h.prototype._buildCommentsFromBlock = function (e) {
                var t = e.children;
                while (t.length > 0 && t[0].type === "comment") {
                    var n = t.shift();
                    this._buildTree(n)
                }
            };
            h.prototype._buildTree = function (e) {
                var t, n, i;
                switch (e.type) {
                    case"root":
                        this._beginGroup("root");
                        this._buildTreeForAllChildren(e);
                        this._endGroup();
                        break;
                    case"algorithm":
                        var s;
                        for (t = 0; t < e.children.length; t++) {
                            n = e.children[t];
                            if (n.type !== "caption")continue;
                            s = n;
                            h.captionCount++
                        }
                        if (s) {
                            this._beginGroup("algorithm", "with-caption");
                            this._buildTree(s)
                        } else {
                            this._beginGroup("algorithm")
                        }
                        for (t = 0; t < e.children.length; t++) {
                            n = e.children[t];
                            if (n.type === "caption")continue;
                            this._buildTree(n)
                        }
                        this._endGroup();
                        break;
                    case"algorithmic":
                        if (this._options.lineNumber) {
                            this._beginGroup("algorithmic", "with-linenum");
                            this._numLOC = 0
                        } else {
                            this._beginGroup("algorithmic")
                        }
                        this._buildTreeForAllChildren(e);
                        this._endGroup();
                        break;
                    case"block":
                        this._beginBlock();
                        this._buildTreeForAllChildren(e);
                        this._endBlock();
                        break;
                    case"function":
                        var a = e.value.type.toLowerCase();
                        var l = e.value.name;
                        i = e.children[0];
                        var p = e.children[1];
                        this._newLine();
                        this._typeKeyword(a + " ");
                        this._typeFuncName(l);
                        this._typeText("(");
                        this._buildTree(i);
                        this._typeText(")");
                        this._buildCommentsFromBlock(p);
                        this._buildTree(p);
                        if (!this._options.noEnd) {
                            this._newLine();
                            this._typeKeyword("end " + a)
                        }
                        break;
                    case"if":
                        this._newLine();
                        this._typeKeyword("if ");
                        ifCond = e.children[0];
                        this._buildTree(ifCond);
                        this._typeKeyword(" then");
                        var u = e.children[1];
                        this._buildCommentsFromBlock(u);
                        this._buildTree(u);
                        var c = e.value.numElif;
                        for (var f = 0; f < c; f++) {
                            this._newLine();
                            this._typeKeyword("else if ");
                            var d = e.children[2 + 2 * f];
                            this._buildTree(d);
                            this._typeKeyword(" then");
                            var _ = e.children[2 + 2 * f + 1];
                            this._buildCommentsFromBlock(_);
                            this._buildTree(_)
                        }
                        var m = e.value.hasElse;
                        if (m) {
                            this._newLine();
                            this._typeKeyword("else");
                            var v = e.children[e.children.length - 1];
                            this._buildCommentsFromBlock(v);
                            this._buildTree(v)
                        }
                        if (!this._options.noEnd) {
                            this._newLine();
                            this._typeKeyword("end if")
                        }
                        break;
                    case"loop":
                        this._newLine();
                        var y = e.value;
                        var x = {"for": "for", forall: "for all", "while": "while"};
                        this._typeKeyword(x[y] + " ");
                        var b = e.children[0];
                        this._buildTree(b);
                        this._typeKeyword(" do");
                        var w = e.children[1];
                        this._buildCommentsFromBlock(w);
                        this._buildTree(w);
                        if (!this._options.noEnd) {
                            this._newLine();
                            var g = y === "while" ? "end while" : "end for";
                            this._typeKeyword(g)
                        }
                        break;
                    case"command":
                        var T = e.value;
                        var C = {
                            state: "",
                            ensure: "Ensure: ",
                            require: "Require: ",
                            print: "print ",
                            "return": "return "
                        }[T];
                        this._newLine();
                        if (C)this._typeKeyword(C);
                        i = e.children[0];
                        this._buildTree(i);
                        break;
                    case"caption":
                        this._newLine();
                        this._typeKeyword("Algorithm " + h.captionCount + " ");
                        i = e.children[0];
                        this._buildTree(i);
                        break;
                    case"comment":
                        i = e.children[0];
                        this._html.beginSpan("ps-comment");
                        this._html.putText(this._options.commentDelimiter);
                        this._buildTree(i);
                        this._html.endSpan();
                        break;
                    case"open-text":
                        var k = new o(e.children, this._globalTextStyle);
                        this._html.putSpan(k.renderToHTML());
                        break;
                    case"close-text":
                        var S = this._globalTextStyle.fontSize();
                        var L = new r(S);
                        var E = new o(e.children, L);
                        this._html.putSpan(E.renderToHTML());
                        break;
                    default:
                        throw new ParseError("Unexpected ParseNode of type " + e.type)
                }
            };
            t.exports = h
        }, {"./utils": 6, katex: undefined}], 6: [function (e, t, n) {
            function i(e) {
                return typeof e === "string" || e instanceof String
            }

            function r(e) {
                return typeof e === "object" && e instanceof Object
            }

            function o(e) {
                if (!r(e))return e + "";
                var t = [];
                for (var n in e)t.push(n + ": " + o(e[n]));
                return t.join(", ")
            }

            t.exports = {isString: i, isObject: r, toString: o}
        }, {}]
    }, {}, [1])(1)
});