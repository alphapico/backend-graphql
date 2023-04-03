# Error Documentation

## HTTPException

| Exception                                                      | Code                       | Status Code | Message                    | Use When                                                                                                                                           |
| -------------------------------------------------------------- | -------------------------- | ----------- | -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| <span style="color:orange">BadRequestException </span>         | BAD_REQUEST                | 400         | Bad Request                | The request has bad syntax or is incomplete.                                                                                                       |
| <span style="color:orange">UnauthorizedException</span>        | UNAUTHORIZED               | 401         | Unauthorized               | Authentication is required and has failed or has not been provided.                                                                                |
| <span style="color:orange">NotFoundException</span>            | NOT_FOUND                  | 404         | Not Found                  | The requested resource could not be found.                                                                                                         |
| <span style="color:orange">ForbiddenException</span>           | FORBIDDEN                  | 403         | Forbidden                  | The client does not have permission to access the requested resource.                                                                              |
| NotAcceptableException                                         | NOT_ACCEPTABLE             | 406         | Not Acceptable             | The requested resource is only capable of generating content not acceptable by the client.                                                         |
| <span style="color:orange">RequestTimeoutException</span>      | REQUEST_TIMEOUT            | 408         | Request Timeout            | The server timed out waiting for the request.                                                                                                      |
| ConflictException                                              | CONFLICT                   | 409         | Conflict                   | The request could not be completed due to a conflict with the current state of the target resource.                                                |
| GoneException                                                  | GONE                       | 410         | Gone                       | The requested resource is no longer available and will not be available again.                                                                     |
| HttpVersionNotSupportedException                               | HTTP_VERSION_NOT_SUPPORTED | 505         | HTTP Version Not Supported | The server does not support the HTTP protocol version used in the request.                                                                         |
| PayloadTooLargeException                                       | PAYLOAD_TOO_LARGE          | 413         | Payload Too Large          | The request is larger than the server is willing or able to process.                                                                               |
| UnsupportedMediaTypeException                                  | UNSUPPORTED_MEDIA_TYPE     | 415         | Unsupported Media Type     | The request entity has a media type that the server or resource does not support.                                                                  |
| UnprocessableEntityException                                   | UNPROCESSABLE_ENTITY       | 422         | Unprocessable Entity       | The server understands the content type of the request entity, but the server is unable to process it.                                             |
| <span style="color:orange">InternalServerErrorException</span> | INTERNAL_SERVER_ERROR      | 500         | Internal Server Error      | A generic error message when an unexpected condition was encountered and no more specific message exists.                                          |
| <span style="color:orange">NotImplementedException</span>      | NOT_IMPLEMENTED            | 501         | Not Implemented            | The server lacks the ability to fulfill the request, usually due to an unimplemented feature or method.                                            |
| ImATeapotException                                             | I_AM_A_TEAPOT              | 418         | I'm a teapot               | As an April Fools' joke or as a light-hearted way to indicate a non-standard error condition. . It's not meant to be used in serious applications. |
| <span style="color:orange">MethodNotAllowedException</span>    | METHOD_NOT_ALLOWED         | 405         | Method Not Allowed         | The client sends an HTTP request with a method not supported for the requested resource.                                                           |
| BadGatewayException                                            | BAD_GATEWAY                | 502         | Bad Gateway                | The server is acting as a proxy or gateway and received an invalid response from the upstream server.                                              |
| <span style="color:orange">ServiceUnavailableException</span>  | SERVICE_UNAVAILABLE        | 503         | Service Unavailable        | The server is currently unable to handle the request due to temporary overload or maintenance.                                                     |
| GatewayTimeoutException                                        | GATEWAY_TIMEOUT            | 504         | Gateway Timeout            | The server is acting as a proxy or gateway and did not receive a timely response from the upstream server.                                         |
| PreconditionFailedException                                    | PRECONDITION_FAILED        | 412         | Precondition Failed        | One or more conditions specified in the request headers evaluate to false on the server                                                            |

<br />

## Customer Module

From GraphQL Output, notice that `message` key can has value `string`, `array` or totally not exist

```tsx
// Example 1
// it should not register a new customer with an invalid referral code
"extensions": {
      "code": "BAD_REQUEST",
      "originalError": {
        "statusCode": 400,
        "message": "Invalid referral code.",
        "error": "Bad Request"
      }
    }

// Example 2
// it should not register a new customer with an invalid email
"extensions": {
        "code": "BAD_REQUEST",
        "originalError": {
          "statusCode": 400,
          "message": [
            "email must be an email"
          ],
          "error": "Bad Request"
        }
      }

// Example 3
// it should not register a new customer with missing required fields
"extensions": {
              "code": "BAD_USER_INPUT"
            }
```

| Exception           | Code           | Status Code | Message                                                                                                                                                                                                                      | Use When          |
| ------------------- | -------------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| BadRequestException | BAD_REQUEST    | 400         | [ "name must be longer than or equal to 2 characters", "name must be shorter than or equal to 50 characters" "name should not be empty", "email must be an email", "password must be longer than or equal to 8 characters" ] | Mutation register |
|                     | BAD_USER_INPUT |             |                                                                                                                                                                                                                              | Mutation register |
| BadRequestException | BAD_REQUEST    | 400         | Invalid referral code.                                                                                                                                                                                                       | Mutation register |
| BadRequestException | BAD_REQUEST    |             | Email already exists.                                                                                                                                                                                                        | Mutation register |
