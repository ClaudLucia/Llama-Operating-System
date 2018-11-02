///<reference path="../globals.ts" />
///<reference path="../os/canvastext.ts" />

/* ------------
     Control.ts

     Requires globals.ts.

     Routines for the hardware simulation, NOT for our client OS itself.
     These are static because we are never going to instantiate them, because they represent the hardware.
     In this manner, it's A LITTLE BIT like a hypervisor, in that the Document environment inside a browser
     is the "bare metal" (so to speak) for which we write code that hosts our client OS.
     But that analogy only goes so far, and the lines are blurred, because we are using TypeScript/JavaScript
     in both the host and client environments.

     This (and other host/simulation scripts) is the only place that we should see "web" code, such as
     DOM manipulation and event handling, and so on.  (Index.html is -- obviously -- the only place for markup.)

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */

//
// Control Services
//
module TSOS {

    export class Control {
        static hostMemory(): any {
            throw new Error("Method not implemented.");
        }

        public static hostInit(): void {
            // This is called from index.html's onLoad event via the onDocumentLoad function pointer.

            // Get a global reference to the canvas.  TODO: Should we move this stuff into a Display Device Driver?
            _Canvas = <HTMLCanvasElement>document.getElementById('display');

            // Get a global reference to the drawing context.
            _DrawingContext = _Canvas.getContext("2d");

            // Enable the added-in canvas text functions (see canvastext.ts for provenance and details).
            CanvasTextFunctions.enable(_DrawingContext);   // Text functionality is now built in to the HTML5 canvas. But this is old-school, and fun, so we'll keep it.

            // Clear the log text box.
            // Use the TypeScript cast to HTMLInputElement
            (<HTMLInputElement> document.getElementById("taHostLog")).value="";

            // Set focus on the start button.
            // Use the TypeScript cast to HTMLInputElement
            (<HTMLInputElement> document.getElementById("btnStartOS")).focus();

            // Check for our testing and enrichment core, which
            // may be referenced here (from index.html) as function Glados().
            if (typeof Glados === "function") {
                // function Glados() is here, so instantiate Her into
                // the global (and properly capitalized) _GLaDOS variable.
                _GLaDOS = new Glados();
                _GLaDOS.init();
            }
        }

        public static hostLog(msg: string, source: string = "?"): void {
            // Note the OS CLOCK.
            var clock: number = _OSclock;

            // Note the REAL clock in milliseconds since January 1, 1970.
            var now: number = new Date().getTime();

            // Build the log string.
            var str: string = "({ clock:" + clock + ", source:" + source + ", msg:" + msg + ", now:" + now  + " })"  + "\n";

            // Update the log console.
            var taLog = <HTMLInputElement> document.getElementById("taHostLog");
            taLog.value = str + taLog.value;

            // TODO in the future: Optionally update a log database or some streaming service.
        }


        //
        // Host Events
        //
        public static hostBtnStartOS_click(btn): void {
            // Disable the (passed-in) start button...
            btn.disabled = true;

            // .. enable the Halt and Reset buttons ...
            (<HTMLButtonElement>document.getElementById("btnHaltOS")).disabled = false;
            (<HTMLButtonElement>document.getElementById("btnReset")).disabled = false;

            // .. set focus on the OS console display ...
            document.getElementById("display").focus();

            // ... Create and initialize the CPU (because it's part of the hardware)  ...
            _CPU = new Cpu();  // Note: We could simulate multi-core systems by instantiating more than one instance of the CPU here.
            _CPU.init();       //       There's more to do, like dealing with scheduling and such, but this would be a start. Pretty cool.

            // ... then set the host clock pulse ...
            _hardwareClockID = setInterval(Devices.hostClockPulse, CPU_CLOCK_INTERVAL);
            // .. and call the OS Kernel Bootstrap routine.
            _Kernel = new Kernel();
            _Kernel.krnBootstrap();  // _GLaDOS.afterStartup() will get called in there, if configured.
        }

        public static hostBtnHaltOS_click(btn): void {
            Control.hostLog("Emergency halt", "host");
            Control.hostLog("Attempting Kernel shutdown.", "host");
            // Call the OS shutdown routine.
            _Kernel.krnShutdown();
            // Stop the interval that's simulating our clock pulse.
            clearInterval(_hardwareClockID);
            // TODO: Is there anything else we need to do here?
        }

        public static hostBtnReset_click(btn): void {
            // The easiest and most thorough way to do this is to reload (not refresh) the document.
            location.reload(true);
            // That boolean parameter is the 'forceget' flag. When it is true it causes the page to always
            // be reloaded from the server. If it is false or not specified the browser may reload the
            // page from its cache, which is not what we want.
        }

        //Status Bar
        public static hostStatus(status): void {
            var msgSta = <HTMLInputElement>document.getElementById('statusMsg');
            msgSta.textContent = status;
        }

        public static load(priority): any {
            var program = (<HTMLInputElement>document.getElementById('taProgramInput')).value;
            program = program.replace(/^\s+ | \s+$/g, "");
            if (program.length === 0 || program.length > (_MemorySegmentSize * 2)) {
                return -1;
            }
            else
                var progArray = program.match(/.{2}/g); 
                //return TSOS.MMU.createProcess(priority, progArray);
            
        }


        //Dsiplay the Processes in the CPU Display
        public static hUpdateDisplay(): void {
            Control.hostUpdateDisplayCPU();
            Control.hostUpdateDisplayMemory();
            Control.hostUpdateDisplayProcesses();
        }

        public static hostUpdateDisplayCPU() {
            var IR = _CPU.IR === -1 ? "00" : TSOS.Utils.tHex(_CPU.IR);
            var CPUElement = document.getElementById("displayCPU");
            var CPUData = (<HTMLInputElement>document.getElementById('CPU')) +
                "<thead>< th > PC < /th>< th > IR < /th>< th > ACC < /th>< th > X < /th>< th > Y < /th>< th > Z < /th>< th > MNE < /th></thead>" +
                "<tr><td>" + TSOS.Utils.tHex(_CPU.PC) + "</td><td>" + IR + "</td><td>" + TSOS.Utils.tHex(_CPU.Acc) +
                "</td><td>" + TSOS.Utils.tHex(_CPU.Xreg) + "</td><td>" + TSOS.Utils.tHex(_CPU.Yreg) +
                "</td><td>" + _CPU.Zflag + "</td></tr></tbody>" +
                "</table>";
            CPUElement.innerHTML = CPUData;
        }

        public static hostUpdateDisplayMemory() {
            var memory = _Memory.getBytes(0, _MemorySegmentSize * _MemorySegmentCount);
            for (var i = 0; i < memory.length; i++) {
                var cell = document.getElementById("th" + i);
                cell.innerHTML = TSOS.Utils.tHex(memory[i]);
            }
        }

        public static hostUpdateDisplayProcesses() {
            var processData = "<th>PID</th>< th > State < /th>< th > Priority < /th>< th > PC < /th>< th > IR < /th>< th > ACC < /th>< th > X < /th>< th > Y < /th>< th > Z </th>";
            var processes = _Scheduler.residentList;
            if (processes.length == 0) {
                processData += "<tr><td colspan='10'>No Programs Running</td></tr>";
            }
            else {
                for (var i = 0; i < processes.length; i++) {
                    var process = processes[i];
                    var IR = process.IR === -1 ? "00" : TSOS.Utils.tHex(process.IR);
                    var state = _Scheduler.readyQueue.peek() == process.pid ? "Executing" : "Ready";
                    processData += `<tr><th>${process.pid}< /th>< th >${state}< /th > <th>${process.priority}< /th>< th >${TSOS.Utils.tHex(process.PC)}< /th > <th>${IR}< /th>< th >${TSOS.Utils.tHex(process.Acc)}< /th > <th>${TSOS.Utils.tHex(process.Xreg)}< /th>< th >${TSOS.Utils.tHex(process.Yreg)}< /th > <th>${process.Zflag}< /th></tr>`
                }
            }
            var processesElement = document.getElementById("processControlBlock");
            processesElement.innerHTML = processData;
        }



    }
}
