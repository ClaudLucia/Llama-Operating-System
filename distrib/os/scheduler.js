///<reference path="../globals.ts" />
/* ------------
   scheduler.ts
   
   ------------ */
var TSOS;
(function (TSOS) {
    var Scheduler = /** @class */ (function () {
        function Scheduler() {
            this.count = 0;
            this.quantum = 6;
            this.algorithm = ROUNDROBIN;
        }
        Scheduler.prototype.watch = function () {
            if (_ProcessManager.readyQueue.getSize() > 0) {
                // Round Robin scheduling
                if (this.algorithm == ROUNDROBIN) {
                    this.count++;
                    if (this.count == this.quantum) {
                        _KernelInterruptQueue.enqueue(new TSOS.Interrupt(CNTXTSWITCH, 0));
                        this.count = 0;
                    }
                }
                //First Come First Served scheduling
                else if (this.algorithm == FCFS) {
                    this.count++;
                    if (this.count == this.quantum) {
                        _KernelInterruptQueue.enqueue(new TSOS.Interrupt(CNTXTSWITCH, 0));
                        this.count = 0;
                    }
                }
                //Priority scheduling
                else if (this.algorithm == PRIORITY) {
                    var result = void 0;
                    var sz = _ProcessManager.readyQueue.getsSize();
                    for (var i = 0; i < sz; i++) {
                        var pcb = _ProcessManager.readyQueue.dequeue();
                        if (result == null) {
                            result = pcb;
                        }
                        else {
                            if (pcb.Priority < result.Priority) {
                                _ProcessManager.readyQueue.enqueue(result);
                                result = pcb;
                            }
                            else {
                                _ProcessManager.readyQueue.enqueue(pcb);
                            }
                        }
                    }
                    return result;
                }
            }
        };
        Scheduler.prototype.unwatch = function () {
            this.count = 0;
        };
        Scheduler.prototype.setAlgorithm = function (algorithm) {
            switch (algorithm) {
                case ROUNDROBIN:
                    this.algorithm = ROUNDROBIN;
                    break;
                case FCFS:
                    this.algorithm = FCFS;
                    this.quantum = 999999;
                    break;
                case PRIORITY:
                    this.algorithm = PRIORITY;
                    break;
                default:
                    return false;
            }
            return true;
        };
        Scheduler.prototype.setQuantum = function (num) {
            this.quantum = num;
        };
        Scheduler.prototype.contextSwitches = function () {
            TSOS.Control.hostLog("Context switching", "os");
            _ProcessManager.updatePCB();
            this.count = 0;
            _ProcessManager.readyQueue.enqueue(_ProcessManager.running);
            _ProcessManager.runnProcess();
        };
        return Scheduler;
    }());
    TSOS.Scheduler = Scheduler;
})(TSOS || (TSOS = {}));
