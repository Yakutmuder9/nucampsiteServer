const express = require("express");
const authenticate = require('../authenticate');
const favoriteRouter = express.Router();
const Favorite = require('../models/favorite');
const cors = require('./cors');

favoriteRouter
    .route("/")
    .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
    .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
        Favorite.find({ user: req.user._id }).populate('user').populate('favorites')
            .then(favorites => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorites);
            })
            .catch(err => next(err));
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.find({ user: req.user._id })
            .then(favorite => {
                if (favorite) {
                    req.body.forEach(fav => {
                        if (favorite.favorites.includes(fav._id)) {
                            favorite.favorites.push(fav._id)
                        }
                    })
                    favorite.save()
                        .then((favorite) => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favorite);
                        })
                        .catch(err => next(err));
                } else {
                    Favorite.create({ user: req.user._id })
                        .then(favorite => {
                            req.body.forEach(fav => {
                                if (favorite.favorites.includes(fav._id)) {
                                    favorite.favorites.push(fav._id)
                                }
                            })
                            favorite.save()
                                .then((favorite) => {
                                    res.statusCode = 200;
                                    res.setHeader('Content-Type', 'application/json');
                                    res.json(favorite);
                                })
                                .catch(err => next(err));
                        })
                }

            })
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /favorites');
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findByIdAndDelete({ user: req.user._id })
            .then(favorite => {
                res.statusCode = 200
                if (favorite) {
                    res.setHeader('Content-Type', 'application/json')
                    res.json(favorite)
                } else {
                    res.setHeader('Content-Type', 'text/plain')
                    res.end('You do not have any favorites to delet')
                }
            })
    });



favoriteRouter
    .route("/:favoriteId")
    .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
    .get((req, res, next) => {
        res.statusCode = 403;
        res.end('GET operation not supported on /favorites/favoriteId');
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
        Favorite.findOne({ user: req.user._id })
            .then(favorite => {
                if (favorite) {
                    if (!favorite.favorites.includes(req.params.favoriteId)) {
                        favorite.favorites.push(req.params.favoriteId)

                        favorite.save()
                            .then((favorite) => {
                                res.statusCode = 200;
                                res.setHeader('Content-Type', 'application/json');
                                res.json(favorite);
                            })
                            .catch(err => next(err));
                    } else {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.end('The camspite is already in your favorites');
                    }
                } else {
                    Favorite.create({ user: req.user._id, favorites: [req.params.favoriteId] })
                        .then((favorite) => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favorite);
                        })
                        .catch(err => next(err));
                }
            })
            .catch(err => next(err));
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /favorites/favoriteId');
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOne({ user: req.user._id })
            .then(favorite => {
                if (favorite) {
                    const index = favorite.campsites.indexOf(req.params.favoriteId)
                    if (index >= 0) {
                        favorite.campsites.splice(index, 1)
                    }
                    favorite.save()
                        .then((favorite) => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favorite);
                        })
                        .catch(err => next(err));
                }
                else {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/plain');
                    res.end("There are no favorite to delet");
                }

            })
            .catch(err => next(err));
    });


module.exports = favoriteRouter;