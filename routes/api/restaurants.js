const router = require("express").Router();
const resturantsController = require("../../controllers/resturantsController");
const request = require("request-promise-native");

// Matches with "/api/restaurants"
router.route("/").post((req, res) => {
  let zomatoBODY;
  let yelpBODY;
  let ready = false;
  // Current location is passed through the req
  if (req.body) {
    //Parsing coordinates
    let lat = parseFloat(req.body.lat);
    let lon = parseFloat(req.body.lon);

    //Using async-await and promises to handle multi-data fetching from remote servers
    async function getRemoteData() {
      // Construct API uris
      const zomatoURL = `https://developers.zomato.com/api/v2.1/geocode?lat=${lat}&lon=${lon}`;
      const yelpURL = ` https://api.yelp.com/v3/businesses/search?term=restaurants&latitude=${lat}&longitude=${lon}&open_now=true&radius=1000&sort_by=rating&limit=50`;

      //API call to Zomato
      let zomato = await request({
        headers: {
          // auth header
          "user-key": process.env.ZOMATO_API
        },
        uri: zomatoURL,
        json: true
      })
        .then(apiRes => {
          //Extracting relevant properties from the API response
          zomatoBODY = apiRes.nearby_restaurants.map(Obj => {
            return {
              name: Obj.restaurant.name,
              cuisines: Obj.restaurant.cuisines,
              address: Obj.restaurant.location.address,
              address_link: `https://maps.google.com/?q=${
                Obj.restaurant.location.address
              }`,
              price_range: renderDollarSigns(Obj.restaurant.price_range),
              rating: Obj.restaurant.user_rating.aggregate_rating,
              votes: Obj.restaurant.user_rating.votes,
              menu: Obj.restaurant.menu_url,
              image: Obj.restaurant.featured_image,
              phone: Obj.restaurant.phone_numbers
            };
          });
          return true;
        })
        .catch(err => console.log(err));

      //API call to Yelp
      let yelp = await request({
        headers: {
          // uth header
          Authorization: `Bearer ${process.env.YELP_API}`
        },
        uri: yelpURL,
        json: true
      })
        .then(yelpRes => {
          //Extracting relevant properties from the API response
          yelpBODY = yelpRes.businesses
            .filter(Obj => Obj.review_count >= 180)
            .map(Obj => {
              let thisCuisines = Obj.categories.map(Cat => {
                return Cat.title;
              });
              return {
                name: Obj.name,
                cuisines: thisCuisines.toString(),
                address: Obj.location.display_address[0],
                address_link: `https://maps.google.com/?q=${
                  Obj.location.display_address[0]
                }`,
                price_range: Obj.price,
                rating: Obj.rating,
                votes: Obj.review_count,
                link: Obj.url,
                image: Obj.image_url,
                phone: Obj.display_phone
              };
            });
          return true;
        })
        .catch(err => console.log(err));
      //After both requests are done
      if (zomato && yelp) {
        console.log("Both API calls successfuly resolved!");
        res.json([...zomatoBODY, ...yelpBODY]);
      } else {
        console.log("API ERROR!");
      }
    }
    // Promise to handle sending back the results AFTER the the data is ready
    // let sendResults = new Promise((resolve, reject) => {
    //   console.log("Promise running...");
    //   resolve(getRemoteData());
    // });
    // sendResults.then(() => {
    //   res.json([...zomatoBODY, ...yelpBODY]);
    // });
    getRemoteData();
  } else {
    console.log("Error passing the current location to API");
  }
});

// Helper method to convert price_range from a number to '$'
function renderDollarSigns(val) {
  if (typeof val === "number") {
    let res = "";
    for (let i = 0; i < val; i++) {
      res += "$";
    }
    return res;
  } else return val;
}

module.exports = router;
