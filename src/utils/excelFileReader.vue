<template>
  <div>
    <v-row>
      <v-col cols="12">
        <v-file-input
          v-model="file"
          :label="label"
          prepend-icon="attach_file"
          :clearable="clearable"
          clear-icon="clear"
          :loading="loading"
          :disabled="loading"
          accept=".xls,.xlsx"
        ></v-file-input>
      </v-col>
      <v-col cols="12">
        <a v-if="template" :href="`${template}`">{{ i18n('下载模板') }}</a>
      </v-col>
    </v-row>
  </div>
</template>
<script>
export default {
  name: 'excelFileReader',
  props: {
    value: {
      type: Array,
      default: () => [],
    },
    template: {
      type: String,
      default: '',
    },
    clearable: {
      type: Boolean,
      default: true,
    },
    label: {
      type: String,
      default: function () {
        return this.$i18n('上传文件');
      },
    },
  },
  data() {
    return {
      file: null,
      loading: false,
    };
  },
  watch: {
    file: function (val) {
      if (val) {
        this.uploadFile(val);
      } else {
        this.$emit('input', null);
      }
    },
  },
  methods: {
    uploadFile: function (file) {
      this.convertExcelToMap(file).then(
        res => {
          this.$emit('input', res);
        },
        () => {},
      );
    },
    async convertExcelToMap(file) {
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
              let header = [];
              sheet.eachRow((row, rowIndex) => {
                if (rowIndex == 1) {
                  header = row.values;
                } else {
                  const rowData = {};
                  for (let i = 1; i < Math.min(header.length, row.values.length); i++) {
                    rowData[header[i]] = row.values[i];
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
    },
  },
};
</script>
