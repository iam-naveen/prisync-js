import express from 'express';
import path from 'path';
import ejs from 'ejs';
import { JSDOM } from 'jsdom';
import {getAmazonData, getFlipkartData} from './utils/scrape.js';

// This is some biolerplate code to setup the express server
const __dirname = path.resolve();
const app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.engine('html', ejs.renderFile);
app.set('view engine', 'html');

// This handles the get request to the '/' route
app.get('/', async (_req, res) => {
  res.render('home.html');
});

// This handles the get request to the '/search' route
app.get('/search', async (req, res) => {

  // Get the keyword from the query parameter
  const keyword = req.query.k;
  if (!keyword) {
    return res.send('Please provide a search keyword');
  }

  // Fetch the data from the amazon and flipkart websites
  // with the keyword that is received from the query parameter
  const [amazonResponse, flipkartResponse] = await Promise.all([
    fetch(`https://www.amazon.in/s?k=${keyword}`),
    fetch(`https://www.flipkart.com/search?q=${keyword}`)
  ])
  .catch(error => {
    console.error('Error fetching data:', error);
  });

  console.log(`got the data for ${keyword}...`);

  // Parse the response and create a DOM object / HTML Page
  // from the response, this is done to find the elements 
  // easily using the normal DOM methods such as 'querySelector'
  const amazonPage = new JSDOM(await amazonResponse.text()).window.document;
  const flipkartPage = new JSDOM(await flipkartResponse.text()).window.document;

  console.log("parsing done...");

  // This object is used to keep track 
  // of the sources and whether the data is fetched or not
  const sources = { amazon: false, flipkart: false }

  // This array is used to store the data,
  // that we are going to extract from the DOM we just created
  const data = [];

  // Get the data from the amazon and add it to the data array
  getAmazonData(amazonPage, data, sources);

  // Get the data from the flipkart and add it to the data array
  getFlipkartData(flipkartPage, data, sources);

  console.log("sending results...\n\n");

  // Use the scraped data to render the items.html page
  // and send it as a response to the client
  res.render('items.html', { data, sources, keyword });
});

// This is the port where the server will run
const port = process.env.PORT || 3000;
// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
