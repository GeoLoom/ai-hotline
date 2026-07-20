import fs from 'node:fs';
export type SniffedFormat = 'ole-doc' | 'zip-docx' | 'mime-message' | 'raw-html' | 'unknown';


const OLE_SIGNATURE = Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]);
const ZIP_SIGNATURE = Buffer.from([0x50, 0x4b]);

export function sniffFormat(filePath: string): SniffedFormat {
  const fd = fs.openSync(filePath, 'r');
  const buffer = Buffer.alloc(512);
  const bytesRead = fs.readSync(fd, buffer, 0, 512, 0);
  fs.closeSync(fd);

  if (buffer.subarray(0, 8).equals(OLE_SIGNATURE)) return 'ole-doc';
  if (buffer.subarray(0, 2).equals(ZIP_SIGNATURE)) return 'zip-docx';

  const prefix = buffer.subarray(0, bytesRead).toString('latin1');
  if (/^Message-ID:/im.test(prefix) || /MIME-Version:\s*1\.0/i.test(prefix)) {    
    return 'mime-message';
  
  }
  if (/^\s*(<!doctype html|<html)/i.test(prefix)) {
    return 'raw-html';
  }

  return 'unknown';
}