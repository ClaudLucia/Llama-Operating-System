///<reference path="../globals.ts" />

/* ------------
     Console.ts

     Requires globals.ts

     The OS Console - stdIn and stdOut by default.
     Note: This is not the Shell. The Shell is the "command line interface" (CLI) or interpreter for this console.
     ------------ */

module TSOS {

    export class Console {

        constructor(public currentFont = _DefaultFontFamily,
                    public currentFontSize = _DefaultFontSize,
                    public currentXPosition = 0,
                    public currentYPosition = _DefaultFontSize,
                    public buffer = "",
                    public scrollIng = 0,
                    public wrapLines = []) {

        }

        public init(): void {
            this.clearScreen();
            this.resetXY();
        }

        private clearScreen(): void {
            _DrawingContext.clearRect(0, 0, _Canvas.width, _Canvas.height);
            _Canvas.height = 500;
        }

        private resetXY(): void {
            this.currentXPosition = 0;
            this.currentYPosition = this.currentFontSize;
        }

        public uhOh(): void {
            document.getElementById('canvas').classList.add('ohno');
            document.getElementById('display').classList.add('ohno');

            
        }

        public handleInput(): void {
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
                    _DrawingContext.tabCompletion();
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
        }


        public putText(text): void {
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
            
        }
        
        public reCall(cmd): any {
            _DrawingContext.clrLine(0, this.currentYPosition,
                                       this.currentFont,
                                       this.currentFontSize);
            if (this.wrapLines.length > 0) {
                for (var i = 0; i < this.wrapLines.length; i++) {
                    this.currentYPosition -= this.lineHeight();
                    _DrawingContext.clrLine(0, this.currentYPosition,
                                            this.currentFont,
                                            this.currentFontSize);
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
        }

        

        public advanceLine(wrap): void {
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
            _DrawingContext.clrLine(this.currentXPosition, this.currentYPosition,
                                    this.currentFont, this.currentFontSize);
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
            
        }
        public lineHeight(): any {
            return _DefaultFontSize + 
                   _DrawingContext.fontDescent(this.currentFont, this.currentFontSize) +
                   _FontHeightMargin;
        }

        public lineWrap(x): void {
            this.advanceLine(true);
            this.wrapLines.push(x);
        }
        
    }
 }
