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
        constructor(public PC = 0,
                    public xReg = 0,
                    public yReg = 0,
                    public zFlag = 0,
                    public Acc = 0,
                    public state = "Ready",
                    public swap = false,
                    public turnTime = 0,
                    public waitTime = 0,
                    public burstTime = 0,
                    public memInd = null,
                    public priority = -1,
                    public pid = _ProcessCount,
                    public inst = null,
                    public exec = false,
                    public hDD = null,
                    public loc = null,) {
                       }
    }
}