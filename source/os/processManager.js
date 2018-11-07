///<reference path="../globals.ts" />
///<reference path="../host/memory.ts" />
/* ------------
     ProcessManager.ts

     ------------ */
var TSOS;
(function (TSOS) {
    var ProcessManager = /** @class */ (function () {
        function ProcessManager() {
            this.residentQueue = new TSOS.Queue(),
                this.readyQueue = new TSOS.Queue();
        }
        ProcessManager.prototype.createProcesses = function (opCodes, args) {
            if (opCodes.length > _MMU.totalLimit) {
                _StdOut.putText("Loading Failed! Program is over 256 bytes");
                return;
            }
            if (_MMU.checkMemory(opCodes.length)) {
                var pcb = new TSOS.PCB(_PID);
                var partition = _MMU.getPartitions(opCodes.length);
                pcb.init(partition);
                if (args.length > 0) {
                    pcb.Priority = parseInt(args[0]);
                }
                else {
                    pcb.Priority = 1;
                }
                this.residentQueue.enqueue(pcb);
                _MMU.loadMemory(opCodes, partition);
                TSOS.Control.hostMemory();
                _StdOut.putText("Program loaded with PID " + _PID);
                _PID++;
            }
            else {
                _StdOut.putText("Loading failed! Not enough memory available.");
            }
        };
        ProcessManager.prototype.runnProcess = function () {
            //this.running = this.readyQueue.dequeue();
            _CPU.PC = this.running.PC;
            _CPU.Acc = this.running.Acc;
            _CPU.Xreg = this.running.Xreg;
            _CPU.Yreg = this.running.Yreg;
            _CPU.Zflag = this.running.Zflag;
            _CPU.isExecuting = true;
            this.running.State = "Running";
            TSOS.Control.hostProcess();
            TSOS.Control.hostCPU();
            TSOS.Control.hostMemory();
            TSOS.Control.hostLog("Running process " + this.running.PID, "os");
        };
        ProcessManager.prototype.runAllP = function () {
            TSOS.Control.hostLog("Running all programs", "os");
            while (!this.residentQueue.isEmpty()) {
                this.readyQueue.enqueue(this.residentQueue.dequeue());
            }
        };
        ProcessManager.runningProcess = function () {
            return _ProcessManager.running != null;
        };
        ProcessManager.prototype.listAllP = function () {
            if (this.running != null) {
                var processes = [];
                for (var i = 0; i < this.readyQueue.getSize(); i++) {
                    var pcb = this.readyQueue.dequeue();
                    processes.push(new String(pcb.PID));
                    this.readyQueue.enqueue(pcb);
                }
                return processes;
            }
            else {
                return [];
            }
        };
        ProcessManager.prototype.exitProcess = function (display) {
            _Scheduler.unwatch();
            _CPU.init();
            _MMU.clearPartitions(this.running.Partition);
            TSOS.Control.hostMemory();
            TSOS.Control.hostLog("Exiting process " + this.running.PID);
            if (display) {
                _StdOut.advanceLine();
                _StdOut.putText("Process ID: " + this.running.PID);
                _StdOut.advanceLine();
                _StdOut.putText("Turnaround time: " + this.running.turnAroundTime + " cycles.");
                _StdOut.advanceLine();
                _StdOut.putText("Wait time: " + this.running.waitTime + " cycles.");
                _StdOut.advanceLine();
                _OsShell.putPrompt();
            }
            this.running = null;
        };
        ProcessManager.prototype.checkReadyQ = function () {
            if (!this.readyQueue.isEmpty()) {
                this.runnProcess();
            }
            else {
                _CPU.isExecuting = false;
            }
        };
        ProcessManager.prototype.updatePCB = function () {
            this.running.PC = _CPU.PC;
            this.running.Acc = _CPU.Acc;
            this.running.Xreg = _CPU.Xreg;
            this.running.Yreg = _CPU.Yreg;
            this.running.Zflag = _CPU.Zflag;
            this.running.State = "Waiting";
            this.running.IR = _MemoryAccessor.readMem(_CPU.PC).toUpperCase();
        };
        ProcessManager.prototype.exitAProcess = function (pid) {
            var pcbToDel;
            for (var i = 0; i < this.readyQueue.getSize(); i++) {
                var pcb = this.readyQueue.dequeue();
                if (pcb.Pid == pid) {
                    pcbToDel = pcb;
                }
                else {
                    this.readyQueue.enqueue(pcb);
                }
            }
            if (this.running != null) {
                if (this.running.PID == pid) {
                    pcbToDel = this.running;
                    _KernelInterruptQueue.enqueue(new TSOS.Interrupt(EXIT, false));
                }
            }
            if (pcbToDel == null) {
                return false;
            }
            else {
                TSOS.Control.hostLog("Exiting process " + pid, "os");
                _MMU.clearMemoryPartition(pcbToDel.Partition);
                TSOS.Control.hostProcess();
                TSOS.Control.hostCPU();
                return true;
            }
        };
        //Calculate the turnaround and wait times
        ProcessManager.prototype.times = function () {
            this.running.turnAroundTime++;
            for (var i = 0; i < this.readyQueue.getSize(); i++) {
                var pcb = this.readyQueue.dequeue();
                pcb.turnAroundTime++;
                pcb.waitTime++;
                this.readyQueue.enqueue(pcb);
            }
        };
        return ProcessManager;
    }());
    TSOS.ProcessManager = ProcessManager;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=processManager.js.map