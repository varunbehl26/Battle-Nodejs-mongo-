var mongo = require('mongodb');
var ObjectID = require('mongodb').ObjectID

var Server = mongo.Server,
    Db = mongo.Db;

var server = new Server('localhost', 27017, { auto_reconnect: true });
db = new Db('gotdb', server);

db.open(function (err, db) {
    if (!err) {
        console.log("Connected to 'gotdb' database");
        db.collection('battles', { strict: true }, function (err, collection) {
            if (err) {
                console.log("The 'battles' collection doesn't exist.");
                populateDB();
            }
        });
    }
});


exports.findSearch = function (req, res) {
    var name = req.query.name;
    var king = req.query.king;
    var location = req.query.location;
    var type = req.query.type;
    var key = "", value = "";
    var query = {};
    if (name != undefined) {
        key = "name";
        value = req.query.name;
    } else if (king != undefined) {
        key = "attacker_king";
        value = req.query.king;

    } else if (location != undefined) {
        key = "location";
        value = req.query.location;

    } else if (type != undefined) {
        key = "battle_type";
        value = req.query.type;

    }

    query[key] = value;

    db.collection('battles', function (err, collection) {
        collection.find(query, {
            "_id": 0
        }).toArray(function (err, items) {
            res.send(items);
        });
    });
};


exports.findById = function (req, res) {
    var id = req.params.id;
    console.log('Retrieving battles: ' + id);
    db.collection('battles', function (err, collection) {
        collection.findOne({ '_id': new BSON.ObjectID(id) }, function (err, item) {
            res.send(item);
        });
    });
};

exports.findAll = function (req, res) {
    db.collection('battles', function (err, collection) {
        collection.find().toArray(function (err, items) {
            res.send(items);
        });
    });
};

exports.findLoc = function (req, res) {
    db.collection('battles', function (err, collection) {
        collection.find({}, {
            "location": 1,
            "_id": 0
        }).toArray(function (err, items) {
            res.send(items);
        });
    });
};

exports.findCount = function (req, res) {
    db.collection('battles', function (err, collection) {
        collection.aggregate(
            [
                { $group: { _id: null, count: { $sum: 1 } } }
            ]
        ).toArray(function (err, items) {
            res.send(items);
        });
    });
};

exports.findStats = function (req, res) {
    var most_active_attacker_king = "";
    var most_active_defender_king = "";
    var most_active_attacker_region = "";
    var battle_types = "";
    var most_name = "";
    var attacker_outcomes = "";
    var avg_defendersize = "";
    var max_defendersize = "";
    var min_defendersize = "";


    db.collection('battles', function (err, collection) {
        collection.aggregate([
            {
                $group: {
                    _id: "$name", num: { $sum: 1 }
                }
            },
            { $sort: { "num": -1 } },
            { $limit: 1 }
        ]).toArray(function (err, items) {
            most_name = items;
        });
    });


    db.collection('battles', function (err, collection) {
        collection.aggregate([
            {
                $group: {
                    _id: "$attacker_king", num: { $sum: 1 }
                }
            },
            { $sort: { "num": -1 } },
            { $limit: 1 }
        ]).toArray(function (err, items) {
            most_active_attacker_king = items;
        });
    });

    db.collection('battles', function (err, collection) {
        collection.aggregate([
            {
                $group: {
                    _id: "$defender_king", num: { $sum: 1 }
                }
            },
            { $sort: { "num": -1 } },
            { $limit: 1 }
        ]).toArray(function (err, items) {
            most_active_defender_king = items;
        });
    });

    db.collection('battles', function (err, collection) {
        collection.find([
            {
                $group: {
                    _id: "$region", num: { $sum: 1 }
                }
            },
            { $sort: { "num": -1 } },
            { $limit: 1 }
        ]).toArray(function (err, items) {
            most_active_attacker_region = items;
        });
    });


    db.collection('battles', function (err, collection) {
        collection.aggregate([
            {
                $group: {
                    _id: "$battle_type"
                }
            },
            { $sort: { "num": -1 } }]).toArray(function (err, items) {
                battle_types = items;
            });
    });

    db.collection('battles', function (err, collection) {
        collection.aggregate([
            {
                $group: {
                    _id: "$attacker_outcome",
                    "": { $sum: 1 }
                }
            },
            { $sort: { "num": 1 } }]).toArray(function (err, items) {
                attacker_outcomes = items;
            });
    });

    db.collection('battles', function (err, collection) {
        collection.aggregate([
            {
                $group: {
                    _id: "null",
                    "avg_defender_size": { "$avg": "$defender_size" }
                }
            }
        ]
        ).toArray(function (err, items) {
            avg_defendersize = items;
        });
    });

    db.collection('battles', function (err, collection) {
        collection.aggregate([
            {
                $group: {
                    _id: "null",
                    "min_defender_size": { "$min": "$defender_size" }
                }
            }
        ]
        ).toArray(function (err, items) {
            min_defendersize = items;
        });
    });

    db.collection('battles', function (err, collection) {
        collection.aggregate([
            {
                $group: {
                    _id: "$defender_size",
                }
            }
            , { $sort: { "num": 1 } },
            { $limit: 1 }

        ]
        ).toArray(function (err, items) {
            max_defendersize = items;

        });
    });



}
