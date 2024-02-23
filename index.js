import express from 'express';
import path from 'path';
import ejs from 'ejs';
import { JSDOM } from 'jsdom';

const __dirname = path.resolve();
const app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.engine('html', ejs.renderFile);
app.set('view engine', 'html');

app.get('/', async (_req, res) => {
     res.render('home.html');
});

app.get('/search', async (req, res) => {
     const keyword = req.query.k;
     if (!keyword) {
          return res.send('Please provide a search keyword');
     }

     const [amazonResponse, flipkartResponse] = await Promise.all([
          fetch(`https://www.amazon.in/s?k=${keyword}`),
          fetch(`https://www.flipkart.com/search?q=${keyword}`)
     ]).catch(error => {
          console.error('Error fetching data:', error);
     });

     console.log("got the data...");

     const amazonContent = new JSDOM(await amazonResponse.text());
     const flipkartContent = new JSDOM(await flipkartResponse.text());

     console.log("parsing done...");

     const data = [];
     try {
          const amazonItems = amazonContent.window.document.body.querySelectorAll('[data-component-type="s-search-result"]')
          for (let i = 0; i < 20; i++) {
               const title = amazonItems[i].querySelector('h2').textContent;
               const link = "https://amazon.in" + amazonItems[i].querySelector('a').href;
               const priceEle = amazonItems[i].querySelector('.a-price-whole');
               const price = priceEle ? priceEle.textContent : '-';
               const image = amazonItems[i].querySelector('img').src;
               const ratingEle = amazonItems[i].querySelector('span.a-icon-alt');
               const rating = ratingEle ? ratingEle.textContent : 'No rating';
               data.push({ title, price, image, link, source: '/Amazon.png', rating });
          }
          console.log("amazon done...");
     } catch (error) {
          console.log("error in amazon", error);
     }

     try {
          const flipkartItems = flipkartContent.window.document.body.querySelectorAll('._4ddWXP')
          for (let i = 0; i < 20; i++) {
               const title = flipkartItems[i].querySelector('.s1Q9rs').textContent;
               const ratingEle = flipkartItems[i].querySelector('._3LWZlK');
               const rating = ratingEle ? ratingEle.textContent + " out of 5 stars" : 'No rating';
               const link = "https://flipkart.com" + flipkartItems[i].querySelector('.s1Q9rs').href;
               const price = flipkartItems[i].querySelector('._30jeq3').textContent;
               const image = flipkartItems[i].querySelector('img').src;
               data.push({ title, price, image, link, source: '/flipkart.png', rating });
          }
          console.log("flipkart done...");
     } catch (error) {
          console.log("error in flipkart", error);
     }

     console.log("sending results...\n\n");
     res.render('items.html', { data });
});
const port = process.env.PORT || 3001;
app.listen(port, () => {
     console.log(`Server is running on port ${port}`);
});
