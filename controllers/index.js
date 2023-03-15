const axios = require("axios");
const { formatDate, formatMoney } = require("../helpers/");
const genresList = require("../genres.json");
const languagesList = require("../languages.json");

const imageBaseUrl = "https://www.themoviedb.org/t/p/original";
const defaultPosterPath =
  "https://mern-movie-app-tmdb.herokuapp.com/images/default-poster.png";
const defaultProfilePath =
  "https://mern-movie-app-tmdb.herokuapp.com/images/default-profile-photo.jpg";
const noImageFoundPath =
  "https://mern-movie-app-tmdb.herokuapp.com/images/no-image-found.png";

function trendingController(req, res) {
  const { limit } = req.query;

  axios
    .get(
      `https://api.themoviedb.org/3/trending/all/day?api_key=${process.env.API_KEY}`
    )
    .then((response) => {
      const results = response.data.results;
      let resultsCounter = 0;
      let data = [];

      for (let i = 0; i < results.length; i++) {
        if (results[i].media_type !== "movie" && results[i].media_type !== "tv")
          continue;
        if (resultsCounter === +limit) break;

        const title =
          results[i].media_type === "movie"
            ? `${results[i].title} (${results[i].release_date.split("-")[0]})`
            : `${results[i].name} (${results[i].first_air_date.split("-")[0]})`;

        const rating = results[i].vote_average * 10;

        data.push({
          id: results[i].id,
          media_type: results[i].media_type,
          title,
          overview: results[i].overview,
          rating,
          backdrop_path: `${imageBaseUrl}${results[i].backdrop_path}`,
        });

        resultsCounter++;
      }

      res.status(200).json(data);
    })
    .catch((err) => {
      console.log(err);
      if (err.errno === "ECONNRESET")
        res.status(400).json({
          errno: err.errno,
        });
      else
        res.status(400).json({
          msg: "Something went wrong",
        });
    });
}

function popularMoviesController(req, res) {
  const { limit } = req.query;

  axios
    .get(
      `https://api.themoviedb.org/3/movie/popular?api_key=${process.env.API_KEY}`
    )
    .then((response) => {
      const results = response.data.results;
      let resultsCounter = 0;
      let data = [];

      for (let i = 0; i < limit; i++) {
        const rating = results[i].vote_average * 10;

        const release_date = formatDate(results[i].release_date);

        data.push({
          id: results[i].id,
          media_type: "movie",
          title: results[i].title,
          rating,
          release_date,
          poster_path: `${imageBaseUrl}${results[i].poster_path}`,
        });

        resultsCounter++;
      }

      res.status(200).json(data);
    })
    .catch((err) => {
      if (err.errno === "ECONNRESET")
        res.status(400).json({
          errno: err.errno,
        });
      else
        res.status(400).json({
          msg: "Something went wrong",
        });
    });
}

function popularTvController(req, res) {
  const { limit } = req.query;

  axios
    .get(
      `https://api.themoviedb.org/3/tv/popular?api_key=${process.env.API_KEY}`
    )
    .then((response) => {
      const results = response.data.results;
      let resultsCounter = 0;
      let data = [];

      for (let i = 0; i < limit; i++) {
        const rating = results[i].vote_average * 10;

        const first_air_date = formatDate(results[i].first_air_date);

        data.push({
          id: results[i].id,
          media_type: "tv",
          title: results[i].name,
          rating,
          first_air_date,
          poster_path: `${imageBaseUrl}${results[i].poster_path}`,
        });

        resultsCounter++;
      }

      res.status(200).json(data);
    })
    .catch((err) => {
      if (err.errno === "ECONNRESET")
        res.status(400).json({
          errno: err.errno,
        });
      else
        res.status(400).json({
          msg: "Something went wrong",
        });
    });
}

function autocompleteController(req, res) {
  const { query } = req.query;

  axios
    .get(
      `
  https://api.themoviedb.org/3/search/multi?api_key=${process.env.API_KEY}&language=en-US&query=${query}&page=1
  &include_adult=false`
    )
    .then((response) => {
      const { results } = response.data;
      let data = [];
      let resultsCounter = 0,
        i = 0;

      while (resultsCounter !== 10 && i < results.length) {
        const media_type = results[i].media_type;

        if (media_type !== "movie" && media_type !== "tv") {
          i++;
          continue;
        }

        const title =
          media_type === "movie"
            ? `${results[i].title} (${results[i].release_date.split("-")[0]})`
            : `${results[i].name} (${results[i].first_air_date.split("-")[0]})`;

        const poster_path = results[i].poster_path
          ? `${imageBaseUrl}${results[i].poster_path}`
          : `${defaultPosterPath}`;

        data.push({
          id: results[i].id,
          media_type,
          title,
          poster_path,
        });

        i++;
        resultsCounter++;
      }

      res.status(200).json(data);
    })
    .catch((err) => {
      if (err.errno === "ECONNRESET")
        res.status(400).json({
          errno: err.errno,
        });
      else
        res.status(400).json({
          msg: "Something went wrong",
        });
    });
}

function genresListController(req, res) {
  res.status(200).json(genresList);
}

function genreMediaListController(req, res) {
  const { sort_by, page } = req.query;
  const { genreName, media_type } = req.params;
  const genre_name = genreName.replace(/-/g, " ");

  const genre = genresList.filter(
    (genre) => genre.name.toUpperCase() === genre_name.toUpperCase()
  )[0];

  if (genre === undefined)
    return res.status(400).json({ msg: "Invalid Genre" });

  let data = [];
  const genre_id = genre.id;

  let sortBy;
  if (sort_by === "popularity") sortBy = "popularity.desc";
  else if (sort_by === "rating") sortBy = "vote_count.desc";
  else if (sort_by === "latest") sortBy = "release_date.desc";
  else if (sort_by === "oldest") sortBy = "release_date.asc";
  else sortBy = "";

  axios
    .get(
      `https://api.themoviedb.org/3/discover/${media_type}?api_key=${
        process.env.API_KEY
      }${
        sortBy.length > 0 ? `&sort_by=${sortBy}` : ""
      }&with_genres=${genre_id}&page=${page}`
    )
    .then((response) => {
      const { results } = response.data;

      if (results.length === 0)
        return res.status(400).json({ msg: "No Data Found." });

      results.forEach((media) => {
        const overviewLength = media.overview.length;
        const overview =
          overviewLength < 150
            ? media.overview
            : `${media.overview.substring(0, 150)}...`;

        let genres = "";

        media.genre_ids.forEach((genre_id) => {
          let genreName = genresList.filter(
            (genre) => genre.id === genre_id
          )[0];
          genres += `${genreName.name}, `;
        });

        genres = genres.substring(0, genres.length - 2);

        const title = media_type === "movie" ? media.title : media.name;

        data.push({
          id: media.id,
          media_type: media_type,
          title,
          genres,
          first_air_date:
            media_type === "tv" ? formatDate(media.first_air_date) : "",
          release_date:
            media_type === "movie" ? formatDate(media.release_date) : "",
          overview,
          rating: media.vote_average * 10,
          poster_path: media.poster_path
            ? `${imageBaseUrl}${media.poster_path}`
            : `${defaultPosterPath}`,
        });
      });
      res.status(200).json({ total_pages: response.data.total_pages, data });
    })
    .catch((err) => {
      if (err.errno === "ECONNRESET")
        res.status(400).json({
          errno: err.errno,
        });
      else
        res.status(400).json({
          msg: "Something went wrong",
        });
    });
}

async function getDetailsController(req, res) {
  const { mediaType, id } = req.params;

  try {
    let response = await axios.get(
      `https://api.themoviedb.org/3/${mediaType}/${id}?api_key=${process.env.API_KEY}&language=en-US`
    );
    const media = response.data;

    let data = {
      banner: {},
      cast: [],
      meta_data: {},
      latest_season: {},
      recommended: [],
    };

    const date =
      mediaType === "movie"
        ? formatDate(media.release_date)
        : formatDate(media.first_air_date);

    const title =
      mediaType === "movie"
        ? `${media.title} (${date.split(" ")[2]})`
        : `${media.name} (${date.split(" ")[2]})`;
    const genres = media.genres.map((genre) => genre.name).join(", ");
    const hr = parseInt(media.runtime / 60);
    const min = media.runtime % 60;
    const runtime =
      mediaType === "movie"
        ? `${hr}hr ${min}m`
        : `${media.episode_run_time[0]}m`;
    const original_language = languagesList.filter(
      (language) => language.iso_639_1 === media.original_language
    )[0].english_name;

    data.banner = {
      id: media.id,
      media_type: mediaType,
      title,
      date,
      genres,
      runtime,
      rating: media.vote_average * 10,
      trailer: "",
      tagline: media.tagline,
      overview: media.overview || "-",
      poster_path: media.poster_path
        ? `${imageBaseUrl}${media.poster_path}`
        : defaultPosterPath,
      backdrop_path: `${imageBaseUrl}${media.backdrop_path}`,
      creator_name:
        mediaType === "tv"
          ? media.created_by.map((creator) => creator.name).join(", ") || "-"
          : "",
    };

    data.meta_data = {
      ...data.meta_data,
      networks:
        mediaType === "tv"
          ? media.networks.map(
              (network) =>
                `https://www.themoviedb.org/t/p/h30${network.logo_path}`
            )
          : [],
    };

    if (mediaType === "tv") {
      const latest_season = media.seasons.pop();

      data.latest_season = {
        ...data.latest_season,
        season_number: latest_season.season_number,
        year: latest_season.air_date.split("-")[0],
        episode_count: latest_season.episode_count,
        poster_path: latest_season.poster_path
          ? `${imageBaseUrl}${latest_season.poster_path}`
          : `${defaultPosterPath}`,
        overview: `${latest_season.overview}`,
      };
    }

    response = await axios.get(
      `https://api.themoviedb.org/3/${mediaType}/${id}/keywords?api_key=${process.env.API_KEY}`
    );

    const keywords =
      mediaType === "movie"
        ? response.data.keywords.map((keyword) => keyword.name)
        : response.data.results.map((keyword) => keyword.name);

    data.meta_data = {
      ...data.meta_data,
      status: media.status,
      original_language,
      budget: mediaType === "movie" ? formatMoney(media.budget) : "",
      revenue: mediaType === "movie" ? formatMoney(media.revenue) : "",
      type: mediaType === "tv" ? media.type : "",
      keywords,
    };

    response = await axios.get(
      `https://api.themoviedb.org/3/${mediaType}/${id}/credits?api_key=${process.env.API_KEY}&language=en-US`
    );

    const { crew, cast } = response.data;

    let director_name =
      mediaType === "movie"
        ? crew.filter((crew) => crew.job === "Director")[0].name || "-"
        : "";

    data.banner.director_name = director_name;

    data.cast = cast.map((cast) => ({
      name: cast.name,
      character: cast.character,
      profile_path: cast.profile_path
        ? `${imageBaseUrl}${cast.profile_path}`
        : `${defaultProfilePath}`,
    }));

    response = await axios.get(
      `https://api.themoviedb.org/3/${mediaType}/${id}/recommendations?api_key=${process.env.API_KEY}&language=en-US&page=1`
    );

    const recommendedList = response.data.results.map((recommended) => ({
      id: recommended.id,
      media_type: recommended.media_type,
      title:
        recommended.media_type === "movie"
          ? recommended.title
          : recommended.name,
      release_date:
        recommended.media_type === "movie"
          ? formatDate(recommended.release_date)
          : "",
      first_air_date:
        recommended.media_type === "tv"
          ? formatDate(recommended.first_air_date)
          : "",
      rating: parseInt(recommended.vote_average * 10),
      poster_path: recommended.poster_path
        ? `${imageBaseUrl}${recommended.poster_path}`
        : defaultPosterPath,
    }));

    data.recommended = recommendedList;

    response = await axios.get(
      `https://api.themoviedb.org/3/${mediaType}/${id}/videos?api_key=${process.env.API_KEY}`
    );

    let trailer = response.data.results
      .filter((video) => video.type === "Trailer" && video.site === "YouTube")
      .pop()
      ? response.data.results
          .filter(
            (video) => video.type === "Trailer" && video.site === "YouTube"
          )
          .pop().key
      : null;

    data.banner = {
      ...data.banner,
      trailer: trailer
        ? `https://www.youtube-nocookie.com/embed/${trailer}`
        : null,
    };

    res.status(200).json(data);
  } catch (error) {
    if (error.errno === "ECONNRESET")
      res.status(400).json({ errno: error.errno });
    else {
      console.log(error);
      res.status(400).json({ msg: "Something went wrong!" });
    }
  }
}

async function getSeasonsListController(req, res) {
  const { id } = req.params;

  try {
    const response = await axios.get(
      `https://api.themoviedb.org/3/tv/${id}?language=en-US&api_key=${process.env.API_KEY}`
    );
    const poster_path = `${imageBaseUrl}${response.data.poster_path}`;
    const title = `${response.data.name} (${
      response.data.first_air_date.split("-")[0]
    })`;
    const { seasons } = response.data;
    const seasonsList = seasons.map((season) => ({
      season_number: season.season_number,
      id: season.id,
      name: season.name,
      episode_count: season.episode_count,
      overview: season.overview,
      year: season.air_date.split("-")[0],
      poster_path: season.poster_path
        ? `${imageBaseUrl}${season.poster_path}`
        : `${defaultPosterPath}`,
    }));

    res.status(200).json({ title, poster_path, data: seasonsList });
  } catch (error) {
    if (error.errno === "ECONNRESET")
      res.status(400).json({ errno: error.errno });
    else res.status(400).json({ msg: "Something went wrong!" });
  }
}

async function getTotalNumberOfSeasonsController(req, res) {
  const { id } = req.params;

  try {
    let response = await axios.get(
      `https://api.themoviedb.org/3/tv/${id}?api_key=${process.env.API_KEY}&language=en-US`
    );
    const first_season_number = response.data.seasons[0].season_number;
    const last_season_number = response.data.seasons.pop().season_number;
    const poster_path = response.data.poster_path
      ? `${imageBaseUrl}${response.data.poster_path}`
      : `${defaultPosterPath}`;
    const title = `${response.data.name} (${
      response.data.first_air_date.split("-")[0]
    })`;

    res
      .status(200)
      .json({ first_season_number, last_season_number, poster_path, title });
  } catch (error) {
    if (error.errno === "ECONNRESET")
      res.status(400).json({ errno: error.errno });
    else {
      console.log(error);
      res.status(400).json({ msg: "Something went wrong!" });
    }
  }
}

async function getEpisodesList(req, res) {
  const { id, seasonNumber } = req.params;

  try {
    let response = await axios.get(
      `https://api.themoviedb.org/3/tv/${id}/season/${seasonNumber}?api_key=${process.env.API_KEY}&language=en-US`
    );

    const { episodes } = response.data;

    const episodesList = episodes.map((episode) => ({
      still_path: episode.still_path
        ? `${imageBaseUrl}${episode.still_path}`
        : `${noImageFoundPath}`,
      title: episode.name,
      episode_number: episode.episode_number,
      air_date: formatDate(episode.air_date),
      rating: Math.round(+episode.vote_average * 10) / 10,
      overview: episode.overview,
      written_by: episode.crew.filter((crew) => crew.job === "Writer")[0]
        ? episode.crew.filter((crew) => crew.job === "Writer")[0].name
        : "-",
      directed_by: episode.crew.filter((crew) => crew.job === "Director")[0]
        ? episode.crew.filter((crew) => crew.job === "Director")[0].name
        : "-",
      guest_stars: episode.guest_stars.map((guest) => ({
        profile_path: guest.profile_path
          ? `${imageBaseUrl}${guest.profile_path}`
          : `${defaultProfilePath}`,
        name: guest.name,
        character: guest.character,
      })),
    }));

    res.status(200).json(episodesList);
  } catch (error) {
    console.log(error);
    if (error.errno === "ECONNRESET")
      res.status(400).json({ errno: error.errno });
    else {
      console.log(error);
      res.status(400).json({ msg: "Something went wrong!" });
    }
  }
}

module.exports = {
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
};
