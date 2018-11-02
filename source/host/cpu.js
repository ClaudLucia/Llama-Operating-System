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
    var Cpu = /** @class */ (function () {
        function Cpu(PC, Acc, Xreg, Yreg, Zflag, isExecuting, IR, pid, base, limit, opCode) {
            if (PC === void 0) { PC = 0; }
            if (Acc === void 0) { Acc = 0; }
            if (Xreg === void 0) { Xreg = 0; }
            if (Yreg === void 0) { Yreg = 0; }
            if (Zflag === void 0) { Zflag = 0; }
            if (isExecuting === void 0) { isExecuting = false; }
            if (IR === void 0) { IR = -1; }
            if (pid === void 0) { pid = -1; }
            if (base === void 0) { base = -1; }
            if (limit === void 0) { limit = -1; }
            if (opCode === void 0) { opCode = ""; }
            this.PC = PC;
            this.Acc = Acc;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.Zflag = Zflag;
            this.isExecuting = isExecuting;
            this.IR = IR;
            this.pid = pid;
            this.base = base;
            this.limit = limit;
            this.opCode = opCode;
        }
        Cpu.prototype.init = function () {
            this.pid = 0;
            this.PC = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.isExecuting = false;
            this.IR = null;
        };
        //public sync(): void {
        //    this.pid = 0;
        //    this.PC = 0;
        //    this.Acc = 0;
        //    this.Xreg = 0;
        //    this.Yreg = 0;
        //    this.Zflag = 0;
        //    this.isExecuting = false;
        //}
        Cpu.prototype.cycle = function () {
            _Kernel.krnTrace('CPU cycle');
            // TODO: Accumulate CPU usage and profiling statistics here.
            // Do the real work here. Be sure to set this.isExecuting appropriately.
            //var opCodeInd = TSOS.MMU.getAddr(this.PC, this.base);
            //var opCodeByte = TSOS.MMU.getBLogicalAddress(this.PC, this.base, this.limit);
            //this.IR = opCodeByte;
            //this.PC += 1;
            //var opCode = this.opCodeExec[opCodeByte];
            //opCode.fn.call(this);
            //this.PC += opCode.operandSize;
            //this.store(this.current());
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
                        var addr = parseInt(_MemoryAccessor.readMem(addr), 16);
                        this.PC += 3;
                        break;
                    /*STA*/
                    case "8D":
                        var hex = _MemoryAccessor.readMem(this.PC + 1);
                        break;
                }
            }
            if (_SingleStepMode === true) {
                this.isExecuting = false;
            }
            TSOS.Control.hUpdateDisplay();
        };
        return Cpu;
    }());
    TSOS.Cpu = Cpu;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=cpu.js.map