﻿///<reference path="../globals.ts" />

/* ------------
   scheduler.ts
   
   ------------ */

module TSOS {
    export class Scheduler {

        public schedulingMethod: string;
        public count: number;
        public quantum: number;
        constructor() {
            this.count = 0;
            this.quantum = 6; 
            this.schedulingMethod = ROUNDROBIN;

        }
        
        public watch() {
            if (_ProcessManager.readyQueue.getSize() > 0) {
                // Round Robin scheduling
                if (this.schedulingMethod == ROUNDROBIN) {
                    this.count++;
                    if (this.count == this.quantum) {
                        _KernelInterruptQueue.enqueue(new Interrupt(CNTXTSWITCH, 0));
                        this.count = 0;
                    }
                }
            }
        }

       
        public unwatch() {
            this.count = 0;
        }

        public setschedulingMethod(schedulingMethod: String) {
            switch (schedulingMethod) {
                case ROUNDROBIN:
                    this.schedulingMethod = ROUNDROBIN;
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