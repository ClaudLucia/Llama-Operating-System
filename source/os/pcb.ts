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
        processID;
        PID;
        State: string;
        PC: number;
        IR: string;
        Acc: number;
        Xreg: number;
        Yreg: number;
        Zflag: number;
        Partition;
        turnAroundTime: number;
        waitTime: number;
        Priority:number;

        constructor(processID) {
            this.processID = processID,
            this.PID = processID
        }
        //public PCB(processID) {
        //    let PCB = (processID) => {
        //        processID = processID;
        //        var PID = processID;
        //    }
        
        //Properties
        

        public init(partition): any {
            var State = "Ready";
            var PC = 0;
            var IR = "00";
            var Acc = 0;
            var Xreg = 0;
            var Yreg = 0;
            var Zflag = 0;
            var Partition = partition;
            var turnAroundTime = 0;
            var waitTime = 0;
            var Priority = 1;
        }

    }
}