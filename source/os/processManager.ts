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

        public createProcesses(opCodes, args): any {
            if (opCodes.length > _MMU.totalLimit) {
                _StdOut.putTest("Loading Failed! Program is over 256 bytes");
                return;
            }
            if (_MMU.checkMemory(opCodes.length)) {
                var pcb = new PCB(PID);
                var partition = _MMU.getPartitions(opCodes.length);
                pcb.init(partition);
                if (args.length > 0) {
                    pcb.Priority = parseInt(args[0]);
                }

                else {
                    pcb.Priority = 1;
                }

                _ProcessManager.residentQueue.enqueue(pcb);
                _MMU.loadMemory(opCodes, partition);
                Control.hostMemory();
                _StdOut.putText("Program loaded with PID " + PID)
                PID++;
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

            //TSOS.Control.hostUpdateDisplayProcesses();
            //TSOS.Control.hostUpdateDisplayCPU();
            //Update All displays
            Control.hUpdateDisplay();
            Control.hostLog("Running process " + _ProcessManager.running.PID);
        }

        public runAllP() {
            Control.hostLog("Running all programs");
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


        public exitProcesses(display) {
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

        public updatePCB() {
            _ProcessManager.running.PC = _CPU.PC;
            _ProcessManager.running.Acc = _CPU.Acc;
            _ProcessManager.running.Xreg = _CPU.Xreg;
            _ProcessManager.running.Yreg = _CPU.Yreg;
            _ProcessManager.running.Zflag = _CPU.Zflag;
            _ProcessManager.running.State = "Waiting";
            _ProcessManager.running.IR = _MemoryAccessor.readMem(_CPU.PC).toUpperCase();

        }

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