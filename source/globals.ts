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
const APP_NAME: string = "TSOS";   // 'cause Bob and I were at a loss for a better name.
const APP_VERSION: string = "2.1.0";   // What did you expect?

const CPU_CLOCK_INTERVAL: number = 100;   // This is in ms (milliseconds) so 1000 = 1 second.

const TIMER_IRQ: number = 0;  // Pages 23 (timer), 9 (interrupts), and 561 (interrupt priority).
// NOTE: The timer is different from hardware/host clock pulses. Don't confuse these.
const KEYBOARD_IRQ: number = 1;


//
// Global Variables
// TODO: Make a global object and use that instead of the "_" naming convention in the global namespace.
//
//Hardware(host)
var _Memory: TSOS.Memory;
var _MemoryAccessor: TSOS.MemoryAccessor;
var ERR_BOUND: number = 5;
var EXIT: number = 2;
var WRITECONSOLE: number = 4;
var OPINV: number = 6;
var _CPU: TSOS.CPU;  // Utilize TypeScript's type annotation system to ensure that _CPU is an instance of the Cpu class.

var _Disk: TSOS.Disk;

var DISK_SPACE: number = 999;
var DISK_FULL: number = 1;
var DISK_ITEM: number = 999;


//Software(OS)
//Memory manager
var _MMU: any = null;

var _OSclock: number = 0;  // Page 23.

var _Mode: number = 0;     // (currently unused)  0 = Kernel Mode, 1 = User Mode.  See page 21.

var _Swapper: any = null;


var _Canvas: HTMLCanvasElement;         // Initialized in Control.hostInit().
var _CanvasYHeight = 500;
var _CanvasXWidth = 500;
var _DrawingContext: any; // = _Canvas.getContext("2d");  // Assigned here for type safety, but re-initialized in Control.hostInit() for OCD and logic.
var _DefaultFontFamily: string = "sans";        // Ignored, I think. The was just a place-holder in 2008, but the HTML canvas may have use for it.
var _DefaultFontSize: number = 13;
var _FontHeightMargin: number = 4;              // Additional space added to font size when advancing a line.



var _Trace: boolean = true;  // Default the OS trace to be on.

// The OS Kernel and its queues.
var _Kernel: TSOS.Kernel;
var _KernelInterruptQueue;          // Initializing this to null (which I would normally do) would then require us to specify the 'any' type, as below.
var _KernelInputQueue: any = null;  // Is this better? I don't like uninitialized variables. But I also don't like using the type specifier 'any'
var _KernelBuffers: any[] = null;   // when clearly 'any' is not what we want. There is likely a better way, but what is it?

// Standard input and output
var _StdIn;    // Same "to null or not to null" issue as above.
var _StdOut;

// UI
var _Console: TSOS.Console;
var _OsShell: TSOS.Shell;

// At least this OS is not trying to kill you. (Yet.)
var _SarcasticMode: boolean = false;

// Global Device Driver Objects - page 12
var _krnKeyboardDriver; //  = null;
var _krnDiskDriveFile;

var _hardwareClockID: number = null;

var FILE_NAME_LENGTH: number = 8;
var FILE_NAME_EXISTS: number = 2;
var FILE_NAME_AVAILABLE: number = 3;
var FILE_CREATED: number = 0;

//Memory and Processes
var _MemorySegmentCount: number = 3;
var _MemorySegmentSize: number = 256;
var SYSCALL_IRQ: number = 2;
var FILESYS_IRQ: number = 3;


//Scheduler
//var _Scheduler: TSOS.Scheduler;

//Process Manager
var _ProcessManager: any = null;
var _PID: number = 0;

var _Scheduler: any = null;

var _stepModeON: boolean = false;

var _trackStep: boolean = false;

const ROUNDROBIN: string = "rr"
const FCFS: string = "fcfs";
const PRIORITY: string = "priority";
const CNTXTSWITCH: number = 3;

const QUICK_FORMAT: number = 1;
const FULL_FORMAT: number = 0;

// For testing (and enrichment)...
var Glados: any = null;  // This is the function Glados() in glados.js on Labouseur.com.
var _GLaDOS: any = null; // If the above is linked in, this is the instantiated instance of Glados.

var onDocumentLoad = function () {
    TSOS.Control.hostInit();
};