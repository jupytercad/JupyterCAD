const path = require('path');
const fs = require('fs');
const $RefParser = require('@apidevtools/json-schema-ref-parser');
const schemaPath = path.join(__dirname, 'src/schema');
const allSchema = {};
const files = fs.readdirSync(schemaPath);

// Create version.d.ts and version.js
const packageVersion = JSON.parse(fs.readFileSync(path.join(schemaPath, 'jcad.json'))).properties.schemaVersion.default;
fs.writeFileSync(path.join(__dirname, 'src/_interface/version.d.ts'), `export declare const SCHEMA_VERSION = '${packageVersion}';\n`, 'utf8');
fs.writeFileSync(path.join(__dirname, 'src/_interface/version.js'), `export const SCHEMA_VERSION = '${packageVersion}';\n`, 'utf8');

fs.cpSync(path.join(__dirname, 'src/_interface'),'../../lib/_interface', {recursive: true})

files.forEach(file => {
  const rawData = fs.readFileSync(path.join(schemaPath, file));
  const data = JSON.parse(rawData);

  $RefParser.dereference(data, (err, rschema) => {
    if (err) {
      console.error(err);
    } else {
      if (rschema['description']) {
        const { description, title, ...props } = rschema;
        allSchema[description] = props;
      }
      fs.writeFileSync(
        '../../lib/_interface/forms.json',
        JSON.stringify(allSchema, null, 2)
      );
    }
  });
});
