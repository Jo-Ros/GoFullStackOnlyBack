const Thing = require('../models/thing');
const fs = require('fs'); // filesysteme

exports.getAllStuff = (req, res, next) => {
    Thing.find()
      .then(things => res.status(201).json(things))
      .catch(error => res.status(400).json({ error}));
};

exports.createThing = (req, res, next) => {
  const thingObject = JSON.parse(req.body.thing);
  delete thingObject._id;
  const thing = new Thing({
    ...thingObject,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  });
  thing.save()
    .then(() => res.status(201).json({ message: 'Objet enregistré !'}))
    .catch(error => res.status(400).json({ error }));
};

exports.getOneThing = (req, res, next) => {
    Thing.findOne({ _id: req.params.id })
      .then(thing => res.status(200).json(thing))
      .catch(error => res.status(404).json({ error }));
};

exports.modifyThing = (req, res, next) => {
  const thingObject = req.file ?
  { ...JSON.parse(req.body.thing),
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  } : { ...req.body };
    Thing.updateOne({ _id: req.params.id }, { ...thingObject, _id: req.params.id })
      .then(() => res.status(200).json({ message: 'Objet modifié !'}))
      .catch(error => res.status(400).json({ error }));
};

exports.deleteThing = (req, res, next) => {
  Thing.findOne({ _id: req.params.id })
    .then(thing => {
      const filename = thing.imageUrl.split('/images/')[1];
      fs.unlink(`images/${filename}`, () => {
        Thing.findOne({ _id: req.params.id })
        .then((thing) => {
          if(!thing) {
            return res.status(404).json({ error: new Error('No such thing!' )});
          }
          if(thing.userId !== req.auth.userId) {
            return res.status(401).json({ error: new Error('Unauthorized request!' )});
          }
        });
        Thing.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: 'Objet supprimé !'}))
          .catch(error => res.status(400).json({ error }));
      });
    })
    .catch(error => res.status(500).json({ error }));
};


    // Thing.deleteOne({ _id: req.params.id })
    //   .then(() => res.status(200).json({ message: 'Objet supprimé !'}))
    //   .catch(error => res.status(400).json({ error }));