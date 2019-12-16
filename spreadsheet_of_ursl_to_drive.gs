function main_function(next_thousand){
  
  // Find this information in the url of the spreasheet of links, based on https://developers.google.com/sheets/api/guides/concepts
  spreadsheet_id = ''
  // Where your files will go
  folder_id = ''
  
  download_urls_from_sheet(spreadsheet_id, folder_id, next_thousand);
  
  var currentTime = new Date();
  Logger.log(currentTime);
}

function download_urls_from_sheet(spreadhsheet_id, folder_id, next_thousand) {
  var doc = SpreadsheetApp.openById(spreadhsheet_id)
  
  var sheet = doc.getActiveSheet();
  var data = sheet.getDataRange().getValues();
  length = data.length;
  Logger.log('Length: '+ length);
  
  begin = 0;
  end = length;
  
  for (var i = begin; i <= end; i += 2) {
    Logger.log('URL: ' + data[i][0]);
    
    if (data[i][5] == ''){
      url = data[i][0]
      filename = getFilenameFromURL(url);
      uploadToDrive(url, folder_id, filename);
      Logger.log("BLANK");
      Logger.log(sheet.getRange(i+1,6).setValue(new Date()));
    }
    else{
      Logger.log(data[i][5]);
    } 
  }
}


// Following code taken from https://gist.github.com/denilsonsa/8134679 to take indidivudal url and upload pdf to Drive

// url_to_drive.gs
// Google Apps Script
// Allows uploading a URL directly to Google Drive.
//
// Live link:
// https://script.google.com/macros/s/AKfycbzvhbHS4hnWPVBDHjQzZHA0qWq0GR-6hY7TbYsNto6hZ0MeAFZt/exec
//
// Source-code:
// https://gist.github.com/denilsonsa/8134679
// https://script.google.com/d/1Ye-OEn1bDPcmeKSe4gb0YSK83RPMc4sZJt79SRt-GRY653gm2qVUptoE/edit
//
// Other solutions written by other people:
// https://ifttt.com/channels/google_drive/actions/78
// https://sites.google.com/site/fileurltodrive/

function getFilenameFromURL(url) {
  //                  (host-ish)/(path-ish/)(filename)
  var re = /^https?:\/\/([^\/]+)\/([^?]*\/)?([^\/?]+)/;
  var match = re.exec(url);
  if (match) {
    return unescape(match[3]);
  }
  return null;
}

function getFilenameFromContentDisposition(header) {
  // It does not support escaped double-quotes inside the filename.
  // It certainly does not conform to the specs.
  var re = /; *filename=("[^"]+"|[^ ;]+)/;
  var match = re.exec(header)
  if (match) {
    return match[1];
  }
  return null;
}

function uploadToDrive(url, folderid, filename) {
  var msg = '';
  var response;

  try {
    response = UrlFetchApp.fetch(url, {
      // muteHttpExceptions: true,
      // validateHttpsCertificates: false,
      followRedirects: true  // Default is true anyway.
    });
  } catch(e) {
    return e.toString();
  }

  if (response.getResponseCode() === 200) {
    if (!filename) {
      // TODO: try content-disposition.
      filename = getFilenameFromURL(url);
    }

    if (!filename) {
      msg += 'Aborting: Filename not detected. Please supply a filename.\n'
    } else {
      var folder = DriveApp.getRootFolder();
      if (folderid) {
        folder = DriveApp.getFolderById(folderid);
      }
      var blob = response.getBlob();
      var file = folder.createFile(blob);
      file.setName(filename);
      file.setDescription("Downloaded from " + url);

      var headers = response.getHeaders();
      var content_length = NaN;
      for (var key in headers) {
        if (key.toLowerCase() == 'Content-Length'.toLowerCase()) {
          content_length = parseInt(headers[key], 10);
          break;
        }
      }

      var blob_length = blob.getBytes().length;
      msg += 'Saved "' + filename + '" (' + blob_length + ' bytes)';
      if (!isNaN(content_length)) {
        if (blob_length < content_length) {
          msg += ' WARNING: truncated from ' + content_length + ' bytes.';
        } else if (blob_length > content_length) {
          msg += ' WARNING: size is greater than expected ' + content_length + ' bytes from Content-Length header.';
        }
      }
      msg += '\nto folder "' + folder.getName() + '".\n';
    }
  } else {
    msg += 'Response code: ' + response.getResponseCode() + '\n';
  }

  // Debug: printing response headers.
  // msg += JSON.stringify(response.getHeaders(), undefined, 2) + '\n';

  return msg;
}
