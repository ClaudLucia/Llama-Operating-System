///<reference path="../globals.ts" />
///<reference path="deviceDriver.ts" />
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
/* ----------------------------------
   DeviceDriverKeyboard.ts

   Requires deviceDriver.ts

   The Kernel Keyboard Device Driver.
   ---------------------------------- */
var TSOS;
(function (TSOS) {
    // Extends DeviceDriver
    var DeviceDriverKeyboard = /** @class */ (function (_super) {
        __extends(DeviceDriverKeyboard, _super);
        function DeviceDriverKeyboard() {
            // Override the base method pointers.
            var _this = 
            // The code below cannot run because "this" can only be
            // accessed after calling super.
            //super(this.krnKbdDriverEntry, this.krnKbdDispatchKeyPress);
            _super.call(this) || this;
            _this.driverEntry = _this.krnKbdDriverEntry;
            _this.isr = _this.krnKbdDispatchKeyPress;
            return _this;
        }
        DeviceDriverKeyboard.prototype.krnKbdDriverEntry = function () {
            // Initialization routine for this, the kernel-mode Keyboard Device Driver.
            this.status = "loaded";
            // More?
        };
        DeviceDriverKeyboard.prototype.krnKbdDispatchKeyPress = function (params) {
            // Parse the params.    TODO: Check that the params are valid and osTrapError if not.
            var keyCode = params[0];
            var isShifted = params[1];
            var ctrl = params[2];
            _Kernel.krnTrace("Key code:" + keyCode + " shifted:" + isShifted);
            var chr = "";
            if (ctrl) {
                if (keyCode === 67) {
                    chr = String.fromCharCode(24);
                }
                else if (keyCode === 76) {
                    chr = String.fromCharCode(11);
                }
            }
            // Check to see if we even want to deal with the key that was pressed.
            else {
                if (((keyCode >= 65) && (keyCode <= 90)) || // A..Z
                    ((keyCode >= 97) && (keyCode <= 123))) { // a..z {
                    // Determine the character we want to display.
                    // Assume it's lowercase...
                    chr = String.fromCharCode(keyCode + 32);
                    // ... then check the shift key and re-adjust if necessary.
                    if (isShifted) {
                        chr = String.fromCharCode(keyCode);
                    }
                    // TODO: Check for caps-lock and handle as shifted if so.
                }
                else if (((keyCode >= 48) && (keyCode <= 57))) {
                    //digits and special characters
                    chr = String.fromCharCode(keyCode);
                    if (isShifted) {
                        switch (keyCode) {
                            case 48:
                                chr = ")";
                                break;
                            case 49:
                                chr = "!";
                                break;
                            case 50:
                                chr = "@";
                                break;
                            case 51:
                                chr = "#";
                                break;
                            case 52:
                                chr = "$";
                                break;
                            case 53:
                                chr = "%";
                                break;
                            case 54:
                                chr = "^";
                                break;
                            case 55:
                                chr = "&";
                                break;
                            case 56:
                                chr = "*";
                                break;
                            case 57:
                                chr = "(";
                                break;
                        }
                    }
                }
                else if ((keyCode == 32) || // space
                    (keyCode == 13) || // enter
                    (keyCode == 8) || //backspace                   
                    (keyCode == 9)) { //Tab
                    chr = String.fromCharCode(keyCode);
                }
                else if ((keyCode === 38) || (keyCode === 40)) {
                    //Up and down arrows
                    chr = String.fromCharCode(keyCode);
                }
                else {
                    //more special characters(non-numerical)
                    switch (keyCode) {
                        case 186:
                            chr = isShifted ? ":" : ";";
                            break;
                        case 187:
                            chr = isShifted ? "+" : "=";
                            break;
                        case 188:
                            chr = isShifted ? "<" : ",";
                            break;
                        case 189:
                            chr = isShifted ? "_" : "-";
                            break;
                        case 190:
                            chr = isShifted ? ">" : ".";
                            break;
                        case 191:
                            chr = isShifted ? "?" : "/";
                            break;
                        case 192:
                            chr = isShifted ? "~" : "`";
                            break;
                        case 219:
                            chr = isShifted ? "{" : "[";
                            break;
                        case 220:
                            chr = isShifted ? "|" : "\\";
                            break;
                        case 221:
                            chr = isShifted ? "}" : "]";
                            break;
                        case 222:
                            chr = isShifted ? ' " ' : " ' ";
                            break;
                    }
                }
            }
            if (chr)
                _KernelInputQueue.enqueue(chr);
        };
        return DeviceDriverKeyboard;
    }(TSOS.DeviceDriver));
    TSOS.DeviceDriverKeyboard = DeviceDriverKeyboard;
})(TSOS || (TSOS = {}));
