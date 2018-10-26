//
// Process COntrol Block
//
/* ------------
 *
 * The Process Control Block
 * manages the processes for the OS
 *
 *
 *
 ------------ */
var TSOS;
(function (TSOS) {
    var PCB = /** @class */ (function () {
        //Properties
        function PCB(PC, IR, xReg, yReg, zFlag, base, Acc, limit, state, isTerm, rediOutput, preTime, runTime, waitTime, inMem, priority, pid) {
            if (isTerm === void 0) { isTerm = false; }
            if (rediOutput === void 0) { rediOutput = ""; }
            if (preTime === void 0) { preTime = 0; }
            if (runTime === void 0) { runTime = 0; }
            if (waitTime === void 0) { waitTime = 0; }
            if (inMem === void 0) { inMem = true; }
            if (priority === void 0) { priority = -1; }
            if (pid === void 0) { pid = PCB.processCount; }
            this.PC = PC;
            this.IR = IR;
            this.xReg = xReg;
            this.yReg = yReg;
            this.zFlag = zFlag;
            this.base = base;
            this.Acc = Acc;
            this.limit = limit;
            this.state = state;
            this.isTerm = isTerm;
            this.rediOutput = rediOutput;
            this.preTime = preTime;
            this.runTime = runTime;
            this.waitTime = waitTime;
            this.inMem = inMem;
            this.priority = priority;
            this.pid = pid;
        }
        PCB.prototype.ready = function () {
            if (this.state == _State.RESIDENT) {
                this.state = _State.READY;
                return true;
            }
            else {
                return false;
            }
        };
        PCB.prototype.start = function () {
            if (this.state == _State.READY) {
                this.state = _State.RUNNING;
                return true;
            }
            else {
                return false;
            }
        };
        PCB.prototype.preempt = function () {
            if (this.state == _State.RUNNING) {
                this.state = _State.READY;
                this.syncing();
                this.preTime = _OSclock;
                return true;
            }
            else {
                return false;
            }
        };
        PCB.prototype.stop = function () {
            if (this.state == _State.RUNNING || this.state == _State.READY) {
                this.syncing();
                this.remove();
                this.turnAround = this.runTime + this.waitTime;
                this.showStats();
                return true;
            }
            else {
                return false;
            }
        };
        PCB.prototype.remove = function (phase) {
            if (phase === void 0) {
                phase = false;
            }
            this.state = _State.TERMINATED;
            TSOS.Control.removeProcessD(this.pid);
            if (this.inMem) {
                _MMU.freeSegment(this.base);
            }
            else if (!phase) {
                var processN = "~p" + this.pid + ".swp";
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(FILESYS_IRQ, { COMMAND: "del", file: processN, data: "" }));
            }
        };
        PCB.prototype.syncing = function () {
            var PC = _CPU.PC;
            var IR = _CPU.IR;
            var Acc = _CPU.Acc;
            var xReg = _CPU.Xreg;
            var yReg = _CPU.Yreg;
            var zFlag = _CPU.Zflag;
            this.PC;
            this.IR;
            this.Acc = Acc;
            this.xReg = xReg;
            this.yReg = yReg;
            this.zFlag = zFlag;
        };
        PCB.prototype.showStats = function () {
            _StdOut.putText("Process [PID " + this.pid + " ] stats");
            _StdOut.advanceLine();
            _StdOut.putText("Turnaround Time: " + this.turnAround + " cycle(s)");
            _StdOut.advanceLine();
            _StdOut.putText("Wait Time: " + this.waitTime + " cycle(s)");
            _OsShell.putPrompt();
        };
        PCB.getProcesses = function (pr) {
            return this.processList.filter(function (pcb) {
                return pcb.pid == p;
            })[0];
        };
        PCB.processCount = function () {
        };
        PCB.processList = function () {
        };
        return PCB;
    }());
    TSOS.PCB = PCB;
})(TSOS || (TSOS = {}));
