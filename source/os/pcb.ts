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


module TSOS {

    export class PCB {
        //Properties
        constructor(public PC,
                    public IR,
                    public xReg,
                    public yReg,
                    public zFlag,
                    public base,
                    public Acc,
                    public limit,
                    public state,
                    public isTerm = false,
                    public rediOutput = "",
                    public preTime = 0,
                    public runTime = 0,
                    public waitTime = 0,
                    public inMem = true,
                    public priority = -1,
                    public pid = PCB.processCount,
                    //public preTime = _OSclock,
                    //public PCB.processList[PCB.processCount] = this,
                    //public PCB.processCount++
                    ) {
        }

        public ready(): any {
            if (this.state == _State.RESIDENT) {
                this.state = _State.READY;
                return true;
            }
            else {
                return false;
            }
        }

        public start(): any {
            if (this.state == _State.READY) {
                this.state = _State.RUNNING;
                return true;
            }
            else {
                return false;
            }
        }

        public preempt(): any {
            if (this.state == _State.RUNNING) {
                this.state = _State.READY;
                this.syncing();
                this.preTime = _OSclock;
                return true;
            }
            else {
                return false;
            }
        }

        public stop(): any {
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
        }

        public remove(phase): any {
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
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(FILESYS_IRQ,
                    { COMMAND: "del", file: processN, data: "" }));
            }
        }

        public syncing(): void {
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
        }

        public showStats(): void {
            _StdOut.putText("Process [PID " + this.pid + " ] stats");
            _StdOut.advanceLine();
            _StdOut.putText("Turnaround Time: " + this.turnAround + " cycle(s)");
            _StdOut.advanceLine();
            _StdOut.putText("Wait Time: " + this.waitTime + " cycle(s)");
            _OsShell.putPrompt();
        }

        public static getProcesses(pr): void {
            return this.processList.filter(function (pcb) {
                return pcb.pid == p;
            })[0]
        }

        public static processCount(): any {
        }

        public static processList(): Array{
        }
    }
}