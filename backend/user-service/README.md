# Simple guide about how to launch the user service

## Set up

As we are currently running our PostgreSQL database locally, you need to ensure you have installed PostgreSQL.
Create a database in your local device, named it `peerprep`. 

Create a .env file directly under `/user-service`. Create 2 env variables as shown below:
```
SERVICE_PORT=xxx (the port that we are going to use to run the user service)

DATABASE_URL="postgresql://postgres:<your_local_database_password>localhost:5432/peerprep?schema=public"
```

## Running the service

Once you have set up the `SERVICE_PORT`, you may start the dev server by running `npm run dev`.

All the API endpoints' route are available in `src/routes` directory, so for example, if you want to get a user data by the user id, you can call the `GET /<NODE_ENV>/user/users/:userId` endpoint, replace the `:userId` with the actual user id.

On your side, you can try calling the API by using either Postman/cURL request.

## Docs for user service API (unofficial)

### GET /<NODE_ENV>/user/users/:userId

This endpoint returns the user information with the specific user id `userId` from the database. If you don't know how to get the `userId`, please use the `getUserByEmail` endpoint.

**Request**:

```
GET http://localhost:5000/<NODE_ENV>/user/users/clmlp93wz00007kbwvws8oynd
```

**Response**:
```
Status: 200 OK

Response Body:
{
  "id": "clmlp93wz00007kbwvws8oynd",
  "name": "Your Name",
  "email": "youremail@domain.com",
  "role": "USER",
  "gender": "male",
  "image": "https://testimage.com/image.png",
  "bio": "Hello World!",
  "createdOn": "2023-09-16T07:21:02.483Z",
  "updatedOn": "2023-09-16T07:21:02.483Z"
}
```

**Possible Response Status Code**:
|Status Code|Explanation|
|---|---|
|200|Successful retrieving user data from the database|
|404|The given user id cannot be found|
|500|Server error, please see log message for details|

### GET /<NODE_ENV>/user/users/email

This endpoint returns the user information based on the user email provided in the query parameter. The `email` query parameter must exist.

**Request**:
```
GET http://localhost:5000/<NODE_ENV>/user/users/email?email=youremail@domain.com
```

**Response**:
```
Status: 200 OK

Response Body:
{
  "id": "clmlp93wz00007kbwvws8oynd",
  "name": "Your Name",
  "email": "youremail@domain.com",
  "role": "USER",
  "gender": "male",
  "image": "https://testimage.com/image.png",
  "bio": "Hello World!",
  "createdOn": "2023-09-16T07:21:02.483Z",
  "updatedOn": "2023-09-16T07:21:02.483Z"
}
```

**Possible Response Status Code**:
|Status Code|Explanation|
|---|---|
|200|Successful retrieving user data from the database|
|400|The given user email is invalid|
|404|The given user email cannot be found|
|500|Server error, please see log message for details|

### POST /<NODE_ENV>/user/users

This endpoint allows creating a new user given some necessary information like `name`, `email`, and `role` in the request body.

Request Body format:
```
{
    "name": string
    "email": string
    "role": enum ('admin' or 'user')
    "image": string
    "gender" enum ('male' or 'female')
    "bio": string
}
```

**Request**:
```
POST  http://localhost:5000/<NODE_ENV>/user/users

Request Body:

```

**Response**:
```
Status: 201 Created

Response Body:
{
  "message": "User created."
}
```

**Possible Response Status Code**:
|Status Code|Explanation|
|---|---|
|201|Successfully created a new user|
|400|The given request body is invalid, either because of syntax error, extra request properties, or value error|
|409|The input user email is already taken|
|500|Server error, please see log message for details|

### PUT /<NODE_ENV>/user/users/:userId

This endpoint updates the user information according to the request body provided.

**Request Body format**:
```
{
    "name": string
    "email": string
    "role": enum ('admin' or 'user')
    "image": string
    "gender" enum ('male' or 'female')
    "bio": string
}
```

**Request**:
```
PUT http://localhost:5000/<NODE_ENV>/user/users/clmlp93wz00007kbwvws8oynd

Request Body:
{
    "name": "Your Updated Name",
    "email": "yourupdatedemail@domain.com",
    "role": "admin",
    "image": "https://testimage.com/image.png",
    "gender": "male",
    "bio": "Hello World! I just updated my user profile."
}
```

**Response**:
```
Status: 204 No Content

No response body.
```

**Possible Response Status Code**:
|Status Code|Explanation|
|---|---|
|204|Successfully updated the user information|
|400|The given request body is invalid, either because of syntax error, extra request properties, or value error|
|404|The given user id cannot be found in the database|
|409|The user email is already taken|
|500|Server error, please see log message for details|

### DELETE /<NODE_ENV>/user/users/:userId

This endpoint deletes user record from the database, be cautious when you are using this endpoint.

**Request**:
```
DELETE http://localhost:5000/<NODE_ENV>/user/users/clmlp93wz00007kbwvws8oynd
```

**Response**:
```
Status: 204 No Content

No response body.
```

**Possible Response Status Code**:
|Status Code|Explanation|
|---|---|
|204|Successfully deleted the user record in the database|
|404|The given user id cannot be found in the database|
|500|Server error, please see log message for details|

## GET /<NODE_ENV>/user/users/:userId/preferences

This endpoints returns the languages, question difficulties, and the question topics preferences that are previously set by the user with `userId`.

**Request**:
```
GET http://localhost:5000/<NODE_ENV>/user/users/clmlp93wz00007kbwvws8oynd/preferences
```

**Response**:
```
Status: 200 OK

Response Body
{
  "userId": "clmlp93wz00007kbwvws8oynd",
  "languages": [
    "PYTHON",
    "C++",
    "JAVA"
  ],
  "difficulties": [
    "EASY"
  ],
  "topics": [
    "DYNAMIC PROGRAMMING"
  ]
}
```

**Possible Response Status Code**:
|Status Code|Explanation|
|---|---|
|204|Successfully retrieved the preferences data|
|404|The given user id does not exist, or the preferences are not set yet|
|500|Server error, please see log message for details|

## POST /<NODE_ENV>/user/users/:userId/preferences

This endpoint creates the preferences record in the database. This is required when the user does not have any preferences record in the database yet. For subsequent update of preferences, please use the `PUT /preferences` endpoint.

**Request Body Format**:
```
{
  "languages": Array<Language>,
  "difficulties": Array<Complexity>,
  "topics": Array<Topic>
}
```

**Request**:
```
PUT http://localhost:5000/<NODE_ENV>/user/users/clmlp93wz00007kbwvws8oynd/preferences

Request Body:
{
  "languages": ["Python", "C++"],
  "difficulties": ["Easy", "Medium"],
  "topics": ["Dynamic Programming", "Hash Table", "String", "Memoization", "Recursion"]
}
```

**Response**:
```
Status: 201 Created

Response Body
{
  message: "User preferences created"
}
```

**Possible Response Status Code**:
|Status Code|Explanation|
|---|---|
|201|Successfully created the preferences in the database|
|400|Invalid request body given|
|404|The given user id does not exist|
|409|The user preferences record is already there|
|500|Server error, please see log message for details|

## PUT /<NODE_ENV>/user/users/:userId/preferences

This endpoint updates the user preferences, provided that there already have a preferences record in the database.

**Request Body Format**:
```
{
  "languages": Array<Language> | undefined,
  "difficulties": Array<Complexity> | undefined,
  "topics": Array<Topic> | undefined
}
```
Take note that although each field can be omitted, at least one field need to be provided for a successful call.

**Request**:
```
PUT http://localhost:5000/<NODE_ENV>/user/users/clmlp93wz00007kbwvws8oynd/preferences

Request Body:
{
  "languages": ["Python", "C++", "Java"],
  "difficulties": ["hard"],
  "topics": ["Brain Teaser"]
}
```
**Response**:
```
Status: 204 No Content

No response body.
```

**Possible Response Status Code**:
|Status Code|Explanation|
|---|---|
|204|Successfully updated the user record in the database|
|404|The given user id does not exist, or there is no existing preferences with the user id.|
|500|Server error, please see log message for details|