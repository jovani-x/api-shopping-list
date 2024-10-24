# REST API for [Shopping list](https://github.com/jovani-x/shopping-list-next)

It's a backend part of the Shopping list application, responsible for handling requests and returning data from db.

**It is under construction** (there are no some tests, sending of an email-invitation to friend and service 'forget password')

[API docs (Postman)](https://documenter.getpostman.com/view/35059519/2sAXjGbDuy)

## Features

- users:
  - authentication and authorization
  - registration
- cards:
  - create/get/update/delete/share/stop sharing
- friends:
  - get/invite/delete
  - get a friend-request with ability to approve or decline it
- sending fresh data (SSE)
- multiple languages (for now: en and pl)
- dockerizing of an app and db

## Getting Started

_[docker docs](https://docs.docker.com/get-started/)_

start:

```
docker compose up -d
```

stop:

```
docker compose down
```

## Manual setup (without Docker)

### Preparing MongoDB

[installation](https://www.mongodb.com/docs/manual/installation/)

[replication](https://www.mongodb.com/resources/products/capabilities/replication)

### Init dependencies

```
npm i
```

### Run the development server

```
npm run start
```

### Lint (eslint)

```
npm run lint
```

### Format (prettier)

```
npm run format
```

### Test and coverage

```
npm run test
```

```
npm run coverage
```

## Technologies

- nodejs (express)
- typescript
- mongoose (mongoDb)
- i18next
- vitest
- docker

## Roadmap

- add tests
- add sending of an email-invitation to friend
- implement service 'forget password'
