/* ------------
   Globals.ts

   Global CONSTANTS and _Variables.
   (Global over both the OS and Hardware Simulation / Host.)

   This code references page numbers in the text book:
   Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
   ------------ */
//
// Global CONSTANTS (TypeScript 1.5 introduced const. Very cool.)
//
var APP_NAME = "TSOS"; // 'cause Bob and I were at a loss for a better name.
var APP_VERSION = "2.1.0"; // What did you expect?
var CPU_CLOCK_INTERVAL = 100; // This is in ms (milliseconds) so 1000 = 1 second.
var TIMER_IRQ = 0; // Pages 23 (timer), 9 (interrupts), and 561 (interrupt priority).
// NOTE: The timer is different from hardware/host clock pulses. Don't confuse these.
var KEYBOARD_IRQ = 1;
//
// Global Variables
// TODO: Make a global object and use that instead of the "_" naming convention in the global namespace.
//
//Hardware(host)
var _Memory;
var _MemoryAccessor;
var ERR_BOUND = 5;
var EXIT = 2;
var WRITECONSOLE = 4;
var OPINV = 6;
var _CPU; // Utilize TypeScript's type annotation system to ensure that _CPU is an instance of the Cpu class.
var _Disk;
var DISK_SPACE = 999;
var DISK_FULL = 1;
var DISK_ITEM = 999;
//Software(OS)
//Memory manager
var _MMU = null;
var _OSclock = 0; // Page 23.
var _Mode = 0; // (currently unused)  0 = Kernel Mode, 1 = User Mode.  See page 21.
var _Swapper = null;
var _Canvas; // Initialized in Control.hostInit().
var _CanvasYHeight = 500;
var _CanvasXWidth = 500;
var _DrawingContext; // = _Canvas.getContext("2d");  // Assigned here for type safety, but re-initialized in Control.hostInit() for OCD and logic.
var _DefaultFontFamily = "sans"; // Ignored, I think. The was just a place-holder in 2008, but the HTML canvas may have use for it.
var _DefaultFontSize = 13;
var _FontHeightMargin = 4; // Additional space added to font size when advancing a line.
var _Trace = true; // Default the OS trace to be on.
// The OS Kernel and its queues.
var _Kernel;
var _KernelInterruptQueue; // Initializing this to null (which I would normally do) would then require us to specify the 'any' type, as below.
var _KernelInputQueue = null; // Is this better? I don't like uninitialized variables. But I also don't like using the type specifier 'any'
var _KernelBuffers = null; // when clearly 'any' is not what we want. There is likely a better way, but what is it?
// Standard input and output
var _StdIn; // Same "to null or not to null" issue as above.
var _StdOut;
// UI
var _Console;
var _OsShell;
// At least this OS is not trying to kill you. (Yet.)
var _SarcasticMode = false;
// Global Device Driver Objects - page 12
var _krnKeyboardDriver; //  = null;
var _krnDiskDriveFile;
var _hardwareClockID = null;
var FILE_NAME_LENGTH = 8;
var FILE_NAME_EXISTS = 2;
var FILE_NAME_AVAILABLE = 3;
var FILE_CREATED = 0;
//Memory and Processes
var _MemorySegmentCount = 3;
var _MemorySegmentSize = 256;
var SYSCALL_IRQ = 2;
var FILESYS_IRQ = 3;
//Scheduler
//var _Scheduler: TSOS.Scheduler;
//Process Manager
var _ProcessManager = null;
var _PID = 0;
var _Scheduler = null;
var _stepModeON = false;
var _trackStep = false;
var ROUNDROBIN = "rr";
var FCFS = "fcfs";
var PRIORITY = "priority";
var CNTXTSWITCH = 3;
var QUICK_FORMAT = 1;
var FULL_FORMAT = 0;
// For testing (and enrichment)...
var Glados = null; // This is the function Glados() in glados.js on Labouseur.com.
var _GLaDOS = null; // If the above is linked in, this is the instantiated instance of Glados.
var onDocumentLoad = function () {
    TSOS.Control.hostInit();
};
