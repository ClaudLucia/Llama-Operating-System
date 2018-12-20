/*These refrence paths pull the variables for this file.
Works like src in html
*/
///<reference path="../globals.ts" />
///<reference path="../utils.ts" />
///<reference path="shellCommand.ts" />
///<reference path="userCommand.ts" />
///<reference path="pcb.ts" />
///<reference path="mmu.ts" />
/* ------------
   Shell.ts

   The OS Shell - The "command line interface" (CLI) for the console.

    Note: While fun and learning are the primary goals of all enrichment center activities,
          serious injuries may occur when trying to write your own Operating System.
   ------------ */
// TODO: Write a base class / prototype for system services and let Shell inherit from it.
var TSOS;
(function (TSOS) {
    var Shell = /** @class */ (function () {
        function Shell() {
            // Properties
            this.promptStr = ">";
            this.commandList = [];
            this.curses = "[fuvg],[cvff],[shpx],[phag],[pbpxfhpxre],[zbgureshpxre],[gvgf]";
            this.apologies = "[sorry]";
            this.statusStr = "";
            this.cmdHistory = [];
            this.hisInd = 0;
            this.helpList = [];
        }
        Shell.prototype.init = function () {
            var sc;
            //
            // Load the command list.
            //Load
            sc = new TSOS.ShellCommand(this.shellLoad, "load", " - Load a program from user input");
            this.commandList[this.commandList.length] = sc;
            //Run
            sc = new TSOS.ShellCommand(this.shellRun, "run", "- Run a program from memory");
            this.commandList[this.commandList.length] = sc;
            this.helpList[this.helpList.length] = sc;
            //RunAll
            sc = new TSOS.ShellCommand(this.shellRunAll, "runall", " - Runs all programs from memory");
            this.commandList[this.commandList.length] = sc;
            this.helpList[this.helpList.length] = sc;
            //Clear Memory
            sc = new TSOS.ShellCommand(this.shellClearMem, "clearmem", " - Clears all the memory partitions");
            this.commandList[this.commandList.length] = sc;
            //Status Bar
            sc = new TSOS.ShellCommand(this.shellStatus, "status", "- changes the text of the status bar");
            this.commandList[this.commandList.length] = sc;
            //date
            sc = new TSOS.ShellCommand(this.shellDate, "date", "- displays the current date and time");
            this.commandList[this.commandList.length] = sc;
            //Where Am I
            sc = new TSOS.ShellCommand(this.shellWhereAMI, "whereami", "- displays the users current location");
            this.commandList[this.commandList.length] = sc;
            //Why Llamas?
            sc = new TSOS.ShellCommand(this.shellWhyLlamas, "llamas", "- learn more about llamas");
            this.commandList[this.commandList.length] = sc;
            // ver
            sc = new TSOS.ShellCommand(this.shellVer, "ver", "- Displays the current version data.");
            this.commandList[this.commandList.length] = sc;
            // help
            sc = new TSOS.ShellCommand(this.shellHelp, "help", "- This is the help command. Seek help.");
            this.commandList[this.commandList.length] = sc;
            // shutdown
            sc = new TSOS.ShellCommand(this.shellShutdown, "shutdown", "- Shuts down LlamaOS but leaves the underlying host / hardware simulation running.");
            this.commandList[this.commandList.length] = sc;
            // cls
            sc = new TSOS.ShellCommand(this.shellCls, "cls", "- Clears the screen and resets the cursor position.");
            this.commandList[this.commandList.length] = sc;
            // man <topic>
            sc = new TSOS.ShellCommand(this.shellMan, "man", "<topic> - Displays the MANual page for <topic>.");
            this.commandList[this.commandList.length] = sc;
            // trace <on | off>
            sc = new TSOS.ShellCommand(this.shellTrace, "trace", "<on | off> - Turns the OS trace on or off.");
            this.commandList[this.commandList.length] = sc;
            // rot13 <string>
            sc = new TSOS.ShellCommand(this.shellRot13, "rot13", "<string> - Does rot13 obfuscation on <string>.");
            this.commandList[this.commandList.length] = sc;
            // prompt <string>
            sc = new TSOS.ShellCommand(this.shellPrompt, "prompt", "<string> - Sets the prompt.");
            this.commandList[this.commandList.length] = sc;
            //Happy Halloween
            sc = new TSOS.ShellCommand(this.shellBoo, "boo", " - Scary stuff may happen");
            this.commandList[this.commandList.length] = sc;
            // ps  - list the running processes and their IDs
            sc = new TSOS.ShellCommand(this.shellPS, "ps", "- List the running processes and their IDs");
            this.commandList[this.commandList.length] = sc;
            // kill <id> - kills the specified process id.
            sc = new TSOS.ShellCommand(this.shellKill, "kill", " <id> - Kills the specified process id");
            this.commandList[this.commandList.length] = sc;
            //quantum - Sets the Round Robin quantum
            sc = new TSOS.ShellCommand(this.shellQuantum, "quantum", "<int> - Sets the Round Robin quantum");
            this.commandList[this.commandList.length] = sc;
            this.helpList[this.helpList.length] = sc;
            //create <filname> - create a file
            sc = new TSOS.ShellCommand(this.shellCreateFile, "create", "<filname> - Create a file ");
            this.commandList[this.commandList.length] = sc;
            this.helpList[this.helpList.length] = sc;
            //read <filname> - read a file
            sc = new TSOS.ShellCommand(this.shellReadFile, "read", "<filname> - Read a file");
            this.commandList[this.commandList.length] = sc;
            this.helpList[this.helpList.length] = sc;
            //write <filname> - create a file
            sc = new TSOS.ShellCommand(this.shellWriteFile, "write", "<filname> \"text\" - Write a file");
            this.commandList[this.commandList.length] = sc;
            this.helpList[this.helpList.length] = sc;
            //delete <filname> - create a file
            sc = new TSOS.ShellCommand(this.shellDeleteFile, "delete", "<filname>  - Delete a file");
            this.commandList[this.commandList.length] = sc;
            this.helpList[this.helpList.length] = sc;
            //ls - Lists the files currently stored in the disk
            sc = new TSOS.ShellCommand(this.shellList, "ls", " [-l] - Lists all the files currently on the disk");
            this.commandList[this.commandList.length] = sc;
            this.helpList[this.helpList.length] = sc;
            //Set Scedule - Change the schedluer to an algorithm: RR(is default), FCFS, Priority
            sc = new TSOS.ShellCommand(this.shellSetSchedule, "setschedule", " - Change the schedluer to an algorithm");
            this.commandList[this.commandList.length] = sc;
            this.helpList[this.helpList.length] = sc;
            //Get Schedule - Gets the current scheduling algorithm
            sc = new TSOS.ShellCommand(this.shellGetSchedule, "getschedule", " - Gets the current scheduling algorithm");
            this.commandList[this.commandList.length] = sc;
            this.helpList[this.helpList.length] = sc;
            //format - initialize all blocks in all sectors in all tracks
            sc = new TSOS.ShellCommand(this.shellFormat, "format", " [-quick] [-full] - Format the disk");
            this.commandList[this.commandList.length] = sc;
            this.helpList[this.helpList.length] = sc;
            //Check Disk - Revcover delted files on the disk
            sc = new TSOS.ShellCommand(this.shellCheckDisk, "chkdsk", "[-like] - Revcover delted files on the disk");
            this.commandList[this.commandList.length] = sc;
            this.helpList[this.helpList.length] = sc;
            // Display the initial prompt.
            this.putPrompt();
        };
        //CLASSES
        Shell.prototype.putPrompt = function () {
            _StdOut.putText(this.promptStr);
        };
        Shell.prototype.handleInput = function (buffer) {
            _Kernel.krnTrace("Shell Command~" + buffer);
            if (buffer && buffer !== "") {
                this.cmdHistory.push(buffer);
                this.hisInd = this.cmdHistory.length;
            }
            //
            // Parse the input...
            //
            var userCommand = this.parseInput(buffer);
            // ... and assign the command and args to local variables.
            var cmd = userCommand.command;
            var args = userCommand.args;
            //
            // Determine the command and execute it.
            //
            // TypeScript/JavaScript may not support associative arrays in all browsers so we have to iterate over the
            // command list in attempt to find a match.  TODO: Is there a better way? Probably. Someone work it out and tell me in class.
            var index = 0;
            var found = false;
            var fn = undefined;
            while (!found && index < this.commandList.length) {
                if (this.commandList[index].command === cmd) {
                    found = true;
                    fn = this.commandList[index].func;
                }
                else {
                    ++index;
                }
            }
            if (found) {
                this.execute(fn, args);
            }
            else {
                // It's not found, so check for curses and apologies before declaring the command invalid.
                if (this.curses.indexOf("[" + TSOS.Utils.rot13(cmd) + "]") >= 0) { // Check for curses.
                    this.execute(this.shellCurse);
                }
                else if (this.apologies.indexOf("[" + cmd + "]") >= 0) { // Check for apologies.
                    this.execute(this.shellApology);
                }
                else { // It's just a bad command. {
                    this.execute(this.shellInvalidCommand);
                }
            }
        };
        // Note: args is an option parameter, ergo the ? which allows TypeScript to understand that.
        Shell.prototype.execute = function (fn, args) {
            // We just got a command, so advance the line...
            _StdOut.advanceLine();
            // ... call the command function passing in the args with some über-cool functional programming ...
            fn(args);
            // Check to see if we need to advance the line again
            if (_StdOut.currentXPosition > 0) {
                _StdOut.advanceLine();
            }
            // ... and finally write the prompt again.
            this.putPrompt();
        };
        Shell.prototype.parseInput = function (buffer) {
            var retVal = new TSOS.UserCommand();
            // 1. Remove leading and trailing spaces.
            buffer = TSOS.Utils.trim(buffer);
            // 2. Lower-case it.
            buffer = buffer.toLowerCase();
            // 3. Separate on spaces so we can determine the command and command-line args, if any.
            var tempList = buffer.split(" ");
            // 4. Take the first (zeroth) element and use that as the command.
            var cmd = tempList.shift(); // Yes, you can do that to an array in JavaScript.  See the Queue class.
            // 4.1 Remove any left-over spaces.
            cmd = TSOS.Utils.trim(cmd);
            // 4.2 Record it in the return value.
            retVal.command = cmd;
            // 5. Now create the args array from what's left.
            for (var i in tempList) {
                var arg = TSOS.Utils.trim(tempList[i]);
                if (arg != "") {
                    retVal.args[retVal.args.length] = tempList[i];
                }
            }
            return retVal;
        };
        Shell.prototype.getLastCmd = function () {
            if (!this.cmdHistory.length) {
                return "";
            }
            if (this.hisInd > 0) {
                this.hisInd--;
            }
            return this.cmdHistory[this.hisInd];
        };
        Shell.prototype.getFirstCmd = function () {
            if (!this.cmdHistory.length) {
                return "";
            }
            if (this.hisInd < this.cmdHistory.length) {
                this.hisInd++;
            }
            if (this.hisInd === this.cmdHistory.length) {
                return "";
            }
            return this.cmdHistory[this.hisInd];
        };
        //
        // Shell Command Functions.  Kinda not part of Shell() class exactly, but
        // called from here, so kept here to avoid violating the law of least astonishment.
        //
        Shell.prototype.shellInvalidCommand = function () {
            _StdOut.putText("Invalid Command. ");
            if (_SarcasticMode) {
                _StdOut.putText("Unbelievable. You, [subject name here],");
                _StdOut.advanceLine();
                _StdOut.putText("must be the pride of [subject hometown here].");
            }
            else {
                _StdOut.putText("Type 'help' for, well... help.");
            }
        };
        Shell.prototype.shellCurse = function () {
            _StdOut.putText("Oh, so that's how it's going to be, eh? Fine.");
            _StdOut.advanceLine();
            _StdOut.putText("...Cottonheaded Ninnymuggins.");
            _SarcasticMode = true;
        };
        Shell.prototype.shellApology = function () {
            if (_SarcasticMode) {
                _StdOut.putText("I think we can put our differences behind us.");
                _StdOut.advanceLine();
                _StdOut.putText("For science . . . You monster.");
                _SarcasticMode = false;
            }
            else {
                _StdOut.putText("For what?");
            }
        };
        Shell.prototype.shellVer = function (args) {
            _StdOut.putText(APP_NAME + " version " + APP_VERSION);
        };
        Shell.prototype.shellHelp = function (args) {
            _StdOut.putText("Commands:");
            for (var i in _OsShell.commandList) {
                _StdOut.advanceLine();
                _StdOut.putText("  " + _OsShell.commandList[i].command + " " + _OsShell.commandList[i].description);
            }
        };
        Shell.prototype.shellShutdown = function (args) {
            _StdOut.putText("Shutting down...");
            // Call Kernel shutdown routine.
            _Kernel.krnShutdown();
            // TODO: Stop the final prompt from being displayed.  If possible.  Not a high priority.  (Damn OCD!)
        };
        Shell.prototype.shellCls = function (args) {
            _StdOut.clearScreen();
            _StdOut.resetXY();
        };
        Shell.prototype.shellMan = function (args) {
            if (args.length > 0) {
                var topic = args[0];
                switch (topic) {
                    case "help":
                        _StdOut.putText("Help displays a list of (hopefully) valid commands.");
                        break;
                    // TODO: Make descriptive MANual page entries for the the rest of the shell commands here.
                    case "ver":
                        _StdOut.putText("Ver displays the version number of the current LlamaOS");
                        break;
                    case "date":
                        _StdOut.putText("Date displays the current date");
                        break;
                    case "whereami":
                        _StdOut.putText("Whereami tells the user where they currently are in the world(but it does not give life advice, sorry)");
                        break;
                    case "llamas":
                        _StdOut.putText("Llamas gives information about the animal and explains why it is the name of the operating system");
                        break;
                    case "shutdown":
                        _StdOut.putText("shuts down LlamaOS but leaves the host running");
                        break;
                    case "cls":
                        _StdOut.putText("Clears the text on the screen and resets the cursor");
                        break;
                    case "trace":
                        _StdOut.putText("Turns the trace on or off for the operating system");
                        break;
                    case "rot13":
                        _StdOut.putText("Encrypts the string by implementing a cypher that switches each letter with a letter 13 steps away from it in the alphabet");
                        break;
                    case "prompt":
                        _StdOut.putText("Sets the prompt");
                        break;
                    case "status":
                        _StdOut.putText("Sets the text of the status bar on the top");
                        break;
                    case "load":
                        _StdOut.putText("Loads a program from User Program Input");
                        break;
                    case "run":
                        _StdOut.putText("Runs a program from memory");
                        break;
                    case "runall":
                        _StdOut.putText("runs all programs from memory");
                        break;
                    case "clearmem":
                        _StdOut.putText("Clears all the memory partitions");
                        break;
                    case "ps":
                        _StdOut.putText("List the running processes and their IDs");
                        break;
                    case "kill":
                        _StdOut.putText("<id> - Kills the specified process id");
                        break;
                    case "quantum":
                        _StdOut.putText("<int> - Sets the Round Robin quantum");
                        break;
                    case "boo":
                        _StdOut.putText("Try it and see what happens");
                        break;
                    case "create":
                        _StdOut.putText("Create a file");
                        break;
                    case "read":
                        _StdOut.putText("Read a file");
                        break;
                    case "write":
                        _StdOut.putText("Write a file");
                        break;
                    case "delete":
                        _StdOut.putText("Delete a file");
                        break;
                    case "format":
                        _StdOut.putText("Format the disk");
                        break;
                    case "ls":
                        _StdOut.putText("Lists all the files currently on the disk");
                        break;
                    case "setschedule":
                        _StdOut.putText("Change the schedluer to an algorithm");
                        break;
                    case "getschedule":
                        _StdOut.putText("Gets the current scheduling algorithm");
                        break;
                    case "chkdsk":
                        _StdOut.putText("Revcover delted files on the disk");
                        break;
                    default:
                        _StdOut.putText("No manual entry for " + args[0] + ".");
                }
            }
            else {
                _StdOut.putText("Usage: man <topic>  Please supply a topic.");
            }
        };
        //Clears the memory
        Shell.prototype.shellClearMem = function () {
            if (_MMU.clearAll()) {
                _StdOut.putText("All memory partitions cleared!");
            }
            else {
                _StdOut.putText("Oops! There are programs in memory being run!");
            }
        };
        //OS Error
        Shell.prototype.shellBoo = function (args) {
            _Kernel.krnTrapError("OS Error");
        };
        Shell.prototype.shellTrace = function (args) {
            if (args.length > 0) {
                var setting = args[0];
                switch (setting) {
                    case "on":
                        if (_Trace && _SarcasticMode) {
                            _StdOut.putText("Trace is already on, doofus.");
                        }
                        else {
                            _Trace = true;
                            _StdOut.putText("Trace ON");
                        }
                        break;
                    case "off":
                        _Trace = false;
                        _StdOut.putText("Trace OFF");
                        break;
                    default:
                        _StdOut.putText("Invalid arguement.  Usage: trace <on | off>.");
                }
            }
            else {
                _StdOut.putText("Usage: trace <on | off>");
            }
        };
        //Rot13 encryption on a string
        Shell.prototype.shellRot13 = function (args) {
            if (args.length > 0) {
                // Requires Utils.ts for rot13() function.
                _StdOut.putText(args.join(' ') + " = '" + TSOS.Utils.rot13(args.join(' ')) + "'");
            }
            else {
                _StdOut.putText("Usage: rot13 <string>  Please supply a string.");
            }
        };
        //Sets the prompt. Default is >
        Shell.prototype.shellPrompt = function (args) {
            if (args.length > 0) {
                _OsShell.promptStr = args[0];
            }
            else {
                _StdOut.putText("Usage: prompt <string>  Please supply a string.");
            }
        };
        //Display the current time
        Shell.prototype.shellDate = function (args) {
            var day = new Date();
            _StdOut.putText(day);
        };
        //Displays where the user(hopefully) is
        Shell.prototype.shellWhereAMI = function (args) {
            _StdOut.putText("You're in front of a screen staring into a screen that is immiting blue light");
            _StdOut.advanceLine();
            _StdOut.putText("...");
            _StdOut.advanceLine();
            _StdOut.putText("You might wanna get some sleep");
        };
        //Why not?
        Shell.prototype.shellWhyLlamas = function (args) {
            _StdOut.putText("They are very social animals and live with other llamas as a herd.");
            _StdOut.advanceLine();
            _StdOut.putText("The wool produced by a llama is very soft and lanolin-free.");
            _StdOut.advanceLine();
            _StdOut.putText("Llamas are intelligent and can learn simple tasks after a few repetitions.");
            _StdOut.advanceLine();
            _StdOut.putText("Also they're awesome");
        };
        //Set the staus on the top
        Shell.prototype.shellStatus = function (args) {
            if (args.length > 0) {
                TSOS.Control.hostStatus(args.join(' '));
            }
            else {
                _StdOut.putText("Usage: status <string>  Please supply a string.");
            }
        };
        //Validates that there is a code in the User Program Input
        Shell.prototype.validate = function (program) {
            if (!program) {
                _StdOut.putText("Please enter a code in User Program Input");
                return null;
            }
        };
        //Loads the program from the User Program Input
        Shell.prototype.shellLoad = function (args) {
            var input = /[0-9A-Fa-f]{2}/i;
            var errorHandling = false;
            //Grab program input and format it
            var program = document.getElementById("taProgramInput").value;
            program = program.replace(/\r?\n|\r/g, " ");
            program = program.replace(/\s+/g, " ").trim();
            program = program.trim();
            var programArr = program.split(" ");
            for (var i = 0, programArrB = programArr; i < programArr.length; i++) {
                var opCode = programArrB[i];
                if ((opCode.length != 2 || !input.test(opCode))) {
                    _StdOut.putText("Please enter a valid code in User Program Input");
                    errorHandling = true;
                    break;
                }
            }
            if (!errorHandling) {
                if (args.length > 1) {
                    _StdOut.putText("Please supply a valid priority number.");
                    return;
                }
                if (args.length == 1) {
                    if (!args[0].match(/^[0-9]\d*$/)) {
                        _StdOut.putText("Please supply a valid priority number.");
                        return;
                    }
                }
                _ProcessManager.createProcesses(programArr, args);
            }
        };
        //Runs a program from the memory
        Shell.prototype.shellRun = function (args) {
            if (args.length == 1) {
                var ifPid = false;
                for (var i = 0; i < _ProcessManager.residentQueue.getSize(); i++) {
                    var pcb = _ProcessManager.residentQueue.dequeue();
                    if (pcb.Pid == args[0]) {
                        _ProcessManager.readyQueue.enqueue(pcb);
                        ifPid = true;
                    }
                    else {
                        _ProcessManager.residentQueue.enqueue(pcb);
                    }
                }
                if (!ifPid) {
                    _StdOut.putText("Please input a valid process ID.");
                }
            }
            else {
                _StdOut.putText("Please input a valid process ID.");
            }
        };
        //Runs all the programs from memory
        Shell.prototype.shellRunAll = function () {
            _ProcessManager.runAllP();
        };
        Shell.prototype.shellPS = function () {
            var arr = _ProcessManager.listAllP();
            if (arr.length == 0) {
                _StdOut.putText("No active processes");
                return;
            }
            _StdOut.putText("Active processes' PIDs: ");
            while (arr.length > 0) {
                _StdOut.putText(arr.pop());
                if (arr.length != 0) {
                    _StdOut.putText(", ");
                }
                else {
                    _StdOut.putText(".");
                }
            }
        };
        //Murderer
        Shell.prototype.shellKill = function (args) {
            if (args.length == 1) {
                var foundPid = _ProcessManager.exitAProcess(args[0]);
                if (!foundPid) {
                    _StdOut.putText("Please supply a valid process ID.");
                }
                else {
                    _StdOut.putText("Process " + args[0] + " killed.");
                }
            }
            else {
                _StdOut.putText("Please supply a process ID.");
            }
        };
        //Set the quantum for RR
        Shell.prototype.shellQuantum = function (args) {
            if (args.length == 1) {
                var num = parseInt(args[0]);
                if (isNaN(num)) {
                    _StdOut.putText("Please supply a valid integer");
                }
                else {
                    if (typeof num === "number") {
                        _Scheduler.setQuantum(args[0]);
                        _StdOut.putText("Round robin quantum set to " + num);
                    }
                }
            }
            else {
                _StdOut.putText("Please supply an integer");
            }
        };
        //Let's create a file
        Shell.prototype.shellCreateFile = function (args) {
            if (args.length == 1) {
                if (args[0].length > FILE_NAME_LENGTH) {
                    _StdOut.putText("File name length too long! Must be " + FILE_NAME_LENGTH + " characters or less.");
                    return;
                }
                if (!args[0].match(/^[a-z]+$/i)) {
                    _StdOut.putText("fileNames may only be valid characters.");
                    return;
                }
                var status_1 = _krnDiskDriveFile.krnDiskCreate(args[0]);
                if (status_1 == FILE_CREATED) {
                    _StdOut.putText("File: " + args[0] + " successfully created");
                }
                else if (status_1 == FILE_NAME_EXISTS) {
                    _StdOut.putText("File name already exists.");
                }
                else if (status_1 == DISK_FULL) {
                    _StdOut.putText("Not enough disk space to write! File: " + args[0] + " could not be created");
                }
            }
            else {
                _StdOut.putText("Please supply a valid filename");
            }
        };
        //Now put some text in the file of your choice
        Shell.prototype.shellWriteFile = function (args) {
            if (args.length >= 2) {
                if (args[0].includes("$")) {
                    _StdOut.putText("Error: " + args[0] + " is invalid. Only valid characters allowed");
                    return;
                }
                var string = "";
                for (var i = 1; i < args.length; i++) {
                    string += args[i] + " ";
                }
                if (string.charAt(0) != "\"" || string.charAt(string.length - 2) != "\"") {
                    _StdOut.putText("Please supply a filename and text surrounded by quotes.");
                    return;
                }
                string = string.trim();
                if (!string.substring(1, string.length - 1).match(/^.[a-z ]*$/i)) {
                    _StdOut.putText("Files may only have valid characters and spaces written to them.");
                    return;
                }
                var status_2 = _krnDiskDriveFile.krnDiskWrite(args[0], string);
                if (status_2 == FILE_CREATED) {
                    _StdOut.putText("Your file: " + args[0] + " has been successfully written to.");
                }
                else if (status_2 == FILE_NAME_AVAILABLE) {
                    _StdOut.putText("The file: " + args[0] + " does not exist.");
                }
                else if (status_2 == DISK_FULL) {
                    _StdOut.putText("Not enough disk space to write! File: " + args[0] + " could not be written");
                }
            }
            else {
                _StdOut.putText("Please supply a filename and text surrounded by quotes.");
            }
        };
        //What's in the file?
        Shell.prototype.shellReadFile = function (args) {
            if (args.length == 1) {
                if (args[0].includes("$")) {
                    _StdOut.putText("Error: " + args[0] + " is invalid. Only valid characters allowed");
                    return;
                }
                var status_3 = _krnDiskDriveFile.krnDiskRead(args[0]);
                if (status_3 == FILE_NAME_AVAILABLE) {
                    _StdOut.putText("The file: " + args[0] + " does not exist.");
                }
                _StdOut.putText(status_3.fileData.join(""));
            }
            else {
                _StdOut.putText("Please supply a valid filename.");
            }
        };
        //Wow...After all of that you want to delete your hardwork...
        Shell.prototype.shellDeleteFile = function (args) {
            if (args.length == 1) {
                if (args[0].includes("$")) {
                    _StdOut.putText("Error: " + args[0] + " is invalid");
                    return;
                }
                var status_4 = _krnDiskDriveFile.krnDiskDelete(args[0]);
                if (status_4 == FILE_CREATED) {
                    _StdOut.putText("You have succesffuly deleted file: " + args[0]);
                }
                else if (status_4 == FILE_NAME_AVAILABLE) {
                    _StdOut.putText("This file does not exist");
                }
            }
            else {
                _StdOut.putText("Please supply a valid filename.");
            }
        };
        // Recver the deleted files (you fool)
        Shell.prototype.shellCheckDisk = function () {
            _krnDiskDriveFile.krnChkDsk();
            _StdOut.putText("Deleted files have been recovered");
        };
        //Format the disk or else...
        Shell.prototype.shellFormat = function (args) {
            //Qucik format
            if (args.length == 1) {
                if (args[0] == "-quick") {
                    if (_krnDiskDriveFile.krnFormat(QUICK_FORMAT)) {
                        _StdOut.putText("Success!");
                    }
                    else {
                        _StdOut.putText("Can't format the disk right now. :(");
                    }
                }
                //Full format
                else if (args[0] == "-full") {
                    if (_krnDiskDriveFile.krnFormat(FULL_FORMAT)) {
                        _StdOut.putText("Success!");
                    }
                    else {
                        _StdOut.putText("Can't format the disk right now. :(");
                    }
                }
                else {
                    _StdOut.putText("Please use [-quick] or [-full] to format the disk");
                }
            }
            else {
                if (_krnDiskDriveFile.krnFormat(FULL_FORMAT)) {
                    _StdOut.putText("Success");
                }
                else {
                    _StdOut.putText("Can't format the disk right now. :(");
                }
            }
        };
        // List the files on disk
        Shell.prototype.shellList = function (args) {
            var fileNames = _krnDiskDriveFile.krnLs();
            if (fileNames.length != 0) {
                _StdOut.putText("Files in the filesystem:");
                _StdOut.advanceLine();
                if (args.length == 1 && args[0] == "-l") {
                    for (var _i = 0, fileNames_1 = fileNames; _i < fileNames_1.length; _i++) {
                        var f = fileNames_1[_i];
                        if (f['name'].includes("swapID")) {
                            continue;
                        }
                        _StdOut.putText("File Name: " + f['name'] + " - Created: " + f['month'] + "/" + f['day'] + "/" + f['year'] + ". Size: " + f['size']);
                        _StdOut.advanceLine();
                    }
                }
                else {
                    for (var _a = 0, fileNames_2 = fileNames; _a < fileNames_2.length; _a++) {
                        var f = fileNames_2[_a];
                        if (f['name'].includes("swapID")) {
                            continue;
                        }
                        if (f['name'].charAt(0) != ".") {
                            _StdOut.putText(f['name']);
                            _StdOut.advanceLine();
                        }
                    }
                }
            }
            else {
                _StdOut.putText("There are currently no files. Please create some files");
            }
        };
        // Sets the scheduler algorithm
        Shell.prototype.shellSetSchedule = function (args) {
            if (args.length == 1) {
                if (_Scheduler.setAlgorithm(args[0])) {
                    _StdOut.putText("Scheduling algorithm has been set to: " + _Scheduler.algorithm);
                }
                else {
                    _StdOut.putText("Please set the schedule to RR, FCFS, or Priority");
                }
            }
            else {
                _StdOut.putText("Please set the schedule to RR, FCFS, or Priority");
            }
        };
        // Get the current scheduler algorithm
        Shell.prototype.shellGetSchedule = function () {
            _StdOut.putText("Scheduling algorithm is set to: " + _Scheduler.algorithm);
        };
        return Shell;
    }());
    TSOS.Shell = Shell;
})(TSOS || (TSOS = {}));
