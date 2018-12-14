///<reference path="../globals.ts" />
///<reference path="deviceDriver.ts" />
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
/* ----------------------------------
   DeviceDriverKeyboard.ts

   Requiresult deviceDriver.ts

   The Kernel Keyboard File System.
   ---------------------------------- */
var TSOS;
(function (TSOS) {
    // Extends DeviceDriver
    var DeviceDriverFS = /** @class */ (function (_super) {
        __extends(DeviceDriverFS, _super);
        function DeviceDriverFS() {
            // Override the base method pointers.
            var _this = 
            // The code below cannot run because "this" can only be
            // accessed after calling super.
            //super(this.krnKbdDriverEntry, this.krnKbdDispatchKeyPresults);
            _super.call(this) || this;
            _this.driverEntry = _this.krnFSDriverEntry;
            return _this;
            // this.isr = this.krnKbdDispatchKeyPresults;
        }
        DeviceDriverFS.prototype.krnFSDriverEntry = function () {
            // Initialization routine for this, the kernel-mode Keyboard Device Driver.
            this.status = "loaded";
            // More?
        };
        //public krnFileActions(params: Array<String>) {
        //    var OP = params[0];
        //    if (OP == "format") {
        //        _Disk.init();
        //    }
        //    else {
        //        if (_Disk.formatted) {
        //            switch (OP) {
        //                case "create":
        //                    this.krnDiskCreate;
        //                    break;
        //                case "write":
        //                    this.krnDiskWrite;
        //                    break;
        //                case "delete":
        //                    this.krnDiskDelete;
        //                    break;
        //                case "read":
        //                    this.krnDiskRead;
        //                    break;
        //                case "ls":
        //                    this.krnLs();
        //                    break;
        //            }
        //        }
        //        else {
        //            _StdOut.putText("Please format the disk using the format command");
        //            _StdOut.advanceLine();
        //            _OsShell.putPrompt();
        //        }
        //    }
        //}
        DeviceDriverFS.prototype.clear = function (block) {
            for (var i = 0; i < _Disk.data; i++) {
                block.data[i] = "00";
            }
            return block;
        };
        DeviceDriverFS.prototype.convertStringASCII = function (string) {
            var hexArr = [];
            for (var i = 0; i < string.length; i++) {
                var hexChar = string.charCodeAt(i).toString(16);
                hexArr.push(hexChar);
            }
            return hexArr;
        };
        // Creates a file
        DeviceDriverFS.prototype.krnDiskCreate = function (filename) {
            if (this.checkFileName(filename)) {
                return FILE_NAME_EXISTS;
            }
            for (var sector = 0; sector < _Disk.sectors; sector++) {
                for (var block = 0; block < _Disk.blocks; block++) {
                    if (sector == 0 && block == 0) {
                        continue;
                    }
                    var swapperID = "0" + ":" + sector + ":" + block;
                    var blockLoc = JSON.parse(sessionStorage.getItem(swapperID));
                    if (blockLoc.bit == "0") {
                        var datBlockTSB = this.findFreeDataBlock();
                        if (datBlockTSB != null) {
                            var datBlock = JSON.parse(sessionStorage.getItem(datBlockTSB));
                            blockLoc.bit = "1";
                            datBlock.bit = "1";
                            datBlock = this.clear(datBlock);
                            blockLoc.pointer = datBlockTSB;
                            var hexArr = this.convertStringASCII(filename);
                            blockLoc = this.clear(blockLoc);
                            var today = new Date();
                            var month = (today.getMonth() + 1).toString(16);
                            if (month.length == 1) {
                                month = "0" + month;
                            }
                            var day = (today.getDate()).toString(16);
                            if (day.length == 1) {
                                day = "0" + day;
                            }
                            var year = (today.getFullYear()).toString(16);
                            if (year.length == 3) {
                                year = "0" + year;
                            }
                            blockLoc.data[0] = month;
                            blockLoc.data[1] = day;
                            blockLoc.data[2] = year.substring(0, 2);
                            blockLoc.data[3] = year.substring(2);
                            for (var k = 4, j = 0; j < hexArr.length; k++, j++) {
                                blockLoc.data[k] = hexArr[j];
                            }
                            sessionStorage.setItem(swapperID, JSON.stringify(blockLoc));
                            sessionStorage.setItem(datBlockTSB, JSON.stringify(datBlock));
                            TSOS.Control.hostDisk();
                            return FILE_CREATED;
                        }
                        return DISK_FULL;
                    }
                }
            }
            return DISK_FULL;
        };
        //Write some stuff into the file
        DeviceDriverFS.prototype.krnDiskWrite = function (filename, text) {
            var hexArr = this.convertStringASCII(filename);
            for (var sector = 0; sector < _Disk.sectors; sector++) {
                for (var block = 0; block < _Disk.blocks; block++) {
                    if (sector == 0 && block == 0) {
                        continue;
                    }
                    var swapperID = "0" + ":" + sector + ":" + block;
                    var blockLoc = JSON.parse(sessionStorage.getItem(swapperID));
                    var matchName = true;
                    if (blockLoc.bit == "1") {
                        for (var k = 4, j = 0; j < hexArr.length; k++, j++) {
                            if (hexArr[j] != blockLoc.data[k]) {
                                matchName = false;
                            }
                        }
                        if (matchName) {
                            var textHexArr = this.convertStringASCII(text.slice(1, -1));
                            var enoughFreeSpace = this.allocateDiskSpace(textHexArr, blockLoc.pointer);
                            if (!enoughFreeSpace) {
                                return DISK_FULL;
                            }
                            this.writeDiskData(blockLoc.pointer, textHexArr);
                            return FILE_CREATED;
                        }
                    }
                }
            }
            return FILE_NAME_AVAILABLE;
        };
        //Read what you put in the file
        DeviceDriverFS.prototype.krnDiskRead = function (filename) {
            var hexArr = this.convertStringASCII(filename);
            for (var sector = 0; sector < _Disk.sectors; sector++) {
                for (var block = 0; block < _Disk.blocks; block++) {
                    if (sector == 0 && block == 0) {
                        continue;
                    }
                    var swapperID = "0" + ":" + sector + ":" + block;
                    var blockLoc = JSON.parse(sessionStorage.getItem(swapperID));
                    var matchName = true;
                    if (blockLoc.bit == "1") {
                        for (var k = 4, j = 0; j < hexArr.length; k++, j++) {
                            if (hexArr[j] != blockLoc.data[k]) {
                                matchName = false;
                            }
                        }
                        if (matchName) {
                            var tsb = blockLoc.pointer;
                            var data = this.krnDiskReadData(tsb);
                            var dataPtr = 0;
                            var fileData = [];
                            while (true) {
                                if (data[dataPtr] != "00") {
                                    fileData.push(String.fromCharCode(parseInt(data[dataPtr], 16))); // push each char into array
                                    dataPtr++;
                                }
                                else {
                                    break;
                                }
                            }
                            return { "data": data, "fileData": fileData };
                        }
                    }
                }
            }
            return FILE_NAME_AVAILABLE;
        };
        //Delete(!?) the file
        DeviceDriverFS.prototype.krnDiskDelete = function (filename) {
            var hexArr = this.convertStringASCII(filename);
            for (var sector = 0; sector < _Disk.sectors; sector++) {
                for (var block = 0; block < _Disk.blocks; block++) {
                    if (sector == 0 && block == 0) {
                        continue;
                    }
                    var swapperID = "0" + ":" + sector + ":" + block;
                    var blockLoc = JSON.parse(sessionStorage.getItem(swapperID));
                    var matchName = true;
                    if (blockLoc.bit == "1") {
                        for (var k = 4, j = 0; j < hexArr.length; k++, j++) {
                            if (hexArr[j] != blockLoc.data[k]) {
                                matchName = false;
                            }
                        }
                        if (matchName) {
                            this.krnDiskDeleteData(blockLoc.pointer);
                            blockLoc.bit = "0";
                            sessionStorage.setItem(swapperID, JSON.stringify(blockLoc));
                            TSOS.Control.hostDisk();
                            return FILE_CREATED;
                        }
                    }
                }
            }
            return FILE_NAME_AVAILABLE;
        };
        DeviceDriverFS.prototype.checkFileName = function (filename) {
            var hexArr = this.convertStringASCII(filename);
            for (var sector = 0; sector < _Disk.sectors; sector++) {
                for (var block = 0; block < _Disk.blocks; block++) {
                    if (sector == 0 && block == 0) {
                        continue;
                    }
                    var swapperID = "0" + ":" + sector + ":" + block;
                    var blockLoc = JSON.parse(sessionStorage.getItem(swapperID));
                    var matchName = true;
                    if (blockLoc.bit == "1") {
                        for (var k = 4, j = 0; j < hexArr.length; k++, j++) {
                            if (hexArr[j] != blockLoc.data[k]) {
                                matchName = false;
                            }
                        }
                        if (matchName) {
                            return true;
                        }
                    }
                }
            }
            return false;
        };
        //Format the Disk Space
        DeviceDriverFS.prototype.allocateDiskSpace = function (file, tsb) {
            var stringLength = file.length;
            var datBlockTSB = tsb;
            var datBlock = JSON.parse(sessionStorage.getItem(datBlockTSB));
            while (stringLength > _Disk.data) {
                if (datBlock.pointer != "0:0:0" && datBlock.bit == "1") {
                    stringLength -= _Disk.data;
                    datBlockTSB = datBlock.pointer;
                    datBlock = JSON.parse(sessionStorage.getItem(datBlock.pointer));
                }
                else {
                    datBlock.bit = "1";
                    var numBlocks = Math.ceil(stringLength / _Disk.data);
                    var freeBlocks = this.findFreeDataBlocks(numBlocks);
                    if (freeBlocks != null) {
                        for (var _i = 0, freeBlocks_1 = freeBlocks; _i < freeBlocks_1.length; _i++) {
                            var block = freeBlocks_1[_i];
                            datBlock.pointer = block;
                            datBlock.bit = "1";
                            sessionStorage.setItem(datBlockTSB, JSON.stringify(datBlock));
                            datBlockTSB = block;
                            datBlock = JSON.parse(sessionStorage.getItem(datBlockTSB));
                        }
                        datBlock.bit = "1";
                        sessionStorage.setItem(datBlockTSB, JSON.stringify(datBlock));
                        return true;
                    }
                    else {
                        datBlock.bit = "0";
                        return false;
                    }
                }
            }
            sessionStorage.setItem(datBlockTSB, JSON.stringify(datBlock));
            return true;
        };
        //Format the (actual) Disk
        DeviceDriverFS.prototype.krnFormat = function (formatType) {
            if (_CPU.eXecute) {
                return false;
            }
            if (formatType == QUICK_FORMAT) {
                for (var i = 0; i < _Disk.tracks * _Disk.sectors * _Disk.blocks; i++) {
                    var block = JSON.parse(sessionStorage.getItem(sessionStorage.key(i)));
                    block.bit = "0";
                    block.pointer = "0:0:0";
                    sessionStorage.setItem(sessionStorage.key(i), JSON.stringify(block));
                }
            }
            else {
                var zeroes = new Array();
                for (var l = 0; l < 60; l++) {
                    zeroes.push("00");
                }
                for (var i = 0; i < _Disk.tracks * _Disk.sectors * _Disk.blocks; i++) {
                    var block = JSON.parse(sessionStorage.getItem(sessionStorage.key(i)));
                    block.bit = "0";
                    block.pointer = "0:0:0";
                    block.data = zeroes;
                    sessionStorage.setItem(sessionStorage.key(i), JSON.stringify(block));
                }
            }
            var size = _ProcessManager.resultidentQueue.getSize();
            for (var i = 0; i < size; i++) {
                var pcb = _ProcessManager.resultidentQueue.dequeue();
                if (pcb.Swapped) {
                }
                else {
                    _ProcessManager.resultidentQueue.enqueue(pcb);
                }
            }
            TSOS.Control.hostDisk();
            return true;
        };
        DeviceDriverFS.prototype.writeDiskData = function (tsb, textHexArr) {
            var dataPtr = 0;
            var currentTSB = tsb;
            console.log("Writing to TSB: " + currentTSB);
            var currentBlock = JSON.parse(sessionStorage.getItem(currentTSB));
            currentBlock = this.clear(currentBlock);
            for (var k = 0; k < textHexArr.length; k++) {
                currentBlock.data[dataPtr] = textHexArr[k];
                dataPtr++;
                if (dataPtr == 60) {
                    sessionStorage.setItem(currentTSB, JSON.stringify(currentBlock));
                    currentTSB = currentBlock.pointer;
                    currentBlock = JSON.parse(sessionStorage.getItem(currentTSB));
                    currentBlock = this.clear(currentBlock);
                    dataPtr = 0;
                }
            }
            this.krnDiskDeleteData(currentBlock.pointer);
            currentBlock.pointer = "0:0:0";
            sessionStorage.setItem(currentTSB, JSON.stringify(currentBlock));
            TSOS.Control.hostDisk();
        };
        //Read the file data
        DeviceDriverFS.prototype.krnDiskReadData = function (tsb) {
            var dataBlock = JSON.parse(sessionStorage.getItem(tsb));
            var dataPtr = 0;
            var res = [];
            while (true) {
                res.push(dataBlock.data[dataPtr]);
                dataPtr++;
                if (dataPtr == _Disk.data) {
                    if (dataBlock.pointer != "0:0:0") {
                        dataBlock = JSON.parse(sessionStorage.getItem(dataBlock.pointer));
                        dataPtr = 0;
                    }
                    else {
                        return res;
                    }
                }
            }
        };
        //Delete the file data
        DeviceDriverFS.prototype.krnDiskDeleteData = function (tsb) {
            var ptrBlock = JSON.parse(sessionStorage.getItem(tsb));
            if (ptrBlock.pointer != "0:0:0") {
                this.krnDiskDeleteData(ptrBlock.pointer);
            }
            ptrBlock.availableBit = "0";
            sessionStorage.setItem(tsb, JSON.stringify(ptrBlock));
            return;
        };
        DeviceDriverFS.prototype.krnLs = function () {
            var filenames = [];
            for (var sector = 0; sector < _Disk.sectors; sector++) {
                for (var block = 0; block < _Disk.blocks; block++) {
                    if (sector == 0 && block == 0) {
                        continue;
                    }
                    var swapperID = "0" + ":" + sector + ":" + block;
                    var blockLoc = JSON.parse(sessionStorage.getItem(swapperID));
                    if (blockLoc.bit == "1") {
                        var size = this.getSize(blockLoc.pointer);
                        var info = {
                            data: blockLoc.data,
                            size: size + "bytes"
                        };
                        filenames.push(info);
                    }
                }
            }
            for (var i = 0; i < filenames.length; i++) {
                var dataPtr = 4;
                var result = [];
                while (true) {
                    if (filenames[i]['data'][dataPtr] != "00") {
                        result.push(String.fromCharCode(parseInt(filenames[i]['data'][dataPtr], 16))); // push each char into array
                        dataPtr++;
                    }
                    else {
                        break;
                    }
                }
                filenames[i]['name'] = result.join("");
                filenames[i]['month'] = parseInt(filenames[i]['data'][0], 16);
                filenames[i]['day'] = parseInt(filenames[i]['data'][1], 16);
                filenames[i]['year'] = parseInt(filenames[i]['data'][2] + filenames[i]['data'][3], 16);
            }
            return filenames;
        };
        DeviceDriverFS.prototype.krnChkDsk = function () {
            for (var i = 0; i < _Disk.tracks * _Disk.sectors * _Disk.blocks; i++) {
                var block = JSON.parse(sessionStorage.getItem(sessionStorage.key(i)));
                if (block.bit = "0" && block.pointer != "0:0:0") {
                    block.bit = "1";
                    sessionStorage.setItem(sessionStorage.key(i), JSON.stringify(block));
                    TSOS.Control.hostDisk();
                }
            }
        };
        DeviceDriverFS.prototype.findFreeDataBlock = function () {
            for (var track = 1; track < _Disk.tracks; track++) {
                for (var sector = 0; sector < _Disk.sectors; sector++) {
                    for (var block = 0; block < _Disk.blocks; block++) {
                        var swapperID = track + ":" + sector + ":" + block;
                        var datBlock = JSON.parse(sessionStorage.getItem(swapperID));
                        if (datBlock.availableBit == "0") {
                            return swapperID;
                        }
                    }
                }
            }
            return null;
        };
        DeviceDriverFS.prototype.findFreeDataBlocks = function (numBlocks) {
            var blocks = [];
            for (var track = 1; track < _Disk.tracks; track++) {
                for (var sector = 0; sector < _Disk.sectors; sector++) {
                    for (var block = 0; block < _Disk.blocks; block++) {
                        var swapperID = track + ":" + sector + ":" + block;
                        var datBlock = JSON.parse(sessionStorage.getItem(swapperID));
                        if (datBlock.availableBit == "0") {
                            blocks.push(swapperID);
                            numBlocks--;
                        }
                        if (numBlocks == 0) {
                            return blocks;
                        }
                    }
                }
            }
            if (numBlocks != 0) {
                return null;
            }
        };
        DeviceDriverFS.prototype.krnDiskWriteSwap = function (filename, OP) {
            var hexArr = this.convertStringASCII(filename);
            for (var sector = 0; sector < _Disk.sectors; sector++) {
                for (var block = 0; block < _Disk.blocks; block++) {
                    if (sector == 0 && block == 0) {
                        continue;
                    }
                    var swapperID = "0" + ":" + sector + ":" + block;
                    var blockLoc = JSON.parse(sessionStorage.getItem(swapperID));
                    var matchName = true;
                    if (blockLoc.availableBit == "1") {
                        for (var k = 4, j = 0; j < hexArr.length; k++, j++) {
                            if (hexArr[j] != blockLoc.data[k]) {
                                matchName = false;
                            }
                        }
                        if (matchName) {
                            var datBlock = JSON.parse(sessionStorage.getItem(blockLoc.pointer));
                            datBlock.availableBit = "0";
                            sessionStorage.setItem(blockLoc.pointer, JSON.stringify(datBlock));
                            var enoughFreeSpace = this.allocateDiskSpace(OP, blockLoc.pointer);
                            if (!enoughFreeSpace) {
                                return DISK_FULL;
                            }
                            this.writeDiskData(blockLoc.pointer, OP);
                            return FILE_CREATED;
                        }
                    }
                }
            }
            return FILE_NAME_AVAILABLE;
        };
        DeviceDriverFS.prototype.getSize = function (swapper) {
            return this.krnDiskReadData(swapper).length;
        };
        return DeviceDriverFS;
    }(TSOS.DeviceDriver));
    TSOS.DeviceDriverFS = DeviceDriverFS;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=deviceDriverFS.js.map