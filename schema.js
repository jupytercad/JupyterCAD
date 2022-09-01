const path = require('path');
const fs = require('fs');

const schemaPath = path.join(__dirname, 'src/schema');
const allSchema = {};
const files = fs.readdirSync(schemaPath);

files.forEach(file => {
  const rawData = fs.readFileSync(path.join(schemaPath, file));
  const data = JSON.parse(rawData);
  if (data['description']) {
    const { description, title, ...props } = data;
    allSchema[description] = props;
  }
});

fs.writeFileSync(
  'src/_interface/forms.json',
  JSON.stringify(allSchema, null, 2)
);
