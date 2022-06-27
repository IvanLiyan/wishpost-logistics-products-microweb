<template>
  <v-row>
    <v-col :align="sec_name_align" :cols="secNameCols" :sm="secNameSm" class="pa-0">
      <label class="control-label">
        <span v-if="isMandatory" class="font-red">*</span>
        {{ sectionName }}
      </label>
    </v-col>
    <v-col v-bind:class="{ 'pt-0': zeroPadding, 'pb-0': zeroPadding }">
      <div @dragover="fileDragOver" @drop="fileDrop" @dragleave="fileDragLeave" @dragenter="fileDragEnter">
        <v-file-input
          ref="file-upload"
          :accept="accept"
          :placeholder="placeholder"
          persistent-placeholder
          :label="label"
          :multiple="multi"
          :outlined="outlined"
          :dense="dense"
          :hint="hint"
          persistent-hint
          :filled="drag_over"
          :rules="rules"
          :prepend-icon="prependIcon"
          :append-icon="appendIcon"
          :clearable="clearable"
          clear-icon="clear"
          :loading="loading"
          :disabled="loading || disabled"
          chips
          :hide-details="hide_details"
          :append-outer-icon="appendOuterIcon"
          @click:clear="clear"
        >
          <template v-slot:selection="{ index, text }">
            <v-chip color="primary" close close-icon="clear" @click:close="deleteOne(index)">
              {{ text }}
            </v-chip>
          </template>
        </v-file-input>
      </div>
      <div v-if="showTemplate">
        <br />
        <a :href="template">template downloads</a>
      </div>
    </v-col>
  </v-row>
</template>
<script>
// import '@css/global.css';
// import { i18n } from '@vuei18n/i18n';
import s3 from '../utils/s3';
export default {
  name: 'uploadFileView',
  props: {
    disabled: {
      type: Boolean,
      default: false,
    },
    zeroPadding: {
      type: Boolean,
      default: false,
    },
    clearable: {
      type: Boolean,
      default: true,
    },
    hint: {
      type: String,
      default: '',
    },
    sec_name_align: {
      type: String,
      default: 'left',
    },
    sec_name_cols: {
      type: String,
      default: '1',
    },
    sec_name_sm: {
      type: String,
      default: 'auto',
    },
    sectionName: {
      type: String,
      default: '',
    },
    isMandatory: {
      type: Boolean,
      default: false,
    },
    host: {
      type: String,
      default: '',
    },
    template: {
      type: String,
      default: '',
    },
    showTemplate: {
      type: Boolean,
      default: false,
    },
    multi: {
      type: Boolean,
      default: false,
    },
    outlined: {
      type: Boolean,
      default: false,
    },
    dense: {
      type: Boolean,
      default: false,
    },
    accept: {
      type: String,
      default: '',
    },
    rules: {
      type: Array,
      default() {
        return [];
      },
    },
    hide_details: {
      type: Boolean,
      default: true,
    },
    label: {
      type: String,
      default: 'Select a File or Drag a File Here',
    },
    placeholder: {
      type: String,
      default: 'No file selected',
    },
    success: {
      type: Function,
      default: function () {},
    },
    failure: {
      type: Function,
      default: function (resp, xhr) {
        var message = 'Unknown error';
        if (xhr && 'response' in xhr) {
          message = xhr.response;
        } else if (resp && 'msg' in resp) {
          message = resp.msg;
        }
        this.noty({
          type: 'error',
          text: message,
        });
      },
    },
    maxFiles: Number,
    maxFileSize: {
      type: Number,
      default: 0,
    },
    appendOuterIcon: {
      type: String,
      default: '',
    },
    appendIcon: {
      type: String,
      default: 'attach_file',
    },
    prependIcon: {
      type: String,
      default: null,
    },
  },
  data: () => ({
    drag_over: false,
    files: [],
    loading: false,
    atomic_counter: 0,
  }),
  computed: {
    secNameCols: function () {
      if (this.sectionName == '') {
        return 'auto';
      } else {
        return this.sec_name_cols;
      }
    },
    secNameSm: function () {
      if (this.sectionName == '') {
        return 0;
      } else {
        return this.sec_name_sm;
      }
    },
  },
  watch: {
    atomic_counter(newVal) {
      if (newVal === 0) {
        this.loading = false;
      } else if (newVal > 0) {
        this.loading = true;
      }
    },
    files: {
      deep: true,
      handler: function () {
        var event = new Event('fake');
        this.$refs['file-upload'].onInput(event);
        /* eslint-disable */
        const converted_files = this.multi
          ? this['files'].map(file => {
              return {
                url: file.url,
                original_filename: file.original_filename,
                s3_filename: file.s3_filename,
              };
            })
          : this.files.length > 0
          ? {
              url: this.files[0].url,
              original_filename: this.files[0].original_filename,
              s3_filename: this.files[0].s3_filename,
            }
          : null;
        /* eslint-enable */
        this.$emit('input', converted_files);
      },
    },
  },
  mounted: function () {
    // eslint-disable-next-line
    this.$refs['file-upload'].onInput = _.bind(function (e) {
      if (e.target) {
        let files_local = [...(e.target.files || [])];
        if (!this.multi) {
          files_local = files_local.length > 0 ? [files_local[0]] : [];
        }
        if (files_local.length > 0) {
          this.atomic_counter = this.atomic_counter + files_local.length;
          for (let i = 0; i < files_local.length; i++) {
            const file = files_local[i];
            this.uploadFile(false, file.name, file);
          }
        }
      }
      this.$refs['file-upload'].internalValue = this.files;
      this.$refs['file-upload'].initialValue = this.$refs['file-upload'].internalValue;
    }, this);
  },
  methods: {
    deleteOne: function (index) {
      if (this.loading !== true) {
        this.files.splice(index, 1);
      }
    },
    clear: function () {
      if (this.loading !== true) {
        this.files = [];
      }
    },
    fileDragOver: function (ev) {
      ev.preventDefault();
      ev.stopPropagation();
    },
    fileDrop: function (ev) {
      ev.preventDefault();
      ev.stopPropagation();
      this['drag_over'] = false;
      if (this.loading !== true) {
        if (ev.dataTransfer) {
          if (ev.dataTransfer.files.length) {
            ev.preventDefault();
            ev.stopPropagation();
            // Manually trigger a fake event for rendering
            var event = new Event('fake');
            Object.defineProperty(event, 'target', { writable: false, value: { files: ev.dataTransfer.files } });
            this.$refs['file-upload'].onInput(event);
          }
        }
      }
    },
    fileDragLeave: function (ev) {
      ev.preventDefault();
      ev.stopPropagation();
      this['drag_over'] = false;
    },
    fileDragEnter: function (ev) {
      ev.preventDefault();
      ev.stopPropagation();
      this['drag_over'] = true;
    },
    uploadFile: function (drag, filename, overrideFile) {
      this.filesReady = false;
      // eslint-disable-next-line
      var success = _.bind(function (resp, xhr) {
        this.atomic_counter = this.atomic_counter - 1;
        var original_resp = resp;
        if (typeof resp === 'string') {
          // eslint-disable-next-line
          resp = $.parseJSON(resp);
        }
        if (resp.code != 0) {
          failure(resp, xhr);
          s3.logErrorsToServer(original_resp, '', '', 'uploadImage');
          return;
        }
        this.filesReady = true;
        overrideFile['url'] = resp.data.url;
        overrideFile['s3_filename'] = resp.data.filename;
        overrideFile['original_filename'] = filename;
        const f = {
          url: resp.data.url,
          s3_filename: resp.data.filename,
          original_filename: filename,
        };
        if (this.multi || this.files.length == 0) {
          this.files.push(overrideFile);
        } else {
          this.files = [overrideFile];
        }
        if (this.success) {
          this.success(f);
        }
      }, this);
      // eslint-disable-next-line
      var failure = _.bind(function (resp, xhr) {
        // do some heavy logging
        // get all input values
        this.atomic_counter = this.atomic_counter - 1;
        var log_data = {
          resp: resp,
          filename: filename,
          drag: drag,
          url: window.location.href,
          files: this.files,
        };
        if (xhr) {
          log_data.xhr = xhr.message;
        }
        this.api.logFileUploadError({ log_data: JSON.stringify(log_data) });
        this.filesReady = true;
        if (resp != undefined) {
          this.failure(resp, xhr);
        }
      }, this);
      if (!filename) {
        var resp = { msg: this.i18n('Please choose a file.') };
        failure(resp, undefined);
        return;
      }
      var ext = filename.split('.').pop();
      s3.uploadToS3(null, success, failure, ext, true, overrideFile, this.maxFileSize);
    },
  },
};
</script>
<style scoped>
.font-red {
  color: #ff0000;
}
</style>
