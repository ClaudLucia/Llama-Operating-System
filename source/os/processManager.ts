///<reference path="../globals.ts" />


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

        //Creates a process...obviously
        public createProcesses(opCodes, args): void {
            if (opCodes.length > _MMU.totalLimit) {
                _StdOut.putText("Loading Failed! Program is over 256 bytes");
                return;
            }
            if (_MMU.checkMemory(opCodes.length)) {
                let pcb = new PCB(_PID);
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
                let swapBlock = _Swapper.putProcessToDisk(opCodes, _PID);
                if (swapBlock != null) {
                    let pcb = new PCB(_PID);
                    pcb.init(DISK_SPACE);
                    if (args.length > 0) {
                        pcb.Priority = args[0];
                    }
                    else {
                        pcb.Priority = 1;
                    }
                    pcb.ifSwapped = true;
                    pcb.State = "Swapped";
                    this.residentQueue.enqueue(pcb);
                    _StdOut.putText("Program loaded with PID " + _PID);
                    _PID++;
                }
                else {
                    _StdOut.putText("Loading Failed! Program is over 256 bytes");
                }
            }
        }

        public checkReadyQ(): void {
            if (!this.readyQueue.isEmpty()) {
                this.runnProcess();
            }
            else {
                _CPU.eXecute = false;
            }
        }

        //runs a process from memory
        public runnProcess(): void {
            if (_Scheduler.algorithm == PRIORITY) {
                this.running = _Scheduler.HighestP();
            }
            else {
                this.running = this.readyQueue.dequeue();
            }
            _CPU.PC = this.running.PC;
            _CPU.Acc = this.running.Acc;
            _CPU.Xreg = this.running.Xreg;
            _CPU.Yreg = this.running.Yreg;
            _CPU.Zflag = this.running.Zflag;
            _CPU.eXecute = true;

            this.running.State = "Running";
            Control.hostProcess();
            Control.hostCPU();
            Control.hostMemory();
            Control.hostLog("Running process " + this.running.PID, "os");

            if (this.running.ifSwapped) {
                _Swapper.rollIn(this.running);
                this.running.ifSwapped = false;
                this.running.swapBlock = "0:0:0";
            }

        }

        //Run all processes in the ready queu
        public runAllP(): void {
            Control.hostLog("Running all programs", "os");
            while (!this.residentQueue.isEmpty()) {
                this.readyQueue.enqueue(this.residentQueue.dequeue());
            }
        }

        //Is the process running?
        public static runningProcess(): boolean {
            return _ProcessManager.running != null;
        }

        //Lists all the processes
        public listAllP() {
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
        }

        //Exit all the Process from the ready queue and from memory
        public exitAProcess(pid): boolean {
            var exitPCB;
            for (var i = 0; i < this.readyQueue.getSize(); i++) {
                var pcb = this.readyQueue.dequeue();
                if (pcb.Pid == pid) {
                    exitPCB = pcb;
                    if (exitPCB.ifSwapped) {
                        Control.hostLog("Exiting process " + pid, ", os");
                        let filename = "$SWAP" + exitPCB.Pid;
                        _krnDiskDriveFile.krnDiskDelete(filename);
                        return true;
                    }
                }
                else {
                    this.readyQueue.enqueue(pcb);
                }
            }
            if (this.running != null) {
                if (this.running.PID == pid) {
                    exitPCB = this.running;
                    _KernelInterruptQueue.enqueue(new Interrupt(EXIT, false));
                }
            }
            if (exitPCB == null) {
                return false;
            }
            else {
                Control.hostLog("Process " + pid, " exiting. os");
                _MMU.clearMemoryPartition(exitPCB.Partition);
                Control.hostProcess();
                Control.hostCPU();
                return true;
            }
        }
        
        //Exit the Process from the CPU
        public exitProcess(display: boolean): void {
            _Scheduler.unwatch();
            _CPU.init();
            _MMU.clearPartitions(this.running.Partition);
            Control.hostMemory();
            Control.hostLog("Exiting process " + this.running.PID);
            if (display) {
                _StdOut.advanceLine();
                _StdOut.putText("Process ID: " + this.running.PID);
                _StdOut.advanceLine();
                _StdOut.putText("Turnaround time: " + this.running.turnaroundTime + " cycles.");
                _StdOut.advanceLine();
                _StdOut.putText("Wait time: " + this.running.waitTime + " cycles.");
                _StdOut.advanceLine();
                _OsShell.putPrompt();
            }
            let filename = "$SWAP" + this.running.PID;
            _krnDiskDriveFile.krnDiskDelete(filename);
            this.running = null;
        }

       

        //Update the PCB
        public updatePCB(): void {
            this.running.PC = _CPU.PC;
            this.running.Acc = _CPU.Acc;
            this.running.Xreg = _CPU.Xreg;
            this.running.Yreg = _CPU.Yreg;
            this.running.Zflag = _CPU.Zflag;
            this.running.State = "Waiting";
            this.running.IR = _MemoryAccessor.readMem(_CPU.PC).toUpperCase();
        }
        
        //Calculate the turnaround and wait processTimes
        public processTimes() {
            this.running.turnaroundTime++;
            for (var i = 0; i < this.readyQueue.getSize(); i++) {
                var pcb = this.readyQueue.dequeue();
                pcb.turnaroundTime++;
                pcb.waitTime++;
                this.readyQueue.enqueue(pcb);
            }
        }
    }
}