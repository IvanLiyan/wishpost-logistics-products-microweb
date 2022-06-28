import api from './api';
export default {
  createCORSRequest: function () {
    var xhr;
    if (typeof XMLHttpRequest != 'undefined') {
      xhr = new XMLHttpRequest();
    }
    return xhr;
  },
  logUploadErrorsToServer: function (response, status, state, description) {
    var log_data = {
      response: response !== null && typeof response === 'object' ? JSON.stringify(response) : response,
      status: status,
      state: state,
      description: description,
      url: window.location.href,
    };
    api.logFileUploadError('log-file-upload-error', { log_data: JSON.stringify(log_data) }, null);
  },
  checkFileType: function (file) {
    var allowedDocTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv',
      'application/csv',
      'text/comma-separated-values',
      'application/zip',
    ];
    if (file.type.indexOf('image/') == 0) {
      return 'image';
    } else if (allowedDocTypes.indexOf(file.type) > -1) {
      return 'doc';
    } else if (file.type == '') {
      return '';
    }
    return false;
  },
  getFileTypeFromName: function (filename) {
    var image_exts = ['jpeg', 'jpg', 'png', 'png'];
    var doc_exts = ['doc', 'docx', 'xls', 'xlsx', 'pdf', 'txt', 'csv'];
    var ext = filename.split('.').pop();
    if (image_exts.indexOf(ext) > -1) {
      return 'image';
    } else if (doc_exts.indexOf(ext) > -1) {
      return 'doc';
    }
    return false;
  },
  fallbackServerUpload: function (form, success, failure, type) {
    if (form == null) {
      failure({
        msg: this.i18n('Your browser does not support drag file uploading.' + 'Please upload using the button instead'),
      });
      return;
    }
    var url;
    if (type === 'image') {
      url = '/api/upload-tmp-image';
    } else {
      url = '/api/upload-tmp-file';
    }
    form.ajaxForm({
      url: url,
      type: 'post',
      dataType: 'text',
      success: success,
      error: function (resp) {
        this.logUploadErrorsToServer(resp, resp.status, 'error', 'fallbackServerUpload');
        failure();
      },
    });
    form.submit();
  },
  uploadToS3: function (form, success, failure, ext, allowDocs, overrideFile, maxFileSize) {
    if (typeof allowDocs == 'undefined') allowDocs = false;
    // if file api is unsupported, fall back to server upload (IE version <= 9)
    if (form != null && form.find('input.real-file-upload')[0].files === undefined) {
      var filename = form.find('input.real-file-upload')[0].value;
      var file_type = this.getFileTypeFromName(filename);
      // type check, size check will be done on server
      if (!file_type || (file_type === 'doc' && !allowDocs)) {
        failure({ msg: 'Invalid file type' }, null);
        return;
      }
      this.fallbackServerUpload(form, success, failure, file_type);
      return;
    }
    // Validate file
    var file;
    if (form == null) {
      file = overrideFile;
    } else {
      file = form.find('input.real-file-upload')[0].files[0];
    }
    var type = this.checkFileType(file);
    if (type === false || (type === 'doc' && !allowDocs)) {
      failure({ msg: 'Invalid file type' }, null);
      return;
    }
    if (maxFileSize && maxFileSize > 0 && file.size > maxFileSize * 1048576) {
      failure({ msg: 'File is too large. Please upload a file that is smaller than ' + maxFileSize + ' MB.' }, null);
      return;
    }
    var xhr = this.createCORSRequest();
    if (xhr == undefined) {
      // cors not supported, upload using the server
      this.fallbackServerUpload(form, success, failure, type);
    } else {
      var verifyURL;
      console.log(verifyURL);
      if (type === 'image') {
        verifyURL = 'url/image';
      } else {
        verifyURL = 'url/file';
      }
      api.generateSignedUploadURL({ type: file.type, ext: ext, name: file.name }).then(
        resp => {
          xhr.addEventListener(
            'load',
            function () {
              if (xhr.readyState != 4) {
                return;
              }
              var _ref = xhr.status;
              if (!(200 <= _ref && _ref < 300)) {
                this.fallbackServerUpload(form, success, failure, type);
                this.logUploadErrorsToServer(xhr.response, xhr.status, 'load', 'uploadToS3');
              } else {
                resp = { code: 0, data: { url: resp.data.fetch_url, filename: resp.data.filename } };
                success(resp);
              }
            },
            false,
          );
          xhr.addEventListener(
            'error',
            function () {
              this.fallbackServerUpload(form, success, failure, type);
              this.logUploadErrorsToServer(xhr.response, xhr.status, 'error', 'uploadToS3');
            },
            false,
          );
          xhr.addEventListener(
            'abort',
            function () {
              failure(resp, xhr);
              this.logUploadErrorsToServer(xhr.response, xhr.status, 'abort', 'uploadToS3');
            },
            false,
          );
          xhr.open('PUT', resp.data.url, true);
          xhr.setRequestHeader('Content-Type', file.type);
          xhr.setRequestHeader('x-amz-acl', 'public-read');
          xhr.timeout = 120000; // Set timeout to 120 seconds
          xhr.ontimeout = function () {
            this.fallbackServerUpload(form, success, failure, type);
            this.logUploadErrorsToServer(xhr.response, xhr.status, 'timeout', 'uploadToS3');
          };
          xhr.send(file);
        },
        err => {
          failure(err);
        },
      );
    }
  },
};
