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
            this.schedulingMethod = ROUNDROBIN;
        }
        Scheduler.prototype.watch = function () {
            if (_ProcessManager.readyQueue.getSize() > 0) {
                // Round Robin scheduling
                if (this.schedulingMethod == ROUNDROBIN) {
                    this.count++;
                    if (this.count == this.quantum) {
                        _KernelInterruptQueue.enqueue(new TSOS.Interrupt(CNTXTSWITCH, 0));
                        this.count = 0;
                    }
                }
            }
        };
        Scheduler.prototype.unwatch = function () {
            this.count = 0;
        };
        Scheduler.prototype.setschedulingMethod = function (schedulingMethod) {
            switch (schedulingMethod) {
                case ROUNDROBIN:
                    this.schedulingMethod = ROUNDROBIN;
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
//# sourceMappingURL=scheduler.js.map