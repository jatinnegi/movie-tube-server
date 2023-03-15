const router = require("express").Router();
const {
  trendingController,
  popularMoviesController,
  popularTvController,
  autocompleteController,
  genresListController,
  genreMediaListController,
  getDetailsController,
  getSeasonsListController,
  getTotalNumberOfSeasonsController,
  getEpisodesList,
} = require("../controllers/");

router.get("/trending", trendingController);
router.get("/popular/movies", popularMoviesController);
router.get("/popular/tv", popularTvController);
router.get("/autocomplete", autocompleteController);
router.get("/genresList", genresListController);
router.get("/genre/:genreName/:media_type", genreMediaListController);
router.get("/:mediaType/:id", getDetailsController);
router.get("/tv/:id/seasons", getSeasonsListController);
router.get("/tv/:id/seasons/total", getTotalNumberOfSeasonsController);
router.get("/tv/:id/seasons/:seasonNumber", getEpisodesList);

module.exports = router;
