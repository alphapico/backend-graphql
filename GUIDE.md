# Guide

## 1. Setting up guide

- Download `Docker Desktop`. Check `docker compose` version by running the following command:
  ```bash
  docker compose version
  ```
  Make sure the version of `docker compose` is v2+
- Check node version. Make sure it's either v16+ or v18+
  ```bash
  node -v
  ```
- Install NestJS and NX globally
  ```bash
  npm i -g @nestjs/cli
  npm i -g nx
  ```
- Install dependencies. Go inside the `<root>` folder and run the command:
  ```bash
  npm install
  ```

### Setting up dev, unit test and e2e environments

1. Create an `.e2e.env` file with the following contents. Replace `<?>` with your own values. This is for the `end-to-end test` environment. Ensure all ports are unique.

   ```bash
   HOST=localhost
   PORT=<any port from 3000 and above, this is the API port>
   WS_PORT=<any port from 3000 and above, this is the WebSocket port, but we are not using it yet>

   POSTGRES_USER=<username>
   POSTGRES_PASSWORD=<password>
   POSTGRES_DB=charonium
   POSTGRES_PORT=<any port from 3000 and above>

   DATABASE_URL="postgresql://<POSTGRES_USER>:<POSTGRES_PASSWORD>@localhost:<POSTGRES_PORT>/charonium?schema=public"
   ```

2. Create a `.serve.env` file with the same contents as above. Just ensure the ports are different. This is for the `development` environment.
3. For the `unit test` environment, it will share the same settings as the `development` environment.

<br />

### Dev environment

1. To boot up `dev` database for the first time, run:
   ```bash
   npm run dev:db:build
   ```
   Press `Ctrl + C` to quit
2. To boot up `dev` database for subsequent times, run:
   ```bash
   npm run dev:db:up
   ```
3. To deploy migration file if any. Check inside folder `<root>/prisma/migrations` for migration files.
   ```bash
   npm run dev:db:deploy
   ```
4. Ensure the `dev` database is running by checking with the command:
   ```bash
   docker ps
   ```
5. Serve app API by running:
   ```bash
   nx serve customer-api
   ```
   The GraphQL schema will be generated at `<root>/charonium-schema.gql`. Press `Ctrl + C` to quit

<br />

### E2E environment

1. To boot up the `e2e` database for the first time, run:
   ```bash
   npm run e2e:db:build
   ```
   Press `Ctrl + C` to quit
2. To start, test, and stop the end-to-end test automatically, simply run the following command:
   ```bash
   nx e2e customer-api-e2e
   ```
   The test results will be displayed in the terminal, and the test report will be saved at `<root>/coverage/customer-api-e2e/e2e-report.html`

## 2. Development guide

The code is modular, testable and easily extendable. It's following concept like DDD, OOP, SOLID and Clean Code.

### Database migration

1. Create your schema at `<root>/prisma/schema.prisma`
2. After making changes, run command:
   ```bash
   npm run dev:db:migrate
   ```
   Give suitable name for migration file, e:g `add_table_customer`. The command will create migration file and deploy migration file to the database.
3. Peek at the database content with this command
   ```bash
   npm run dev:db:studio
   ```
4. For professional PostgreSQL client, install `PgAdmin`

### NestJS Module, Service and Resolver

To create GraphQL endpoint, you would need to create `module`, `service` and `resolver`

1. To create a new module, simply run this command:
   ```bash
   nx g @nrwl/nest:module --name=<module_name> --project=customer-api
   ```
   Give an appropriate name to `<module_name>`. Use only lowercase letters for the name. `NX` will transform the name to CamelCase accordingly. The command will inject module into the `App` module
2. To generate a new service:
   ```bash
   nx g @nrwl/nest:service --name=<module name> --project=customer-api
   ```
   The command will inject the service into the specified module name.
3. Currently there is no command from `NX` to create a resolver. You have to create the file manually. Simply refer to the `customer.resolver.ts` file for your reference
4. Create any relevance `DTO` or `input` files inside `<module_name>/dto` folder
5. The resulted files and folders may look like this

   ```bash
   charonium/
           └── customer-api/
               └── src/
                   └── <module_name>/
                       ├── <module_name>.module.ts
                       ├── <module_name>.service.spec.ts
                       └── <module_name>.service.ts
                       └── <module_name>.resolver.ts
                       └── dto/
                           └── <module_name>.dto.ts
                           └── ...
                   └── <other_module_name>/
                       └── ...

   ```

### Managing common library

All reusable code for modules is located inside the `<root>/libs/common/src/lib` folder. This library folder comprises `constants`, `decorators`, `enums`, `exceptions`, and `utils` folders. These are useful for both development and end-to-end testing. You can create any relevant files inside these folders accordingly. They will be reflected with the path `@charonium/common/...` if you want to import the code into the module.

#### Error message

Any relevant error messages can be placed inside the `<constants>/error-messages.constant.ts`.

```tsx
export const ERROR_MESSAGES = {
  INVALID_REFERRAL_CODE: 'Invalid referral code.',
  EMAIL_ALREADY_EXISTS: 'Email already exists.',
  VAL: {
    IS_STRING: '$property must be a string',
    IS_EMAIL: '$property must be an email',
    IS_NOT_EMPTY: '$property should not be empty',
    MIN_LENGTH:
      '$property must be longer than or equal to $constraint1 characters',
    MAX_LENGTH:
      '$property must be shorter than or equal to $constraint1 characters',
  },
};
```

`VAL` key and its properties are to be used with `class-validator` package, which is mostly found in files inside `DTO` folder. Any input `constraints` for `class-validator` are placed inside the `input.constant.ts` file. Most of of error messages can be used with NestJS built-in `BadRequestException`. For example:

```tsx
throw new BadRequestException(ERROR_MESSAGES.INVALID_REFERRAL_CODE());
```

For additional exception methods, check the `ERROR.md` file for more information.

### Writing end-to-end test code

When writing end-to-end tests, create one test suite per module. Each module should have one file containing all the GraphQL endpoint test cases `it(...)` within the test suite module `describe(...)`. You can refer to `customer.spec.ts` inside the `<root>/customer-api-e2e/src/customer-api` folder for an example.

To run end-to-end tests, execute the following command:

```bash
nx e2e customer-api-e2e
```

Make sure to cover edge cases in your test cases as well.
Please <span style="color:orange">document</span> the error messages and exceptions inside the <span style="color:orange">`ERROR.md`</span> file
