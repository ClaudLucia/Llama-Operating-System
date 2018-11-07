﻿///<reference path="../globals.ts" />
///<reference path="../host/memory.ts" />



/* ------------
     ProcessManager.ts

     ------------ */




module TSOS {

    export class ProcessManager {

        public residentQueue: any;
        public readyQueue: any;
        public running: TSOS.PCB;
        constructor() {
            this.residentQueue = new Queue(),
            this.readyQueue = new Queue()
        }

        public createProcesses(opCodes, args): void {
            if (opCodes.length > _MMU.totalLimit) {
                _StdOut.putText("Loading Failed! Program is over 256 bytes");
                return;
            }
            if (_MMU.checkMemory(opCodes.length)) {
                var pcb = new PCB(_PID);
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
                Control.hostMemory();
                _StdOut.putText("Program loaded with PID " + _PID)
                _PID++;
            }
            else {
                _StdOut.putText("Loading failed! Not enough memory available.");
            }
        }


        public runnProcess() {
            _ProcessManager.running = _ProcessManager.readyQueue.dequeue();

            _CPU.PC = _ProcessManager.running.PC;
            _CPU.Acc = _ProcessManager.running.Acc;
            _CPU.Xreg = _ProcessManager.running.Xreg;
            _CPU.Yreg = _ProcessManager.running.Yreg;
            _CPU.Zflag = _ProcessManager.running.Zflag;
            _CPU.isExecuting = true;

            _ProcessManager.running.State = "Running";
            Control.hostProcess();
            Control.hostCPU();
            Control.hostMemory();
            Control.hostLog("Running process " + this.running.PID, "os");
            
        }

        public runAllP() {
            Control.hostLog("Running all programs", "os");
            while (!_ProcessManager.residentQueue.isEmpty()) {
                _ProcessManager.readyQueue.enqueue(_ProcessManager.residentQueue.dequeue());
            }
        }

        public static runningProcess() {
            return _ProcessManager.running != null;
        }
        

        public listAllP() {
            if (_ProcessManager.running != null) {
                var processes = [];
                for (var i = 0; i < _ProcessManager.readyQueue.getSize(); i++) {
                    var pcb = _ProcessManager.readyQueue.dequeue();
                    processes.push(new String(pcb.PID));
                    _ProcessManager.readyQueue.enqueue(pcb);
                }
                return processes;
            }
            else {
                return [];
            }
        }


        public exitProcess(display: boolean): void {
            _Scheduler.unwatch();
            _CPU.init();
            _MMU.clearPartitions(_ProcessManager.running.Partition);
            Control.hostMemory();
            Control.hostLog("Exiting process " + _ProcessManager.running.PID);
            if (display) {
                _StdOut.advanceLine();
                _StdOut.putText("Process ID: " + _ProcessManager.running.PID);
                _StdOut.advanceLine();
                _StdOut.putText("Turnaround time: " + _ProcessManager.running.turnAroundTime + " cycles.");
                _StdOut.advanceLine();
                _StdOut.putText("Wait time: " + _ProcessManager.running.waitTime + " cycles.");
                _StdOut.advanceLine();
                _OsShell.putPrompt();
            }
            _ProcessManager.running = null;
        }

        public checkReadyQ(): void {
            if (!_ProcessManager.readyQueue.isEmpty()) {
                this.runnProcess();
            }
            else {
                _CPU.isExecuting = false;
            }
        }

        public updatePCB() {
            _ProcessManager.running.PC = _CPU.PC;
            _ProcessManager.running.Acc = _CPU.Acc;
            _ProcessManager.running.Xreg = _CPU.Xreg;
            _ProcessManager.running.Yreg = _CPU.Yreg;
            _ProcessManager.running.Zflag = _CPU.Zflag;
            _ProcessManager.running.State = "Waiting";
            _ProcessManager.running.IR = _MemoryAccessor.readMem(_CPU.PC).toUpperCase();
        }


        public exitAProcess(pid): boolean {
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
                    _KernelInterruptQueue.enqueue(new Interrupt(EXIT, false));
                }
            }
            if (pcbToDel == null) {
                return false;
            }
            else {
                Control.hostLog("Exiting process " + pid, "os");
                _MMU.clearMemoryPartition(pcbToDel.Partition);
                Control.hostProcess();
                Control.hostCPU();
                return true;
            }
        }


        //Calculate the turnaround and wait times
        public times() {
            _ProcessManager.running.turnAroundTime++;
            for (var i = 0; i < _ProcessManager.readyQueue.getSize(); i++) {
                var pcb = _ProcessManager.readyQueue.dequeue();
                pcb.turnAroundTime++;
                pcb.waitTime++;
                _ProcessManager.readyQueue.enqueue(pcb);
            }
        }

    }
}