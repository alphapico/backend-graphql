module.exports = function processor({
  // The type should always be provided
  type,
  // If the thing is a field or the argument on a field, field will be present
  field,
  // If the thing is an argument on a field, argument will be present
  arg,
  // If the thing being processed is an inputField on an input type, inputField will be present
  inputField,
  // This will be an object containing (at least) the 'kind' and 'name' properties of the "underlying type"
  // of the thing being processed. "Underlying type" meaning whatever is at the bottom of any "LIST" and
  // "NON_NULL" nesting. If the thing being processed is actually a Type, this object will be the entire
  // Type.
  //
  // Eg: [String] => { kind: 'SCALAR', name: 'String' }
  underlyingType,
  // Is the thing required or not? Eg: String! or [String]! => true
  // eslint-disable-next-line no-unused-vars
  isRequired,
  // Is the thing an array/list? Eg: [String] => true
  isArray,
  // Are the items in the array/list required? Eg: [String!] => true
  // eslint-disable-next-line no-unused-vars
  itemsRequired,
}) {
  // if (arg) {
  //   if (typeof arg.example !== 'undefined') {
  //     return;
  //   }
  //   const argType = underlyingType;
  //   if (
  //     type.kind === 'OBJECT' &&
  //     type.name === 'Mutation' &&
  //     arg.name === 'token' &&
  //     argType.kind === 'SCALAR' &&
  //     argType.name === 'String'
  //   ) {
  //     const val = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpX...`;
  //     // Might need to be an array
  //     return isArray ? [val] : val;
  //   }
  // }
  // if (type) {
  //   if (typeof type.example !== 'undefined') {
  //     return;
  //   }
  //   if (type.kind === 'INPUT_OBJECT' && type.name === 'RegisterInput') {
  //     const val = {
  //       email: 'johndoe@gmail.com',
  //       name: 'John Doe',
  //       password: 'secured-password',
  //       referralCode: 'JKMUJZEU',
  //     };
  //     return isArray ? [val] : val;
  //   }
  //   if (type.kind === 'INPUT_OBJECT' && type.name === 'LoginInput') {
  //     const val = {
  //       email: 'john.doer@gmail.com',
  //       password: 'password12345',
  //     };
  //     return isArray ? [val] : val;
  //   }
  //   if (type.kind === 'INPUT_OBJECT' && type.name === 'EmailInput') {
  //     const val = {
  //       email: 'john.doer@gmail.com',
  //     };
  //     return isArray ? [val] : val;
  //   }
  //   if (type.kind === 'INPUT_OBJECT' && type.name === 'ResetPasswordInput') {
  //     const val = {
  //       token: 'some-long-token-string',
  //       newPassword: 'newpassword12345',
  //     };
  //     return isArray ? [val] : val;
  //   }
  //   if (type.kind === 'INPUT_OBJECT' && type.name === 'ChangePasswordInput') {
  //     const val = {
  //       oldPassword: 'initialPassword123',
  //       newPassword: 'newPassword456',
  //     };
  //     return isArray ? [val] : val;
  //   }
  //   if (type.kind === 'INPUT_OBJECT' && type.name === 'RegisterAdminInput') {
  //     const val = {
  //       token: 'some-admin-registration-token',
  //       newName: 'Admin Styx',
  //       newPassword: 'admin_password12345',
  //     };
  //     return isArray ? [val] : val;
  //   }
  // }
  // console.log({ underlyingType, typeFields: type.fields });
  // if (field) {
  //   if (typeof field.example !== 'undefined') {
  //     return;
  //   }
  //   console.log({
  //     fieldType: field.type,
  //     fieldArgs: field.args,
  //     underlyingType,
  //     type,
  //   });
  // }
  // if (type && type.fields) {
  //   // if (typeof type.example !== 'undefined') {
  //   //   return;
  //   // }
  //   console.log({
  //     typeKind: type.kind,
  //     typeName: type.name,
  //     typeFields: type.fields,
  //   });
  //   // switch (type.fields[0].name) {
  //   //   case 'email': {
  //   //     console.log({ typeFieldsName: type.fields[0].name });
  //   //     return 'john.doer@gmail.com';
  //   //   }
  //   // }
  //   return;
  // }
};
