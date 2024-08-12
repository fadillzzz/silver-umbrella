# Fetcher

## Build Docker Image

```
docker build -t fetcher .
```

## Run an Instance With Terminal

```
docker run --rm --name fetcher-test --cap-add=SYS_ADMIN -it fetcher /bin/bash
```

## Run Scripts From Inside Container

```
node ./fetch # Prints the help command
node ./fetch https://google.com # Saves a copy of the webpage
node ./fetch --metadata https://google.com # Prints metadata of the webpage
npm test # Runs all test cases
```
