///<reference path="../globals.ts" />
///<reference path="deviceDriver.ts" />

/* ----------------------------------
   DeviceDriverKeyboard.ts

   Requiresult deviceDriver.ts

   The Kernel Keyboard File System.
   ---------------------------------- */

module TSOS {

    // Extends DeviceDriver
    export class DeviceDriverFS extends DeviceDriver {

        constructor() {
            // Override the base method pointers.

            // The code below cannot run because "this" can only be
            // accessed after calling super.
            //super(this.krnKbdDriverEntry, this.krnKbdDispatchKeyPresults);
            super();
            this.driverEntry = this.krnFSDriverEntry;
            // this.isr = this.krnKbdDispatchKeyPresults;
        }



        public krnFSDriverEntry() {
            // Initialization routine for this, the kernel-mode Keyboard Device Driver.
            this.status = "loaded";
            // More?
        }

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


        private clear(block) {
            for (var i = 0; i < _Disk.data; i++) {
                block.data[i] = "00";
            }
            return block;
        }

        private convertStringASCII(string: String) {
            let hexArr = [];
            for (var i = 0; i < string.length; i++) {
                let hexChar = string.charCodeAt(i).toString(16);
                hexArr.push(hexChar);
            }
            return hexArr;
        }

        // Creates a file
        public krnDiskCreate(filename: String) {
            if (this.checkFileName(filename)) {
                return FILE_NAME_EXISTS;
            }

            for (var sector = 0; sector < _Disk.sectors; sector++) {
                for (var block = 0; block < _Disk.blocks; block++) {
                    if (sector == 0 && block == 0) {
                        continue;
                    }
                    var swapperID = "0" + ":" + sector + ":" + block;
                    let blockLoc = JSON.parse(sessionStorage.getItem(swapperID));
                    if (blockLoc.bit == "0") {
                        let datBlockTSB = this.findFreeDataBlock();
                        if (datBlockTSB != null) {
                            let datBlock = JSON.parse(sessionStorage.getItem(datBlockTSB));
                            blockLoc.bit = "1";
                            datBlock.bit = "1";

                            datBlock = this.clear(datBlock);
                            blockLoc.pointer = datBlockTSB;

                            let hexArr = this.convertStringASCII(filename);

                            blockLoc = this.clear(blockLoc);

                            let today = new Date();
                            let month = (today.getMonth() + 1).toString(16);
                            if (month.length == 1) {
                                month = "0" + month;
                            }
                            let day = (today.getDate()).toString(16);
                            if (day.length == 1) {
                                day = "0" + day;
                            }
                            let year = (today.getFullYear()).toString(16);
                            if (year.length == 3) {
                                year = "0" + year;
                            }

                            blockLoc.data[0] = month;
                            blockLoc.data[1] = day;
                            blockLoc.data[2] = year.substring(0, 2);
                            blockLoc.data[3] = year.substring(2);

                            for (var k = 4, j = 0; j < hexArr.length; k++ , j++) {
                                blockLoc.data[k] = hexArr[j];
                            }
                            sessionStorage.setItem(swapperID, JSON.stringify(blockLoc));
                            sessionStorage.setItem(datBlockTSB, JSON.stringify(datBlock));

                            Control.hostDisk();
                            return FILE_CREATED;
                        }
                        return DISK_FULL;
                    }
                }
            }
            return DISK_FULL;
        }

        //Write some stuff into the file
        public krnDiskWrite(filename: String, text: String) {
            let hexArr = this.convertStringASCII(filename);
            for (var sector = 0; sector < _Disk.sectors; sector++) {
                for (var block = 0; block < _Disk.blocks; block++) {
                    if (sector == 0 && block == 0) {
                        continue;
                    }
                    var swapperID = "0" + ":" + sector + ":" + block;
                    let blockLoc = JSON.parse(sessionStorage.getItem(swapperID));
                    let matchName = true;
                    if (blockLoc.bit == "1") {
                        for (var k = 4, j = 0; j < hexArr.length; k++ , j++) {
                            if (hexArr[j] != blockLoc.data[k]) {
                                matchName = false
                            }
                        }
                        if (matchName) {
                            let textHexArr = this.convertStringASCII(text.slice(1, -1));
                            let enoughFreeSpace: boolean = this.allocateDiskSpace(textHexArr, blockLoc.pointer);
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
        }

        //Read what you put in the file
        public krnDiskRead(filename) {
            let hexArr = this.convertStringASCII(filename);
            for (var sector = 0; sector < _Disk.sectors; sector++) {
                for (var block = 0; block < _Disk.blocks; block++) {
                    if (sector == 0 && block == 0) {
                        continue;
                    }
                    var swapperID = "0" + ":" + sector + ":" + block;
                    let blockLoc = JSON.parse(sessionStorage.getItem(swapperID));
                    let matchName = true;
                    if (blockLoc.bit == "1") {
                        for (var k = 4, j = 0; j < hexArr.length; k++ , j++) {
                            if (hexArr[j] != blockLoc.data[k]) {
                                matchName = false
                            }
                        }
                        if (matchName) {
                            let tsb = blockLoc.pointer;
                            let data = this.krnDiskReadData(tsb);
                            let dataPtr = 0;
                            let fileData = [];
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
        }

        //Delete(!?) the file
        public krnDiskDelete(filename) {
           let hexArr = this.convertStringASCII(filename);
           for (var sector = 0; sector < _Disk.sectors; sector++) {
                for (var block = 0; block < _Disk.blocks; block++) {
                    if (sector == 0 && block == 0) {
                        continue;
                    }
                    var swapperID = "0" + ":" + sector + ":" + block;
                    let blockLoc = JSON.parse(sessionStorage.getItem(swapperID));
                    let matchName = true;
                    if (blockLoc.bit == "1") {
                        for (var k = 4, j = 0; j < hexArr.length; k++ , j++) {
                            if (hexArr[j] != blockLoc.data[k]) {
                                matchName = false
                            }
                        }
                        if (matchName) {
                            this.krnDiskDeleteData(blockLoc.pointer);
                            blockLoc.bit = "0"
                            sessionStorage.setItem(swapperID, JSON.stringify(blockLoc));
                            Control.hostDisk();
                            return FILE_CREATED;
                        }
                    }
                }
            }
            return FILE_NAME_AVAILABLE;
        }

        private checkFileName(filename: String): boolean {
            let hexArr = this.convertStringASCII(filename);
            for (var sector = 0; sector < _Disk.sectors; sector++) {
                for (var block = 0; block < _Disk.blocks; block++) {
                    if (sector == 0 && block == 0) {
                        continue;
                    }
                    var swapperID = "0" + ":" + sector + ":" + block;
                    let blockLoc = JSON.parse(sessionStorage.getItem(swapperID));
                    let matchName = true;

                    if (blockLoc.bit == "1") {
                        for (var k = 4, j = 0; j < hexArr.length; k++ , j++) {
                            if (hexArr[j] != blockLoc.data[k]) {
                                matchName = false
                            }
                        }
                        if (matchName) {
                            return true;
                        }
                    }
                }
            }
            return false;
        }

        //Format the Disk Space
        public allocateDiskSpace(file: Array<String>, tsb: string): boolean {
            let stringLength = file.length;
            let datBlockTSB = tsb; 
            let datBlock = JSON.parse(sessionStorage.getItem(datBlockTSB));
            while (stringLength > _Disk.data) {
                if (datBlock.pointer != "0:0:0" && datBlock.bit == "1") {
                    stringLength -= _Disk.data;
                    datBlockTSB = datBlock.pointer;
                    datBlock = JSON.parse(sessionStorage.getItem(datBlock.pointer));
                }
                else {
                    datBlock.bit = "1";
                    let numBlocks = Math.ceil(stringLength / _Disk.data);
                    let freeBlocks = this.findFreeDataBlocks(numBlocks); 
                    if (freeBlocks != null) {
                        for (var block of freeBlocks) {
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
        }

        //Format the (actual) Disk
        public krnFormat(formatType) {
            if (_CPU.eXecute) {
                return false;
            }
            if (formatType == QUICK_FORMAT) {
                for (var i = 0; i < _Disk.tracks * _Disk.sectors * _Disk.blocks; i++) {
                    let block = JSON.parse(sessionStorage.getItem(sessionStorage.key(i)));
                    block.bit = "0";
                    block.pointer = "0:0:0";
                    sessionStorage.setItem(sessionStorage.key(i), JSON.stringify(block));
                }
            }
            else {
                let zeroes = new Array<String>();
                for (var l = 0; l < 60; l++) {
                    zeroes.push("00");
                }
                for (var i = 0; i < _Disk.tracks * _Disk.sectors * _Disk.blocks; i++) {
                    let block = JSON.parse(sessionStorage.getItem(sessionStorage.key(i)));
                    block.bit = "0";
                    block.pointer = "0:0:0";
                    block.data = zeroes;
                    sessionStorage.setItem(sessionStorage.key(i), JSON.stringify(block));
                }
            }
            let size = _ProcessManager.resultidentQueue.getSize();
            for (var i = 0; i < size; i++) {
                var pcb = _ProcessManager.resultidentQueue.dequeue();
                if (pcb.Swapped) {
                }
                else {
                    _ProcessManager.resultidentQueue.enqueue(pcb); 
                }
            }
            Control.hostDisk();
            return true;
        }

        public writeDiskData(tsb, textHexArr) {
            var dataPtr = 0;
            let currentTSB = tsb;
            console.log("Writing to TSB: " + currentTSB);
            let currentBlock = JSON.parse(sessionStorage.getItem(currentTSB));
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
            Control.hostDisk();
        }


        //Read the file data
        public krnDiskReadData(tsb) {
            let dataBlock = JSON.parse(sessionStorage.getItem(tsb));
            let dataPtr = 0;
            let res = [];
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
        }

        //Delete the file data
        public krnDiskDeleteData(tsb) {
            let ptrBlock = JSON.parse(sessionStorage.getItem(tsb)); 
            if (ptrBlock.pointer != "0:0:0") {
                this.krnDiskDeleteData(ptrBlock.pointer);
            }
            ptrBlock.availableBit = "0";
            sessionStorage.setItem(tsb, JSON.stringify(ptrBlock));
            return;
        }
        
        public krnLs() {
            let filenames = [];
           for (var sector = 0; sector < _Disk.sectors; sector++) {
                for (var block = 0; block < _Disk.blocks; block++) {
                    if (sector == 0 && block == 0) {
                        continue;
                    }
                    var swapperID = "0" + ":" + sector + ":" + block;
                    let blockLoc = JSON.parse(sessionStorage.getItem(swapperID));
                    if (blockLoc.bit == "1") {
                        let size = this.getSize(blockLoc.pointer);
                        let info = {
                            data: blockLoc.data,
                            size: size + "bytes"
                        }
                        filenames.push(info);
                    }
                }
            }
            for (var i = 0; i < filenames.length; i++) {
                let dataPtr = 4;
                let result = [];
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
        }

        public krnChkDsk() {
            for (var i = 0; i < _Disk.tracks * _Disk.sectors * _Disk.blocks; i++) {
                let block = JSON.parse(sessionStorage.getItem(sessionStorage.key(i)));
                if (block.bit = "0" && block.pointer != "0:0:0") {
                    block.bit = "1";
                    sessionStorage.setItem(sessionStorage.key(i), JSON.stringify(block));
                    Control.hostDisk();
                }
            }
        }

        public findFreeDataBlock() {
             for (var track = 1; track < _Disk.tracks; track++) {
                for (var sector = 0; sector < _Disk.sectors; sector++) {
                    for (var block = 0; block < _Disk.blocks; block++) {
                        var swapperID = track + ":" + sector + ":" + block;
                        let datBlock = JSON.parse(sessionStorage.getItem(swapperID));
                        if (datBlock.availableBit == "0") {
                            return swapperID;
                        }
                    }
                }
            }
            return null;
        }

        private findFreeDataBlocks(numBlocks: number) {
            let blocks = [];
            for (var track = 1; track < _Disk.tracks; track++) {
                for (var sector = 0; sector < _Disk.sectors; sector++) {
                    for (var block = 0; block < _Disk.blocks; block++) {
                        var swapperID = track + ":" + sector + ":" + block;
                        let datBlock = JSON.parse(sessionStorage.getItem(swapperID));
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
        }

        public krnDiskWriteSwap(filename: String, OP: Array<String>) {
            let hexArr = this.convertStringASCII(filename);
            for (var sector = 0; sector < _Disk.sectors; sector++) {
                for (var block = 0; block < _Disk.blocks; block++) {
                    if (sector == 0 && block == 0) {
                        continue;
                    }
                    var swapperID = "0" + ":" + sector + ":" + block;
                    let blockLoc = JSON.parse(sessionStorage.getItem(swapperID));
                    let matchName = true;
                    if (blockLoc.availableBit == "1") {
                        for (var k = 4, j = 0; j < hexArr.length; k++ , j++) {
                            if (hexArr[j] != blockLoc.data[k]) {
                                matchName = false
                            }
                        }
                        if (matchName) {
                           let datBlock = JSON.parse(sessionStorage.getItem(blockLoc.pointer));
                            datBlock.availableBit = "0";
                            sessionStorage.setItem(blockLoc.pointer, JSON.stringify(datBlock));
                            let enoughFreeSpace: boolean = this.allocateDiskSpace(OP, blockLoc.pointer);
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
        }

        private getSize(swapper): number {
            return this.krnDiskReadData(swapper).length;
        }
    }
}
