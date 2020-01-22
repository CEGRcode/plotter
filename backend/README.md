## backend

This is a node app that serves as a REST API backend to plotter. Built using `express.js` and `mongoDB`.

### Dependencies

- MongoDB >= 4.0.1
- nodejs >= 10 (or any latest release)

**MacOS installation instructions**

- _Setting up mongoDB using [homebrew](https://brew.sh/)_

  - Add mongoDB Homebrew Tap

  ```
  brew tap mongodb/brew
  ```

  - Install mongodb community server

  ```
  brew install mongodb-community@4.2
  ```

  - Before you start MongoDB for the first time, create the directory to which the mongod process will write data. I'm setting it in on my `~/Desktop` for simplicity.

  ```
  mkdir -p ~/Desktop/data/db
  ```

  - To start your mongodb server

  ```
  mongod --dbpath ~/Desktop/data/db
  ```

  > Alternate installation of mongoDB on MacOS using `.tgz` tarball is available [here](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-os-x-tarball/)

### Quickstart

```
# go into your backend folder
cd backend

# install dependencies
npm install

# create a `.env` file with appropriate configurations (see below for details)

# make sure your mongodb server is started before executing the below command
npm start

```

The `sampleData/` contains `example_datasets.json` which can used by `postData.py` script in the utils folder to make a `POST` request to populate the database. Likewise, you can use `example_fasta.json` and `postFasta.py` to populate the fasta data into the application using the `POST` request.

- Open up a browser and go to `http://localhost:8081/datasets` to see the API in action serving JSON data.

### Configuration

Requires a `.env` to handle app settings. Create the `.env` within the the root folder of this application.

| Settings    | Description                                                           |
| ----------- | --------------------------------------------------------------------- |
| `DB_URL`    | Use localhost to connect to a local installation of mongodb (default) |
| `DB_NAME`   | Name of the database to store app data.                               |
| `NODE_PORT` | Port Number for your server on which the api will be served.          |

> default `.env` with configurations for local development

```
DB_URL="localhost"
DB_NAME="plotterDB"
NODE_PORT=8081
```

### API Endpoints

| Endpoint                                              | Request Type | Description                                                                   |
| ----------------------------------------------------- | ------------ | ----------------------------------------------------------------------------- |
| `/`                                                   | `POST`       | Create a new dataset.                                                         |
| `/fasta`                                              | `POST`       | Create a new fasta sequence.                                                  |
| `/datasets`                                           | `GET`        | Retrieve all the unique gene categories                                       |
| `/datasets/refs?category=<category>`                  | `GET`        | Retrieve all the unique reference points for the given `<category>`           |
| `/datasets/fasta?category=<category>&ref=<reference>` | `GET`        | Retrieve the fasta sequence for the given `<category>` and `<reference>`      |
| `/datasets/data?category=<category>&ref=<reference>`  | `GET`        | Retrieve the datasets to overlay for the given `<category>` and `<reference>` |
