//
// Process Control Block
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

    export class PCB{

        public State: string;
        public PID: number;
        public PC: number;
        public IR: String;
        public Acc: number;
        public Xreg: number;
        public Yreg: number;
        public Zflag: number;
        public Partition: number;
        public Priority: number;
        public waitTime: number; 
        public turnaroundTime: number;
        public ifSwapped: boolean;
        public swapBlock: String;
       
        constructor(public processId) {
            this.PID = processId;
        }


        public init(partition: number): void {
            this.State = "Ready";
            this.PC = 0;
            this.IR = "00";
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.Partition = partition;
            this.turnaroundTime = 0;
            this.waitTime = 0;
            this.Priority = 1;
            this.swapBlock = "0:0:0"
            this.ifSwapped = false;
        }

    }
}