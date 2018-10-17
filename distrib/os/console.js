///<reference path="../globals.ts" />
/* ------------
     Console.ts

     Requires globals.ts

     The OS Console - stdIn and stdOut by default.
     Note: This is not the Shell. The Shell is the "command line interface" (CLI) or interpreter for this console.
     ------------ */
var TSOS;
(function (TSOS) {
    var Console = /** @class */ (function () {
        function Console(currentFont, currentFontSize, currentXPosition, currentYPosition, buffer, scrollIng, wrapLines) {
            if (currentFont === void 0) { currentFont = _DefaultFontFamily; }
            if (currentFontSize === void 0) { currentFontSize = _DefaultFontSize; }
            if (currentXPosition === void 0) { currentXPosition = 0; }
            if (currentYPosition === void 0) { currentYPosition = _DefaultFontSize; }
            if (buffer === void 0) { buffer = ""; }
            if (scrollIng === void 0) { scrollIng = 0; }
            if (wrapLines === void 0) { wrapLines = []; }
            this.currentFont = currentFont;
            this.currentFontSize = currentFontSize;
            this.currentXPosition = currentXPosition;
            this.currentYPosition = currentYPosition;
            this.buffer = buffer;
            this.scrollIng = scrollIng;
            this.wrapLines = wrapLines;
        }
        Console.prototype.init = function () {
            this.clearScreen();
            this.resetXY();
        };
        Console.prototype.clearScreen = function () {
            _DrawingContext.clearRect(0, 0, _Canvas.width, _Canvas.height);
            _Canvas.height = 500;
        };
        Console.prototype.resetXY = function () {
            this.currentXPosition = 0;
            this.currentYPosition = this.currentFontSize;
        };
        Console.prototype.handleInput = function () {
            while (_KernelInputQueue.getSize() > 0) {
                // Get the next character from the kernel input queue.
                var chr = _KernelInputQueue.dequeue();
                // Check to see if it's "special" (enter or ctrl-c) or "normal" (anything else that the keyboard device driver gave us).
                if (chr === String.fromCharCode(13)) { //     Enter key
                    // The enter key marks the end of a console command, so ...
                    // ... tell the shell ...
                    _OsShell.handleInput(this.buffer);
                    // ... and reset our buffer.
                    this.buffer = "";
                }
                //Does backspace on the canvas
                else if (chr === String.fromCharCode(8)) {
                    _DrawingContext.backSpace();
                }
                //Finish the command with tab
                else if (chr === String.fromCharCode(9)) {
                    if (this.buffer.length !== 0) {
                        var wordS = this.buffer.toLowerCase().split(" ");
                        var word = wordS[wordS.length - 1];
                        var cmdS = _OsShell.commandList.filter(function (value) {
                            return value.command.indexOf(word) === 0;
                        });
                        if (cmdS.length === 1) {
                            var cmd = cmdS[0].command.substr(word.length) + " ";
                            this.putText(cmd);
                            this.buffer += cmd;
                        }
                        else if (cmdS.length > 1) {
                            var prevX = this.currentXPosition;
                            var prevY = this.currentYPosition;
                            this.scrollIng = 0;
                            this.advanceLine;
                            this.putText(cmdS.map(function (value) {
                                return value.command;
                            }).join(", "));
                            this.currentXPosition = prevX;
                            this.currentYPosition = prevY - this.scrollIng;
                        }
                    }
                }
                //Recall the last command
                else if (chr === String.fromCharCode(38)) {
                    this.reCall(_OsShell.getLastCmd());
                }
                //Recall the first command
                else if (chr === String.fromCharCode(40)) {
                    this.reCall(_OsShell.getFirstCmd());
                }
                else {
                    // This is a "normal" character, so ...
                    // ... draw it on the screen...
                    this.putText(chr);
                    // ... and add it to our buffer.
                    this.buffer += chr;
                }
                // TODO: Write a case for Ctrl-C.
            }
        };
        Console.prototype.putText = function (text) {
            // My first inclination here was to write two functions: putChar() and putString().
            // Then I remembered that JavaScript is (sadly) untyped and it won't differentiate
            // between the two.  So rather than be like PHP and write two (or more) functions that
            // do the same thing, thereby encouraging confusion and decreasing readability, I
            // decided to write one function and use the term "text" to connote string or char.
            //
            // UPDATE: Even though we are now working in TypeScript, char and string remain undistinguished.
            //         Consider fixing that.
            // Draw the text at the current X and Y coordinates.
            _DrawingContext.drawText(this.currentFont, this.currentFontSize, this.currentXPosition, this.currentYPosition, text);
            // Move the current X position.
            var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, text);
            this.currentXPosition = this.currentXPosition + offset;
        };
        Console.prototype.reCall = function (cmd) {
            _DrawingContext.clrLine(0, this.currentYPosition, this.currentFont, this.currentFontSize);
            if (this.wrapLines.length > 0) {
                for (var i = 0; i < this.wrapLines.length; i++) {
                    this.currentYPosition -= this.lineHeight();
                    _DrawingContext.clrLine(0, this.currentYPosition, this.currentFont, this.currentFontSize);
                }
                this.wrapLines = [];
            }
            this.currentXPosition = 0;
            this.buffer = "";
            _OsShell.putPrompt();
            if (cmd) {
                this.putText(cmd);
            }
            this.buffer = cmd;
        };
        Console.prototype.advanceLine = function (wrap) {
            if (wrap = 0) {
                wrap = false;
            }
            if (!wrap) {
                this.wrapLines = [];
            }
            this.currentXPosition = 0;
            //this.currentXPosition = 0;
            //this.currentYPosition += 
            /*
             * Font size measures from the baseline to the highest point in the font.
             * Font height margin is extra spacing between the lines.
             TODO: Handle scrolling. (iProject 1)
             */
            var lineHeight = this.lineHeight();
            this.currentYPosition += lineHeight;
            _DrawingContext.clrLine(this.currentXPosition, this.currentYPosition, this.currentFont, this.currentFontSize);
            if (this.currentYPosition > _Canvas.height) {
                var oldCanvas = _DrawingContext.getImageData(0, 0, _Canvas.width, _Canvas.height);
                this.clearScreen();
                _DrawingContext.putImageData(oldCanvas, 0, -lineHeight);
                this.currentYPosition -= lineHeight;
                this.scrollIng += lineHeight;
            }
            else {
                this.scrollIng = 0;
            }
        };
        Console.prototype.lineHeight = function () {
            return _DefaultFontSize +
                _DrawingContext.fontDescent(this.currentFont, this.currentFontSize) +
                _FontHeightMargin;
        };
        Console.prototype.lineWrap = function (x) {
            this.advanceLine(true);
            this.wrapLines.push(x);
        };
        return Console;
    }());
    TSOS.Console = Console;
})(TSOS || (TSOS = {}));
