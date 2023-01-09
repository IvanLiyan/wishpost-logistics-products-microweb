export async function convertExcelToMap(file, ignore_hyperlink = true) {
  const promise = new Promise(resolve => {
    const Excel = require('exceljs');
    const wb = new Excel.Workbook();
    const reader = new FileReader();
    const data = [];
    reader.readAsArrayBuffer(file);
    reader.onload = () => {
      const buffer = reader.result;
      wb.xlsx.load(buffer).then(workbook => {
        workbook.eachSheet(sheet => {
          const sheetData = [];
          const header = [];
          sheet.eachRow((row, rowIndex) => {
            if (rowIndex == 1) {
              for (const val of row.values) {
                if (val !== undefined && val.richText) {
                  // only extract text for rich-text fields
                  let temp = '';
                  for (const rt of val.richText) {
                    temp += rt.text;
                  }
                  header.push(temp);
                } else {
                  header.push(val);
                }
              }
            } else {
              const rowData = {};
              for (let i = 1; i < Math.min(header.length, row.values.length); ++i) {
                let tmpRowData = row.values[i];
                if (tmpRowData != null && tmpRowData.richText != null) {
                  // join rich test
                  let content = '';
                  const richText = tmpRowData.richText;
                  for (let j = 0; j < richText.length; ++j) {
                    content += richText[j].text;
                  }
                  tmpRowData = content;
                } else if (tmpRowData != null && tmpRowData.hyperlink) {
                  if (ignore_hyperlink) {
                    tmpRowData = tmpRowData.text;
                  }
                }
                rowData[header[i]] = tmpRowData;
              }
              sheetData.push(rowData);
            }
          });
          data.push({
            name: sheet.name,
            header: header,
            data: sheetData,
          });
        });
        resolve(data);
      });
    };
  });
  return promise;
}
export function downloadFile(text, fileType, fileName) {
  var blob = new Blob([text], { type: fileType });
  var a = document.createElement('a');
  a.download = fileName;
  a.href = URL.createObjectURL(blob);
  a.dataset.downloadurl = [fileType, a.download, a.href].join(':');
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(function () {
    URL.revokeObjectURL(a.href);
  }, 1500);
}
export async function generateZipFile(filename, data) {
  // data: [{name,buff},{name,buff}]
  var JSZip = require('jszip');
  var zip = new JSZip();
  data.forEach(item => zip.file(item.name, item.buff));
  return zip.generateAsync({ type: 'blob' }).then(function (content) {
    downloadFile(content, 'application/zip', filename + '.zip');
  });
}
