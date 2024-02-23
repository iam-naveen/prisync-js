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
     res.setHeader('Content-Type', 'text/html');
     res.setHeader('Cache-Control', 's-max-age=1, stale-while-revalidate');
     res.render('home.html');
});

app.get('/search', async (req, res) => {
     const keyword = req.query.k;
     if (!keyword)
          return res.send('Please provide a search keyword');
     const amazonresponse = await fetch(`https://www.amazon.in/s?k=${keyword}`);
     const flipkartresponse = await fetch(`https://www.flipkart.com/search?q=${keyword}`);
     const aContent = new JSDOM(await amazonresponse.text());
     const fContent = new JSDOM(await flipkartresponse.text());
     const aItems = Array.from(aContent.window.document.body.querySelectorAll('[data-component-type="s-search-result"]')).slice(0, 20)
     const data = aItems.map(item => {
          const title = item.querySelector('h2').textContent;
          const link = "https://amazon.in"+item.querySelector('a').href;
          const priceEle = item.querySelector('.a-price-whole')
          const price = priceEle ? priceEle.textContent : '-';
          const image = item.querySelector('img').src;
          const ratingEle = item.querySelector('span.a-icon-alt')
          const rating = ratingEle ? ratingEle.textContent : 'No rating';
          return { title, price, image, link, source: '/Amazon.png', rating };
     });
     const fItems = fContent.window.document.body.querySelectorAll('._4ddWXP');
     Array.from(fItems).slice(0, 20).forEach((item) => {
          const title = item.querySelector('.s1Q9rs').textContent;
          const ratingEle = item.querySelector('._3LWZlK')
          const rating = ratingEle ? ratingEle.textContent+" out of 5 stars" : 'No rating';
          const link = "https://flipkart.com"+item.querySelector('.s1Q9rs').href;
          const price = item.querySelector('._30jeq3').textContent;
          const image = item.querySelector('img').src;
          data.push({ title, price, image, link, source: '/flipkart.png', rating });
     });

     res.render('items.html', { data });
});

app.listen(3000, () => {
     console.log('Server is running on port 3000');
});
