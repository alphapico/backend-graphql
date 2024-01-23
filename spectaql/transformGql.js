const fs = require('fs');
const path = require('path');
const fields = require('./fields');

function addDirectives(schemaText, fieldDirectives) {
  const lines = schemaText.split('\n');
  const blockStack = [];
  let currentTypeName = '';
  let currentTypeCategory = ''; // either 'type' or 'input'

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check if this line starts the definition of one of the target types or inputs
    if (blockStack.length === 0) {
      for (const typeCategory of Object.keys(fieldDirectives)) {
        for (const typeName of Object.keys(fieldDirectives[typeCategory])) {
          const declaration = `${typeCategory} ${typeName}`;
          if (line.includes(declaration) && line.includes('{')) {
            blockStack.push(typeName);
            currentTypeName = typeName;
            currentTypeCategory = typeCategory;
            // console.log(
            //   `Entered ${currentTypeCategory} ${currentTypeName} at line ${i}`
            // );
            break;
          }
        }
        if (blockStack.length > 0) break; // exit early if a target type/input has been found
      }
    }

    // If inside a target type or input, check if this line defines one of the target fields
    if (blockStack.length > 0 && currentTypeName && currentTypeCategory) {
      if (
        fieldDirectives[currentTypeCategory] &&
        fieldDirectives[currentTypeCategory][currentTypeName]
      ) {
        for (const [fieldName, directive] of Object.entries(
          fieldDirectives[currentTypeCategory][currentTypeName]
        )) {
          if (line.trim().startsWith(fieldName)) {
            lines[i] = `${line} ${directive}`;
            // console.log(`Added directive to ${fieldName} at line ${i}`);
          }
        }
      }
    }

    // Update the block stack based on the current line
    if (line.includes('{')) {
      blockStack.push('{');
    }
    if (line.includes('}')) {
      blockStack.pop();
      if (blockStack.length === 1) {
        // Only the type/input name remains on the stack
        // console.log(
        //   `Exited ${currentTypeCategory} ${currentTypeName} at line ${i}`
        // );
        blockStack.pop(); // Pop the type/input name from the stack
        currentTypeName = '';
        currentTypeCategory = '';
      }
    }
  }

  // Handle argument directives
  if (fieldDirectives.args) {
    for (const [typeName, fields] of Object.entries(fieldDirectives.args)) {
      for (const [fieldName, args] of Object.entries(fields)) {
        for (const [argName, directive] of Object.entries(args)) {
          const regex = new RegExp(
            `(${fieldName}\\(${argName}: [^!]+!)(\\))`,
            'g'
          );
          const replacement = `$1 ${directive}$2`;
          for (let i = 0; i < lines.length; i++) {
            lines[i] = lines[i].replace(regex, replacement);
          }
        }
      }
    }
  }

  // Handle return type directives
  if (fieldDirectives.returns) {
    // console.log('Processing return directives'); // Debug log
    for (const [typeName, fields] of Object.entries(fieldDirectives.returns)) {
      for (const [fieldName, directive] of Object.entries(fields)) {
        const regex = new RegExp(
          `(${fieldName}\\([^\\)]+\\): (?:\\[[^\\]]+\\]|[^!]+)!)(\\s*)`,
          'g'
        ); // Updated regex to handle array return types
        const replacement = `$1 ${directive}$2`; // Replacement string with the directive
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].trim().startsWith(fieldName)) {
            // Ensure the line contains the field name
            // console.log('Matching line:', lines[i]); // Debug log
            lines[i] = lines[i].replace(regex, replacement); // Replace the matched string with the replacement string
            // console.log('Updated line:', lines[i]); // Debug log
          }
        }
      }
    }
  }

  //   // Handle return type directives
  //   if (fieldDirectives.returns) {
  //     for (const [typeName, fields] of Object.entries(fieldDirectives.returns)) {
  //       for (const [fieldName, directive] of Object.entries(fields)) {
  //         const regex = new RegExp(`(${fieldName}: [^\\n]+)`, 'g');
  //         const replacement = `$1 ${directive}`;
  //         for (let i = 0; i < lines.length; i++) {
  //           lines[i] = lines[i].replace(regex, replacement);
  //         }
  //       }
  //     }
  //   }

  return lines.join('\n');
}

function transformSchema(schemaPath, fieldDirectives) {
  const schemaText = fs.readFileSync(schemaPath, 'utf8');
  const updatedSchema = addDirectives(schemaText, fieldDirectives);

  // Determine the path for the new schema file
  const dirname = path.dirname(schemaPath);
  const basename = path.basename(schemaPath, '.gql');
  const newSchemaPath = path.join(dirname, `${basename}_transformed.gql`);

  fs.writeFileSync(newSchemaPath, updatedSchema, 'utf8');
}

const schemaPath = path.resolve(__dirname, '../styx-schema.gql');
transformSchema(schemaPath, fields);
