///<reference path="../globals.ts" />
///<reference path="queue.ts" />
///<reference path="../host/control.ts" />
///<reference path="../host/devices.ts" />
///<reference path="deviceDriverKeyboard.ts" />
///<reference path="mmu.ts" />
///<reference path="processManager.ts" />
///<reference path="scheduler.ts" />
///<reference path="shell.ts" />
///<reference path="deviceDriverFS.ts" />


/* ------------
     Kernel.ts

     Requires globals.ts
              queue.ts
              mmu.ts
              scheduler.ts
              shell.ts
              processManager.ts
              devices.ts
              control.ts
              devicedriverkeyboard
              devicedriverfs




     Routines for the Operating System, NOT the host.

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */

module TSOS {

    export class Kernel {
        //
        // OS Startup and Shutdown Routines
        //
        public krnBootstrap() {      // Page 8. {
            Control.hostLog("bootstrap", "host");  // Use hostLog because we ALWAYS want this, even if _Trace is off.

            // Initialize our global queues.
            _KernelInterruptQueue = new Queue();  // A (currently) non-priority queue for interrupt requests (IRQs).
            _KernelBuffers = new Array();         // Buffers... for the kernel.
            _KernelInputQueue = new Queue();      // Where device input lands before being processed out somewhere.

            // Initialize the console.
            _Console = new Console();          // The command line interface / console I/O device.
            _Console.init();

            // Initialize standard input and output to the _Console.
            _StdIn  = _Console;
            _StdOut = _Console;

            // Load the Keyboard Device Driver
            this.krnTrace("Loading the keyboard device driver.");
            _krnKeyboardDriver = new DeviceDriverKeyboard();     // Construct it.
            _krnKeyboardDriver.driverEntry();                    // Call the driverEntry() initialization routine.
            this.krnTrace(_krnKeyboardDriver.status);

            this.krnTrace("Loading the disk device driver");
            _krnDiskDriveFile = new DeviceDriverFS();
            _krnDiskDriveFile.driverEntry();
            this.krnTrace(_krnDiskDriveFile.status);

            //
            // ... more?
            //
            
            _MMU = new MMU();
            _ProcessManager = new ProcessManager();

            _Scheduler = new Scheduler();

            _Swapper = new Swapper();


            

            // Enable the OS Interrupts.  (Not the CPU clock interrupt, as that is done in the hardware sim.)
            this.krnTrace("Enabling the interrupts.");
            this.krnEnableInterrupts();

            // Launch the shell.
            this.krnTrace("Creating and Launching the shell.");
            _OsShell = new Shell();
            _OsShell.init();

            // Finally, initiate student testing protocol.
            if (_GLaDOS) {
                _GLaDOS.afterStartup();
            }
        }

        public krnShutdown() {
            this.krnTrace("begin shutdown OS");
            // TODO: Check for running processes.  If there are some, alert and stop. Else...
            //Create a file for the Process Control Block
            // ... Disable the Interrupts.
            this.krnTrace("Disabling the interrupts.");
            this.krnDisableInterrupts();
            //
            // Unload the Device Drivers?
            // More?
            //
            this.krnTrace("end shutdown OS");
        }


        public krnOnCPUClockPulse() {
            /* This gets called from the host hardware simulation every time there is a hardware clock pulse.
               This is NOT the same as a TIMER, which causes an interrupt and is handled like other interrupts.
               This, on the other hand, is the clock pulse from the hardware / VM / host that tells the kernel
               that it has to look for interrupts and process them if it finds any.                           */

            // Check for an interrupt, are any. Page 560
            if (_KernelInterruptQueue.getSize() > 0) {
                // Process the first interrupt on the interrupt queue.
                // TODO: Implement a priority queue based on the IRQ number/id to enforce interrupt priority.
                var interrupt = _KernelInterruptQueue.dequeue();
                this.krnInterruptHandler(interrupt.irq, interrupt.params);
            }
            else if (_CPU.eXecute) {
                // If there are no interrupts then run one CPU cycle if there is anything being processed.
                if (_stepModeON) {
                    if (_trackStep) {
                        _CPU.cycle();
                        Control.hostCPU();
                        _trackStep = false;
                        _Scheduler.watch();
                        _ProcessManager.processTimes();
                        Control.hostMemory();
                        Control.hostProcess();
                    }
                    this.krnTrace("Idle");
                }
                else {
                    _CPU.cycle();
                    Control.hostCPU();
                    _Scheduler.watch();
                    _ProcessManager.processTimes();
                    Control.hostMemory();
                    Control.hostProcess();
                }
            }
            else {                      // If there are no interrupts and there is nothing being executed then just be idle. {
                _trackStep = false;
                this.krnTrace("Idle");
                _ProcessManager.checkReadyQ();
                _Scheduler.unwatch()
            }
        }


        //
        // Interrupt Handling
        //
        public krnEnableInterrupts() {
            // Keyboard
            Devices.hostEnableKeyboardInterrupt();
            // Put more here.
        }

        public krnDisableInterrupts() {
            // Keyboard
            Devices.hostDisableKeyboardInterrupt();
            // Put more here.
        }

        public krnInterruptHandler(irq, params) {
            // This is the Interrupt Handler Routine.  See pages 8 and 560.
            // Trace our entrance here so we can compute Interrupt Latency by analyzing the log file later on. Page 766.
            this.krnTrace("Handling IRQ~" + irq);

            // Invoke the requested Interrupt Service Routine via Switch/Case rather than an Interrupt Vector.
            // TODO: Consider using an Interrupt Vector in the future.
            // Note: There is no need to "dismiss" or acknowledge the interrupts in our design here.
            //       Maybe the hardware simulation will grow to support/require that in the future.
            switch (irq) {
                case TIMER_IRQ:
                    this.krnTimerISR();              // Kernel built-in routine for timers (not the clock).
                    break;
                case KEYBOARD_IRQ:
                    _krnKeyboardDriver.isr(params);   // Kernel mode device driver
                    _StdIn.handleInput();
                    break;
                case WRITECONSOLE:
                    _StdOut.putText(params);
                    break;
                case ERR_BOUND:
                    _StdOut.putText("Out of bounds error in process " + _ProcessManager.running.Pid + ". Exiting...");
                    _StdOut.advanceLine();
                    _OsShell.putPrompt();
                    break;
                case OPINV:
                    _StdOut.putText("Invalid op code in process " + _ProcessManager.running.Pid + ". Exiting...");
                    _StdOut.advanceLine();
                    _OsShell.putPrompt();
                    break;
                case CNTXTSWITCH:
                    _Scheduler.contextSwitches();
                    break;
                case EXIT:
                    _Scheduler.unwatch();
                    _ProcessManager.exitProcess(params);
                    Control.hostProcess();
                    Control.hostCPU();
                    break;
                
                default:
                    this.krnTrapError("Invalid Interrupt Request. irq=" + irq + " params=[" + params + "]");
            }
        }

        public krnTimerISR() {
            // The built-in TIMER (not clock) Interrupt Service Routine (as opposed to an ISR coming from a device driver). {
            // Check multiprogramming parameters and enforce quanta here. Call the scheduler / context switch here if necessary.
        }

        //
        // System Calls... that generate software interrupts via tha Application Programming Interface library routines.
        //
        // Some ideas:
        // - ReadConsole
        // - WriteConsole
        // - CreateProcess
        // - ExitProcess
        // - WaitForProcessToExit
        // - CreateFile
        // - OpenFile
        // - ReadFile
        // - WriteFile
        // - CloseFile


        //
        // OS Utility Routines
        //
        public krnTrace(msg: string) {
             // Check globals to see if trace is set ON.  If so, then (maybe) log the message.
             if (_Trace) {
                if (msg === "Idle") {
                    // We can't log every idle clock pulse because it would lag the browser very quickly.
                    if (_OSclock % 10 == 0) {
                        // Check the CPU_CLOCK_INTERVAL in globals.ts for an
                        // idea of the tick rate and adjust this line accordingly.
                        Control.hostLog(msg, "OS");
                    }
                } else {
                    Control.hostLog(msg, "OS");
                }
             }
        }

        public krnTrapError(msg) {
            Control.hostLog("OS ERROR - TRAP: " + msg);
            // TODO: Display error on console, perhaps in some sort of colored screen. (Maybe blue?)
            _DrawingContext.clearRect(0, 0, _Canvas.width, _Canvas.height);
            _Console.currentXPosition = 0;
            _Console.currentYPosition = _Console.currentFontSize;
            _Console.uhOh();
            _StdOut.putText("Uh-Oh");
            _StdOut.advanceLine();
            _StdOut.putText("Stomething Went Wrong...");
            _StdOut.advanceLine();
            _StdOut.putText("Bye...");
            _StdOut.advanceLine();
            _StdOut.putText("bye...");
            _StdOut.advanceLine();
            _StdOut.putText("x_x");
            _StdOut.advanceLine();
            this.krnShutdown();
        }
    }
}
