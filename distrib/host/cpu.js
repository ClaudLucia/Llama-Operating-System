///<reference path="../globals.ts" />
///<reference path="../host/memoryAccessor.ts" />
/* ------------
     CPU.ts

     Requires global.ts.

     Routines for the host CPU simulation, NOT for the OS itself.
     In this manner, it's A LITTLE BIT like a hypervisor,
     in that the Document environment inside a browser is the "bare metal" (so to speak) for which we write code
     that hosts our client OS. But that analogy only goes so far, and the lines are blurred, because we are using
     TypeScript/JavaScript in both the host and client environments.

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */
var TSOS;
(function (TSOS) {
    var CPU = /** @class */ (function () {
        function CPU(PC, Acc, Xreg, Yreg, Zflag, eXecute) {
            if (PC === void 0) { PC = 0; }
            if (Acc === void 0) { Acc = 0; }
            if (Xreg === void 0) { Xreg = 0; }
            if (Yreg === void 0) { Yreg = 0; }
            if (Zflag === void 0) { Zflag = 0; }
            if (eXecute === void 0) { eXecute = false; }
            this.PC = PC;
            this.Acc = Acc;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.Zflag = Zflag;
            this.eXecute = eXecute;
        }
        CPU.prototype.init = function () {
            ///this.pid = 0;
            this.PC = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.eXecute = false;
            ///this.IR = null;
        };
        CPU.prototype.cycle = function () {
            _Kernel.krnTrace('CPU cycle');
            // TODO: Accumulate CPU usage and profiling statistics here.
            // Do the real work here. Be sure to set this.eXecute appropriately.
            if (!_MemoryAccessor.withinBounds(this.PC)) {
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(ERR_BOUND, 0));
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(EXIT, false));
            }
            //Use a switch case for the opCode
            else {
                //Grap the opCode
                var opCode = _MemoryAccessor.readMem(this.PC);
                _Kernel.krnTrace('CPU executing: ' + opCode);
                switch (opCode) {
                    /*LDA*/
                    case "AD":
                        var hex = _MemoryAccessor.readMem(this.PC + 1);
                        hex = _MemoryAccessor.readMem(this.PC + 2) + hex;
                        var addr = parseInt(hex, 16);
                        this.Acc = parseInt(_MemoryAccessor.readMem(addr), 16);
                        this.PC = this.PC + 3;
                        break;
                    /*STA*/
                    case "8D":
                        var hex = _MemoryAccessor.readMem(this.PC + 1);
                        hex = _MemoryAccessor.readMem(this.PC + 2) + hex;
                        var addr = parseInt(hex, 16);
                        var val = this.Acc.toString(16);
                        _MemoryAccessor.writeMem(addr, val);
                        this.PC = this.PC + 3;
                        break;
                    /*LDA into Memory*/
                    case "A9":
                        this.Acc = parseInt(_MemoryAccessor.readMem(this.PC + 1), 16);
                        this.PC = this.PC + 2;
                        break;
                    /*LDA X with constant*/
                    case "A2":
                        this.Xreg = parseInt(_MemoryAccessor.readMem(this.PC + 1), 16);
                        this.PC = this.PC + 2;
                        break;
                    /*LDA X from Memory*/
                    case "AE":
                        var hex = _MemoryAccessor.readMem(this.PC + 1);
                        hex = _MemoryAccessor.readMem(this.PC + 2) + hex;
                        var addr = parseInt(hex, 16);
                        this.Xreg = parseInt(_MemoryAccessor.readMem(addr), 16);
                        this.PC = this.PC + 3;
                        break;
                    /*LDA Y with constant*/
                    case "A0":
                        this.Yreg = parseInt(_MemoryAccessor.readMem(this.PC + 1), 16);
                        this.PC = this.PC + 2;
                        break;
                    /*LDA Y from Memory*/
                    case "AC":
                        var hex = _MemoryAccessor.readMem(this.PC + 1);
                        hex = _MemoryAccessor.readMem(this.PC + 2) + hex;
                        var addr = parseInt(hex, 16);
                        this.Yreg = parseInt(_MemoryAccessor.readMem(addr), 16);
                        this.PC = this.PC + 3;
                        break;
                    /*NO OPCODE*/
                    case "EA":
                        this.PC++;
                        break;
                    /*COMPARE BYTES*/
                    case "EC":
                        var hex = _MemoryAccessor.readMem(this.PC + 1);
                        hex = _MemoryAccessor.readMem(this.PC + 2) + hex;
                        var addr = parseInt(hex, 16);
                        var byte = _MemoryAccessor.readMem(addr);
                        if (parseInt(byte.toString(), 16) == this.Xreg) {
                            this.Zflag = 1;
                        }
                        else {
                            this.Zflag = 0;
                        }
                        this.PC = this.PC + 3;
                        break;
                    /*BRN*/
                    case "D0":
                        if (this.Zflag == 0) {
                            var branch = parseInt(_MemoryAccessor.readMem(this.PC + 1), 16);
                            var partition = _MMU.getMyPartition();
                            this.PC = _MemoryAccessor.BnLloop(this.PC, branch);
                        }
                        else {
                            this.PC = this.PC + 2;
                        }
                        break;
                    /*INC BYTE*/
                    case "EE":
                        var hex = _MemoryAccessor.readMem(this.PC + 1);
                        hex = _MemoryAccessor.readMem(this.PC + 2) + hex;
                        var addr = parseInt(hex, 16);
                        var indvByte = parseInt(_MemoryAccessor.readMem(addr), 16);
                        indvByte++;
                        var hexIndvByte = indvByte.toString(16);
                        _MemoryAccessor.writeMem(addr, hexIndvByte);
                        this.PC = this.PC + 3;
                        break;
                    /*SYS CALL*/
                    case "FF":
                        if (this.Xreg == 1) {
                            _KernelInterruptQueue.enqueue(new TSOS.Interrupt(WRITECONSOLE, "" + this.Yreg));
                        }
                        else if (this.Xreg == 2) {
                            var addr = this.Yreg;
                            var str = "";
                            while (_MemoryAccessor.readMem(addr) != "00") {
                                var ascii = _MemoryAccessor.readMem(addr);
                                var dec = parseInt(ascii.toString(), 16);
                                var chr = String.fromCharCode(dec);
                                str += chr;
                                addr++;
                            }
                            _KernelInterruptQueue.enqueue(new TSOS.Interrupt(WRITECONSOLE, str));
                        }
                        this.PC++;
                        break;
                    /*ADD CARRY*/
                    case "6D":
                        var hex = _MemoryAccessor.readMem(this.PC + 1);
                        hex = _MemoryAccessor.readMem(this.PC + 2) + hex;
                        var addr = parseInt(hex, 16);
                        var values = _MemoryAccessor.readMem(addr);
                        this.Acc += parseInt(values, 16);
                        this.PC = this.PC + 3;
                        break;
                    /*BRK*/
                    case "00":
                        _KernelInterruptQueue.enqueue(new TSOS.Interrupt(EXIT, true));
                        break;
                    default:
                        _KernelInputQueue.enqueue(new TSOS.Interrupt(EXIT, false));
                        _KernelInputQueue.enqueue(new TSOS.Interrupt(OPINV, 0));
                }
            }
            //if (_stepModeON === true) {
            //    this.eXecute = false;
            //}
        };
        return CPU;
    }());
    TSOS.CPU = CPU;
})(TSOS || (TSOS = {}));
