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
        constructor(public pid,
                    public base,
                    public limit,
                    public priority,
                    public PC = 0,
                    public xReg = 0,
                    public yReg = 0,
                    public zFlag = 0,
                    public Acc = 0,
                    public swap = false,
                    public turnTime = 0,
                    public waitTime = 0,
                    public burstTime = 0,
                    public memInd = null,
                    public IR = -1,
                    public location = null,) {
                    }
    }
}