///<reference path="../globals.ts" />
///<reference path="../os/canvastext.ts" />
///<reference path="./memory.ts" />
///<reference path="./memoryAccessor.ts" />
///<reference path="./cpu.ts" />
///<reference path="./devices.ts" />
///<reference path="../os/kernel.ts" />
///<reference path="./disk.ts" />
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
var TSOS;
(function (TSOS) {
    var Control = /** @class */ (function () {
        function Control() {
        }
        Control.hostInit = function () {
            // This is called from index.html's onLoad event via the onDocumentLoad function location.
            // Get a global reference to the canvas.  TODO: Should we move this stuff into a Display Device Driver?
            _Canvas = document.getElementById('display');
            // Get a global reference to the drawing context.
            _DrawingContext = _Canvas.getContext("2d");
            // Enable the added-in canvas text functions (see canvastext.ts for provenance and details).
            TSOS.CanvasTextFunctions.enable(_DrawingContext); // Text functionality is now built in to the HTML5 canvas. But this is old-school, and fun, so we'll keep it.
            // Clear the log text box.
            // Use the TypeScript cast to HTMLInputElement
            document.getElementById("taHostLog").value = "";
            // Set focus on the start button.
            // Use the TypeScript cast to HTMLInputElement
            document.getElementById("btnStartOS").focus();
            // Check for our testing and enrichment core, which
            // may be referenced here (from index.html) as function Glados().
            if (typeof Glados === "function") {
                // function Glados() is here, so instantiate Her into
                // the global (and properly capitalized) _GLaDOS variable.
                _GLaDOS = new Glados();
                _GLaDOS.init();
            }
        };
        Control.hostLog = function (msg, source) {
            if (source === void 0) { source = "?"; }
            // Note the OS CLOCK.
            var clock = _OSclock;
            // Note the REAL clock in milliseconds since January 1, 1970.
            var now = new Date().getTime();
            // Build the log string.
            var str = "({ clock:" + clock + ", source:" + source + ", msg:" + msg + ", now:" + now + " })" + "\n";
            // Update the log console.
            var taLog = document.getElementById("taHostLog");
            taLog.value = str + taLog.value;
            // TODO in the future: Optionally update a log database or some streaming service.
        };
        //
        // Host Events
        //
        Control.hostCPU = function () {
            var table = document.getElementById('showCPU');
            table.deleteRow(-1);
            var row = table.insertRow(-1);
            var cell = row.insertCell();
            cell.innerHTML = _CPU.PC.toString(16).toUpperCase();
            cell = row.insertCell();
            if (_CPU.eXecute) {
                cell.innerHTML = _Memory.memArr[_CPU.PC].toString();
            }
            else {
                cell.innerHTML = "00";
            }
            cell = row.insertCell();
            cell.innerHTML = _CPU.Acc.toString(16).toUpperCase();
            cell = row.insertCell();
            cell.innerHTML = _CPU.Xreg.toString(16).toUpperCase();
            cell = row.insertCell();
            cell.innerHTML = _CPU.Yreg.toString(16).toUpperCase();
            cell = row.insertCell();
            cell.innerHTML = _CPU.Zflag.toString(16).toUpperCase();
        };
        Control.hostProcess = function () {
            var table = document.getElementById('displayPCB');
            var readyQueue = [];
            for (var i = 0; i < _ProcessManager.readyQueue.getSize(); i++) {
                var pcb = _ProcessManager.readyQueue.dequeue();
                _ProcessManager.readyQueue.enqueue(pcb);
                readyQueue.push(pcb);
            }
            if (_ProcessManager.running != null) {
                readyQueue.push(_ProcessManager.running);
            }
            while (table.rows.length > 1) {
                table.deleteRow(1);
            }
            while (readyQueue.length > 0) {
                var display = readyQueue.pop();
                var row = table.insertRow(-1);
                var cell = row.insertCell();
                cell.innerHTML = display.PID.toString(16).toUpperCase();
                cell = row.insertCell();
                cell.innerHTML = display.State;
                cell = row.insertCell();
                cell.innerHTML = display.PC.toString(16).toUpperCase();
                cell = row.insertCell();
                cell.innerHTML = display.IR.toString();
                cell = row.insertCell();
                cell.innerHTML = display.Acc.toString(16).toUpperCase();
                cell = row.insertCell();
                cell.innerHTML = display.Xreg.toString(16).toUpperCase();
                cell = row.insertCell();
                cell.innerHTML = display.Yreg.toString(16).toUpperCase();
                cell = row.insertCell();
                cell.innerHTML = display.Zflag.toString(16).toUpperCase();
            }
        };
        Control.initMemDisplay = function () {
            var table = document.getElementById('Memory');
            for (var i = 0; i < (_Memory.memArr.length / 8); i++) {
                var row = table.insertRow(i);
                var Memcell = row.insertCell(0);
                var addr = i * 8;
                var showAddr = "0x";
                for (var k = 0; k < 3 - addr.toString(16).length; k++) {
                    showAddr += "0";
                }
                showAddr += addr.toString(16).toUpperCase();
                Memcell.innerHTML = showAddr;
                for (var j = 1; j < 9; j++) {
                    var cell = row.insertCell(j);
                    cell.innerHTML = "00";
                    cell.classList.add("memoryCell");
                }
            }
        };
        Control.hostMemory = function () {
            var table = document.getElementById('Memory');
            var thisMemory = 0;
            for (var i = 0; i < table.rows.length; i++) {
                for (var j = 1; j < 9; j++) {
                    table.rows[i].cells.item(j).innerHTML = _Memory.memArr[thisMemory].toString().toUpperCase();
                    table.rows[i].cells.item(j).style.color = "black";
                    table.rows[i].cells.item(j).style['font-weight'] = "normal";
                    var dec = parseInt(_Memory.memArr[thisMemory].toString(), 16);
                    if (dec < 16 && dec > 0) {
                        table.rows[i].cells.item(j).innerHTML = "0" + dec.toString(16).toUpperCase();
                    }
                    thisMemory++;
                }
            }
        };
        Control.hostDisk = function () {
            var table = document.getElementById('OSdisk');
            var rows = table.rows.length;
            for (var i = 0; i < rows; i++) {
                table.deleteRow(0);
            }
            var rowNum = 0;
            for (var track = 0; track < _Disk.tracks; track++) {
                for (var sector = 0; sector < _Disk.sectors; sector++) {
                    for (var block = 0; block < _Disk.blocks; block++) {
                        var swapID = track + ":" + sector + ":" + block;
                        var row = table.insertRow(rowNum);
                        rowNum++;
                        row.style.backgroundColor = "white";
                        var swapper = row.insertCell(0);
                        swapper.innerHTML = swapID;
                        swapper.style.color = "red";
                        var bit = row.insertCell(1);
                        bit.innerHTML = JSON.parse(sessionStorage.getItem(swapID)).bit;
                        bit.style.color = "blue";
                        var location = row.insertCell(2);
                        var locVal = JSON.parse(sessionStorage.getItem(swapID)).location;
                        location.innerHTML = locVal;
                        location.style.color = "green";
                        var data = row.insertCell(3);
                        data.innerHTML = JSON.parse(sessionStorage.getItem(swapID)).data.join("").toString();
                        data.style.color = "blue";
                    }
                }
            }
        };
        Control.hostBtnStartOS_click = function (btn) {
            // Disable the (passed-in) start button...
            btn.disabled = true;
            // .. enable the Halt and Reset buttons ...
            document.getElementById("btnHaltOS").disabled = false;
            document.getElementById("btnReset").disabled = false;
            // .. set focus on the OS console display ...
            document.getElementById("display").focus();
            // ... Create and initialize the CPU (because it's part of the hardware)  ...
            _CPU = new TSOS.CPU(); // Note: We could simulate multi-core systems by instantiating more than one instance of the CPU here.
            _CPU.init(); //       There's more to do, like dealing with scheduling and such, but this would be a start. Pretty cool.
            Control.hostCPU();
            _Memory = new TSOS.Memory();
            _Memory.init();
            Control.initMemDisplay();
            _MemoryAccessor = new TSOS.MemoryAccessor();
            _Disk = new TSOS.Disk();
            _Disk.init();
            Control.initDiskDisplay();
            // ... then set the host clock pulse ...
            _hardwareClockID = setInterval(TSOS.Devices.hostClockPulse, CPU_CLOCK_INTERVAL);
            // .. and call the OS Kernel Bootstrap routine.
            _Kernel = new TSOS.Kernel();
            _Kernel.krnBootstrap(); // _GLaDOS.afterStartup() will get called in there, if configured.
        };
        Control.hostBtnHaltOS_click = function (btn) {
            Control.hostLog("Emergency halt", "host");
            Control.hostLog("Attempting Kernel shutdown.", "host");
            // Call the OS shutdown routine.
            _Kernel.krnShutdown();
            // Stop the interval that's simulating our clock pulse.
            clearInterval(_hardwareClockID);
            // TODO: Is there anything else we need to do here?
        };
        Control.hostBtnReset_click = function (btn) {
            // The easiest and most thorough way to do this is to reload (not refresh) the document.
            location.reload(true);
            // That boolean parameter is the 'forceget' flag. When it is true it causes the page to always
            // be reloaded from the server. If it is false or not specified the browser may reload the
            // page from its cache, which is not what we want.
        };
        //Status Bar
        Control.hostStatus = function (status) {
            var msgSta = document.getElementById('statusMsg');
            msgSta.textContent = status;
        };
        Control.initDiskDisplay = function () {
            this.hostDisk();
        };
        return Control;
    }());
    TSOS.Control = Control;
})(TSOS || (TSOS = {}));
