## frontend

This is a react app that serves as a web frontend for the plotter. This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

### Pre-requisites

- Install the latest stable release of [Node.js](https://nodejs.org/en/)

### Setting up the project

- `cd frontend`
- `npm install`
- `npm start`

> make sure that the `backend` is started & running, before starting the frontend app. Otherwise, you will not be able to see any data on the frontend.

### Configuration

All the configurations are available in `Config.js` file. The configuration file lists the api endpoints that are provided by `backend`. Below are the default configuration settings for local development.

```
const settings = {
  categories: "http://localhost:8081/datasets",
  refs: "http://localhost:8081/datasets/refs",
  datasets: "http://localhost:8081/datasets/data",
  fasta: "http://localhost:8081/datasets/fasta"
};
```

### Deploying the Website

- [Create React App](https://facebook.github.io/create-react-app/) comes with [webpack](https://webpack.js.org/), a package bundler, pre-configured to generate the necessary files for deployment. Below instructions are adapted from official deployment [docs](https://facebook.github.io/create-react-app/docs/deployment) and assumes you already have `Apache` web server set up & configured.

#### Generating a build to deploy the website on MARS with API on Pluto

- React app configuration: `Config.js`

```
const settings = {
  categories: "http://pluto.vmhost.psu.edu:8080/datasets",
  refs: "http://pluto.vmhost.psu.edu:8080/datasets/refs",
  datasets: "http://pluto.vmhost.psu.edu:8080/datasets/data",
  fasta: "http://pluto.vmhost.psu.edu:8080/datasets/fasta"
};
```

- React `package.json` addition

```
"homepage": "https://mars.vmhost.psu.edu/plot",
```

- Inside `app.js`, edit the router configuration.

```
 <BrowserRouter basename="/plot">
```

- Compile and create the `build/`

  - `npm run build`

- rename the directory `build/` to `plot/`

- `ssh` into `mars.vmhost.psu.edu -p 1855`

- stop `apache`

  - `sudo systemctl httpd stop`

- move the previous build to archive, if it exists

  - `mv plot/ WEBSITE_ARCHIVE/plot_<YY_MM_DD>`

- Copy the `plot` directory to MARS at `/var/www/html` (suggestion: use FileZilla)

- Start `apache`

  - `sudo systemctl httpd start`

- Website is live at `https://mars.vmhost.psu.edu/plot/`
