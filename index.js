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

     try {
          const [amazonResponse, flipkartResponse] = await Promise.all([
               fetch(`https://www.amazon.in/s?k=${keyword}`),
               fetch(`https://www.flipkart.com/search?q=${keyword}`)
          ]);

          const amazonContent = new JSDOM(await amazonResponse.text());
          const flipkartContent = new JSDOM(await flipkartResponse.text());

          const amazonItems = Array.from(amazonContent.window.document.body.querySelectorAll('[data-component-type="s-search-result"]')).slice(0, 20);
          const flipkartItems = Array.from(flipkartContent.window.document.body.querySelectorAll('._4ddWXP')).slice(0, 20);

          const data = amazonItems.map(item => {
               const title = item.querySelector('h2').textContent;
               const link = "https://amazon.in" + item.querySelector('a').href;
               const priceEle = item.querySelector('.a-price-whole');
               const price = priceEle ? priceEle.textContent : '-';
               const image = item.querySelector('img').src;
               const ratingEle = item.querySelector('span.a-icon-alt');
               const rating = ratingEle ? ratingEle.textContent : 'No rating';
               return { title, price, image, link, source: '/Amazon.png', rating };
          });

          flipkartItems.forEach(item => {
               const title = item.querySelector('.s1Q9rs').textContent;
               const ratingEle = item.querySelector('._3LWZlK');
               const rating = ratingEle ? ratingEle.textContent + " out of 5 stars" : 'No rating';
               const link = "https://flipkart.com" + item.querySelector('.s1Q9rs').href;
               const price = item.querySelector('._30jeq3').textContent;
               const image = item.querySelector('img').src;
               data.push({ title, price, image, link, source: '/flipkart.png', rating });
          });

          res.render('items.html', { data });
     } catch (error) {
          console.error('Error fetching data:', error);
          res.status(500).send('Internal Server Error');
     }
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
     console.log(`Server is running on port ${port}`);
});
