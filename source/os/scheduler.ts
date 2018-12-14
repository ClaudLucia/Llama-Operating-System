///<reference path="../globals.ts" />

/* ------------
   scheduler.ts
   
   ------------ */

module TSOS {
    export class Scheduler {

        public algorithm: string;
        public count: number;
        public quantum: number;
        constructor() {
            this.count = 0;
            this.quantum = 6; 
            this.algorithm = ROUNDROBIN;

        }
        
        public watch() {
            if (_ProcessManager.readyQueue.getSize() > 0) {
                // Round Robin scheduling
                if (this.algorithm == ROUNDROBIN) {
                    this.count++;
                    if (this.count == this.quantum) {
                        _KernelInterruptQueue.enqueue(new Interrupt(CNTXTSWITCH, 0));
                        this.count = 0;
                    }
                }

                //First Come First Served scheduling
                else if (this.algorithm == FCFS) {
                    this.count++;
                    if (this.count == this.quantum) {
                        _KernelInterruptQueue.enqueue(new Interrupt(CNTXTSWITCH, 0));
                        this.count = 0;
                    }
                }

                //Priority scheduling
                else if (this.algorithm == PRIORITY) {
                    let result;
                    let sz = _ProcessManager.readyQueue.getsSize();
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
        }

       
        public unwatch() {
            this.count = 0;
        }

        public setAlgorithm(algorithm: String) {
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
        }

        public setQuantum(num) {
            this.quantum = num;
        }

        public contextSwitches() {
            Control.hostLog("Context switching", "os");
            _ProcessManager.updatePCB();
            this.count = 0;
            _ProcessManager.readyQueue.enqueue(_ProcessManager.running);
            _ProcessManager.runnProcess();
        }

    }
}