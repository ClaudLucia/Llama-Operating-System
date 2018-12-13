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

        public krnFileActions(params: Array<String>) {
            var OP = params[0];
            
            if (OP == "format") {
                _Disk.init();
            }
            else {
                if (_Disk.formatted) {
                    switch (OP) {
                        case "create":
                            this.krnDiskCreate;
                            break;
                        case "write":
                            this.krnDiskWrite;
                            break;
                        case "delete":
                            this.krnDiskDelete;
                            break;
                        case "read":
                            this.krnDiskRead;
                            break;
                        case "ls":
                            this.krnLs();
                            break;
                    }
                }
                else {
                    _StdOut.putText("Please format the disk using the format command");
                    _StdOut.advanceLine();
                    _OsShell.putPrompt();
                }
            }
        }


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
                        // ignore first block in first sector, it is the MBR
                        continue;
                    }
                    var swapperID = "0" + ":" + sector + ":" + block;
                    let blockLoc = JSON.parse(sessionStorage.getItem(swapperID));
                    let matchingFileName = true;
                    // Don't look in blocks not in use
                    if (blockLoc.bit == "1") {
                        for (var k = 4, j = 0; j < hexArr.length; k++ , j++) {
                            if (hexArr[j] != blockLoc.data[k]) {
                                matchingFileName = false
                            }
                        }
                        // If reach end of hexArr but blockLoc data still more?
                        // if (blockLoc.data[hexArr.length + DATE_LENGTH] != "00") {
                        //    matchingFileName = false;
                        // }
                        // We found the filename
                        if (matchingFileName) {
                            // Convert the text to a hex array, trimming off quotes
                            let textHexArr = this.convertStringASCII(text.slice(1, -1));
                            // Allocates enough free space for the file
                            let enoughFreeSpace: boolean = this.allocateDiskSpace(textHexArr, blockLoc.pointer);
                            if (!enoughFreeSpace) {
                                return DISK_FULL;
                            }
                            // We have enough allocated space. Get the first datablock, keep writing until no more string.
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
            // Look for filename in directrory structure
            let hexArr = this.convertStringASCII(filename);
            // Firefox doesn't order session storage, so have to generate appropriate swapperID
            // Don't look in MBR
            // for(var i=1; i<_Disk.sectors*_Disk.blocks; i++){
            for (var sector = 0; sector < _Disk.sectors; sector++) {
                for (var block = 0; block < _Disk.blocks; block++) {
                    if (sector == 0 && block == 0) {
                        // ignore first block in first sector, it is the MBR
                        continue;
                    }
                    var swapperID = "0" + ":" + sector + ":" + block;
                    let blockLoc = JSON.parse(sessionStorage.getItem(swapperID));
                    let matchingFileName = true;
                    // Don't look in blocks not in use
                    if (blockLoc.bit == "1") {
                        for (var k = 4, j = 0; j < hexArr.length; k++ , j++) {
                            if (hexArr[j] != blockLoc.data[k]) {
                                matchingFileName = false
                            }
                        }
                        // If reach end of hexArr but blockLoc data still more?
                        // if (blockLoc.data[hexArr.length + DATE_LENGTH] != "00") {
                        //    matchingFileName = false;
                        // }
                        // We found the filename
                        if (matchingFileName) {
                            // Perform a recursive read
                            let tsb = blockLoc.pointer;
                            let data = this.krnDiskReadData(tsb);
                            let dataPtr = 0;
                            let fileData = []; // the data in the file
                            while (true) {
                                // Read until we reach 00-terminated string
                                if (data[dataPtr] != "00") {
                                    // Avoiding string concatenation to improve runtime
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
                        // ignore first block in first sector, it is the MBR
                        continue;
                    }
                    var swapperID = "0" + ":" + sector + ":" + block;
                    let blockLoc = JSON.parse(sessionStorage.getItem(swapperID));
                    let matchingFileName = true;
                    // Don't look in blocks not in use
                    if (blockLoc.bit == "1") {
                        for (var k = 4, j = 0; j < hexArr.length; k++ , j++) {
                            if (hexArr[j] != blockLoc.data[k]) {
                                matchingFileName = false
                            }
                        }
                        // If reach end of hexArr but blockLoc data still more?
                        // if (blockLoc.data[hexArr.length + DATE_LENGTH] != "00") {
                        //   matchingFileName = false;
                        // }
                        // We found the filename
                        if (matchingFileName) {
                            // Perform recursive delete given first TSB
                            this.krnDiskDeleteData(blockLoc.pointer);
                            // Update directory block
                            blockLoc.bit = "0"
                            // Keep the pointer for chkdsk
                            // blockLoc.pointer = "0:0:0"; 
                            // Set in storage
                            sessionStorage.setItem(swapperID, JSON.stringify(blockLoc));
                            // Update display
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
                    let matchingFileName = true;

                    if (blockLoc.bit == "1") {
                        for (var k = 4, j = 0; j < hexArr.length; k++ , j++) {
                            if (hexArr[j] != blockLoc.data[k]) {
                                matchingFileName = false
                            }
                        }

                        if (matchingFileName) {
                            return true;
                        }
                    }
                }
            }
            return false;
        }

        //Format the Disk Space
        public allocateDiskSpace(file: Array<String>, tsb: string): boolean {
            // Check size of text. If it is longer than 60, then we need to have enough datablocks
            let stringLength = file.length;
            let datBlockTSB = tsb; // pointer to current block we're looking at
            let datBlock = JSON.parse(sessionStorage.getItem(datBlockTSB));
            // What if data block writing to already pointing to stuff? Then we need to traverse it, making sure there is enough space to hold our new file.
            // Continuously allocate new blocks until we gucci
            while (stringLength > _Disk.data) {
                // If pointer 0:0:0, then we need to find free blocks
                // Else if it is already pointing to something, we're good already
                if (datBlock.pointer != "0:0:0" && datBlock.bit == "1") {
                    stringLength -= _Disk.data;
                    // datBlock.bit = "1";
                    // sessionStorage.setItem(datBlockTSB, JSON.stringify(datBlock));
                    // Update pointers
                    datBlockTSB = datBlock.pointer;
                    datBlock = JSON.parse(sessionStorage.getItem(datBlock.pointer));
                }
                else {
                    // We reached the end of the blocks that have already been allocated for this file. We need MOAR.
                    // Mark the starting block as in use
                    datBlock.bit = "1";
                    // Find enough free data blocks, if can't, return error
                    // First, find out how many more datablocks we need
                    let numBlocks = Math.ceil(stringLength / _Disk.data);
                    // Go find that number of free blocks
                    let freeBlocks = this.findFreeDataBlocks(numBlocks); // array of tsbs that are free
                    if (freeBlocks != null) {
                        // Once we get those n blocks, mark them as used, then set their pointers accordingly.
                        // Set the current block's pointer to the first block in the array, then recursively set pointers
                        for (var block of freeBlocks) {
                            datBlock.pointer = block;
                            datBlock.bit = "1";
                            // Set in session storage
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
                        return false; // we weren't able to find enough free blocks for this file
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
            // Just set pointers to 0 and available bit to 0
            if (formatType == QUICK_FORMAT) {
                for (var i = 0; i < _Disk.tracks * _Disk.sectors * _Disk.blocks; i++) {
                    // Get the JSON from the stored string
                    let block = JSON.parse(sessionStorage.getItem(sessionStorage.key(i)));
                    block.bit = "0";
                    block.pointer = "0:0:0";
                    sessionStorage.setItem(sessionStorage.key(i), JSON.stringify(block));
                }
            }
            // Default to full format
            else {
                // For all values in session storage, set available bit to 0, pointer to 0,0,0, and fill data with 00s
                let zeroes = new Array<String>();
                for (var l = 0; l < 60; l++) {
                    zeroes.push("00");
                }
                for (var i = 0; i < _Disk.tracks * _Disk.sectors * _Disk.blocks; i++) {
                    // Get the JSON from the stored string
                    let block = JSON.parse(sessionStorage.getItem(sessionStorage.key(i)));
                    block.bit = "0";
                    block.pointer = "0:0:0";
                    block.data = zeroes;
                    sessionStorage.setItem(sessionStorage.key(i), JSON.stringify(block));
                }
            }
            // Format should also remove any processes that are swapped from the resultident queue
            let size = _ProcessManager.resultidentQueue.getSz();
            for (var i = 0; i < size; i++) {
                var pcb = _ProcessManager.resultidentQueue.dequeue();
                if (pcb.Swapped) {
                    // Do nothing, goodbye PCB!
                }
                else {
                    _ProcessManager.resultidentQueue.enqueue(pcb); // put the process back into the resultident queue
                }
            }
            // Update disk display
            Control.hostDisk();
            return true;
        }

        //Write the file data
        public writeDiskData(tsb, textHexArr) {
            var dataPtr = 0;
            let currentTSB = tsb;
            console.log("Writing to TSB: " + currentTSB);
            let currentBlock = JSON.parse(sessionStorage.getItem(currentTSB));
            // First, clear out any data that was there previously
            currentBlock = this.clear(currentBlock);
            for (var k = 0; k < textHexArr.length; k++) {
                currentBlock.data[dataPtr] = textHexArr[k];
                dataPtr++;
                // Check to see if we've reached the limit of what data the block can hold. If so, go to the next block.
                if (dataPtr == 60) {
                    // Set the block in session storage first
                    sessionStorage.setItem(currentTSB, JSON.stringify(currentBlock));
                    currentTSB = currentBlock.pointer;
                    currentBlock = JSON.parse(sessionStorage.getItem(currentTSB));
                    currentBlock = this.clear(currentBlock);
                    dataPtr = 0;
                }
            }
            // If we're done writing, but the pointer in the current block is still pointing to something, it means the old file was longer
            // so delete it all.
            this.krnDiskDeleteData(currentBlock.pointer);
            currentBlock.pointer = "0:0:0";
            // Update session storage
            sessionStorage.setItem(currentTSB, JSON.stringify(currentBlock));
            // Update disk display
            Control.hostDisk();
        }


        //Read the file data
        public krnDiskReadData(tsb) {
            let dataBlock = JSON.parse(sessionStorage.getItem(tsb));
            let dataPtr = 0;
            let res = []; // hex array of data
            while (true) {
                // Read until we reach end of the data block
                res.push(dataBlock.data[dataPtr]);
                dataPtr++;
                if (dataPtr == _Disk.data) {
                    // Go to next TSB if there is a pointer to it.
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
            let ptrBlock = JSON.parse(sessionStorage.getItem(tsb)); // block that belongs to the TSB
            if (ptrBlock.pointer != "0:0:0") {
                // follow links
                this.krnDiskDeleteData(ptrBlock.pointer);
            }
            // ptrBlock.pointer = "0:0:0";
            // set as available
            ptrBlock.availableBit = "0";
            // update
            sessionStorage.setItem(tsb, JSON.stringify(ptrBlock));
            return;
        }
        
        public krnLs() {
            // Return the filenames of all directory blocks that are used
            let filenames = [];
            // Don't look in the MBR
            // Firefox doesn't order session storage, so have to generate appropriate swapperID
            for (var sector = 0; sector < _Disk.sectors; sector++) {
                for (var block = 0; block < _Disk.blocks; block++) {
                    if (sector == 0 && block == 0) {
                        // ignore first block in first sector, it is the MBR
                        continue;
                    }
                    var swapperID = "0" + ":" + sector + ":" + block;
                    let blockLoc = JSON.parse(sessionStorage.getItem(swapperID));
                    // Don't look in blocks not in use
                    if (blockLoc.bit == "1") {
                        let size = this.getSz(blockLoc.pointer);
                        let info = {
                            data: blockLoc.data,
                            size: size + "bytes"
                        }
                        filenames.push(info);
                    }
                }
            }
            // Convert all hex filenames to human-readable form
            for (var i = 0; i < filenames.length; i++) {
                let dataPtr = 4;
                let result = [];
                while (true) {
                    if (filenames[i]['data'][dataPtr] != "00") {
                        // Avoiding string concatenation to improve runtime
                        result.push(String.fromCharCode(parseInt(filenames[i]['data'][dataPtr], 16))); // push each char into array
                        dataPtr++;
                    }
                    else {
                        break;
                    }
                }
                filenames[i]['name'] = result.join("");
                // Parse out the date
                filenames[i]['month'] = parseInt(filenames[i]['data'][0], 16);
                filenames[i]['day'] = parseInt(filenames[i]['data'][1], 16);
                filenames[i]['year'] = parseInt(filenames[i]['data'][2] + filenames[i]['data'][3], 16);
            }
            // Return array of filenames
            return filenames;
        }

        /**
         * Performs a recovery of deleted files by just looking at all directory blocks to see
         * if there is a pointer still existing when the available bit is flipped off
         */
        public krnChkDsk() {
            for (var i = 0; i < _Disk.tracks * _Disk.sectors * _Disk.blocks; i++) {
                // Get the JSON from the stored string
                let block = JSON.parse(sessionStorage.getItem(sessionStorage.key(i)));
                if (block.bit = "0" && block.pointer != "0:0:0") {
                    block.bit = "1";
                    sessionStorage.setItem(sessionStorage.key(i), JSON.stringify(block));
                    // Update disk display
                    Control.hostDisk();
                }
            }
        }

        public findFreeDataBlock() {
            // firefox sucks and doesn't keep session storage in order
            // need to generate proper tsb id
            for (var trackNum = 1; trackNum < _Disk.tracks; trackNum++) {
                for (var sector = 0; sector < _Disk.sectors; sector++) {
                    for (var block = 0; block < _Disk.blocks; block++) {
                        var swapperID = trackNum + ":" + sector + ":" + block;
                        let datBlock = JSON.parse(sessionStorage.getItem(swapperID));
                        // If the block is available, mark it as unavailable, and set its tsb to the blockLoc pointer
                        if (datBlock.availableBit == "0") {
                            return swapperID;
                        }
                    }
                }
            }
            return null;
        }

        private findFreeDataBlocks(numBlocks: number) {
            let blocks = []; // storage for the free blocks
            for (var trackNum = 1; trackNum < _Disk.tracks; trackNum++) {
                for (var sector = 0; sector < _Disk.sectors; sector++) {
                    for (var block = 0; block < _Disk.blocks; block++) {
                        var swapperID = trackNum + ":" + sector + ":" + block;
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

        public krnDiskWriteSwap(filename: String, opcodes: Array<String>) {
            // Look for filename in directrory structure
            let hexArr = this.convertStringASCII(filename);
            // Firefox doesn't order session storage, so have to generate appropriate swapperID
            // Don't look in MBR
            // for(var i=1; i<_Disk.sectors*_Disk.blocks; i++){
            for (var sector = 0; sector < _Disk.sectors; sector++) {
                for (var block = 0; block < _Disk.blocks; block++) {
                    if (sector == 0 && block == 0) {
                        // ignore first block in first sector, it is the MBR
                        continue;
                    }
                    var swapperID = "0" + ":" + sector + ":" + block;
                    let blockLoc = JSON.parse(sessionStorage.getItem(swapperID));
                    let matchingFileName = true;
                    // Don't look in blocks not in use
                    if (blockLoc.availableBit == "1") {
                        for (var k = 4, j = 0; j < hexArr.length; k++ , j++) {
                            if (hexArr[j] != blockLoc.data[k]) {
                                matchingFileName = false
                            }
                        }
                        // We found the filename
                        if (matchingFileName) {
                            // Allocates enough free space for the file
                            // we make data block to hold opcodes as well.
                            let datBlock = JSON.parse(sessionStorage.getItem(blockLoc.pointer));
                            datBlock.availableBit = "0";
                            sessionStorage.setItem(blockLoc.pointer, JSON.stringify(datBlock));
                            let enoughFreeSpace: boolean = this.allocateDiskSpace(opcodes, blockLoc.pointer);
                            if (!enoughFreeSpace) {
                                return DISK_FULL;
                            }
                            // We have enough allocated space. Get the first datablock, keep writing until no more string.
                            this.writeDiskData(blockLoc.pointer, opcodes);
                            return FILE_CREATED;
                        }
                    }
                }
            }
            return FILE_NAME_AVAILABLE;
        }

        private getSz(swapper): number {
            return this.krnDiskReadData(swapper).length;
        }
    }
}
