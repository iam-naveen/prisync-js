// // It is a utility function to find the element 
// // by the selector given and return the property of the element
// // if it exists, else return '-'
function find(selector, context, property) {
  let ele = context.querySelector(selector);
  return ele ? ele[property] : '-';
}

// This function is used to get the data from the amazon
// and add it to the data array
// It also sets the sources.amazon to true if the data is fetched
export function getAmazonData(amazonPage, data, sources) {
  try {
    const amazonItems = Array.from(
      amazonPage.querySelectorAll('[data-component-type="s-search-result"]'),
      (item) => ({
        title: find('h2', item, 'textContent'),
        link: "https://amazon.in" + find('a', item, 'href'),
        price: "₹" + find('span.a-price-whole', item, 'textContent'),
        image: find('img', item, 'src'),
        rating: find('span.a-icon-alt', item, 'textContent').replace(' stars', '★'),
        source: '/Amazon.png',
      })
    )
    if (amazonItems.length !== 0) {
      data.push(...amazonItems)
    }
    console.log("amazon done...");
    sources.amazon = true;
  } catch (error) {
    console.log("error in amazon:", error.message);
  }
}

// This function is used to get the data from the flipkart
// and add it to the data array
// It also sets the sources.flipkart to true if the data is fetched
//
//   Note: The flipkart website is a bit tricky to scrape,
//   due to changes in layout depending on the search keyword
//   So, we have to handle two different layouts, but the logic 
//   is same as the getAmazonData function, just for the flipkart website
export function getFlipkartData(flipkartPage, data, sources) {
  try {
    // This is the first layout that is checked for data
    // and it is added to the data array
    const flipkartItems = Array.from(
      flipkartPage.querySelectorAll('._4ddWXP'),
      (item) => ({
        title: find('.s1Q9rs', item, 'textContent'),
        link: "https://flipkart.com" + find('a', item, 'href'),
        price: find('._30jeq3', item, 'textContent'),
        image: find('img', item, 'src'),
        rating: find('._3LWZlK', item, 'textContent') + " out of 5★",
        source: '/flipkart.png',
      })
    )
    if (flipkartItems.length !== 0) {
      data.push(...flipkartItems)
    } else {
      // If the first result is empty, then this layout is used
      // to get the data and add it to the data array
      const flipkartItems = Array.from(
        flipkartPage.querySelectorAll('._1AtVbE'),
        (item) => ({
          title: find('._4rR01T', item, 'textContent'),
          link: "https://flipkart.com" + find('a', item, 'href'),
          price: find('._30jeq3', item, 'textContent'),
          image: find('img', item, 'src'),
          rating: find('._3LWZlK', item, 'textContent') + " out of 5★",
          source: '/flipkart.png',
        })
      )
      if (flipkartItems.length !== 0) data.push(...flipkartItems) 
    }
    console.log("flipkart done...");
    sources.flipkart = true;
  } catch (error) {
    console.log("error in flipkart:", error.message);
  }
}
