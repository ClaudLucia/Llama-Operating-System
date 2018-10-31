///<reference path="../globals.ts" />
///<reference path="../host/memoryAccessor.ts" />

/* ------------
     CPU.ts

     Requires global.ts.

     Routines for the host CPU simulation, NOT for the OS itself.
     In this manner, it's A LITTLE BIT like a hypervisor,
     in that the Document environment inside a browser is the "bare metal" (so to speak) for which we write code
     that hosts our client OS. But that analogy only goes so far, and the lines are blurred, because we are using
     TypeScript/JavaScript in both the host and client environments.

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */

module TSOS {

    export class Cpu {

        constructor(public PC: number = 0,
            public Acc: number = 0,
            public Xreg: number = 0,
            public Yreg: number = 0,
            public Zflag: number = 0,
            public isExecuting: boolean = false,
            public IR: number = -1,
            public pid: number = -1,
            public base: number = -1,
            public limit: number = -1,
            public opCode: string = "") {

        }

        public init(): void {
            this.pid = 0;
            this.PC = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.isExecuting = false;
            this.IR = null;

        }

        public sync(): void {
            this.pid = 0;
            this.PC = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.isExecuting = false;
        }

        public cycle(): void {
            _Kernel.krnTrace('CPU cycle');
            // TODO: Accumulate CPU usage and profiling statistics here.
            // Do the real work here. Be sure to set this.isExecuting appropriately.

            var opCodeInd = TSOS.MMU.getAddr(this.PC, this.base);
            var opCodeByte = TSOS.MMU.getBLogicalAddress(this.PC, this.base, this.limit);
            this.IR = opCodeByte;
            this.PC += 1;

            var opCode = this.opCodeExec[opCodeByte];

            opCode.fn.call(this);
            this.PC += opCode.operandSize;

            this.store(this.current());


            if (_SingleStepMode === true) {
                this.isExecuting = false;
            }
            TSOS.Control.hUpdateDisplay();
            
        }
        public store(pcb): void {
            pcb.pid = this.pid;
            pcb.pc = this.PC;
            pcb.Acc = this.Acc;
            pcb.IR = this.IR;
            pcb.xReg = this.Xreg;
            pcb.yReg = this.Yreg;
            pcb.zFlag = this.Zflag;
        }
        public load(pcb) {
            this.pid = pcb.pid;
            this.PC = pcb.pc;
            this.Acc = pcb.Acc;
            this.IR = pcb.IR;
            this.Xreg = pcb.xReg;
            this.Yreg = pcb.yReg;
            this.Zflag = pcb.zFlag;
        }
        public killProcesses() {
            this.isExecuting = false;
            this.pid = -1;
        }

        public opCodeExec(pcb) {
            //Use a switch case for the opCode

            //Grap the opCode from User Program Input
            var code = _MemoryAccessor.readMemory(this.PC);
            switch (code) {
                /*break*/
                case "0x00":
                    break;

                /*LDA*/
                case "0x":
                    break;

                /*STA*/
                case "0x":
                    break;

            }

        }
        
        public current(): void {
            //return _Scheduler.getProcessforPid(this.pid);
        }
    }
}
