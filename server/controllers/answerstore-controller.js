// import dependencies
const IBMCloudEnv = require("ibm-cloud-env");
IBMCloudEnv.init("/server/config/mappings.json");

// initialize Cloudant
const CloudantSDK = require("@cloudant/cloudant");

const cloudant = new CloudantSDK(IBMCloudEnv.getString("cloudant_url"));

// create mydb database if it does not already exist
cloudant.db
  .create("mydb")
  .then((data) => {
    console.log("mydb database created");
  })
  .catch((error) => {
    if (error.error === "file_exists") {
      console.log("mydb database already exists");
    } else {
      console.log(error);
      console.log("Error occurred when creating mydb database", error.error);
    }
  });
const mydb = cloudant.db.use("mydb");

exports.removeAnswer = (req, res, next) => {
  console.log("In route - removeAnswer");

  let id = req.body.id;
  let rev = req.body.rev;

  console.log("Deleting document " + id);
  // supply the id and revision to be deleted
  return mydb
    .destroy(id, rev)
    .then((result) => {
      console.log(result);
      return res.status(200).json(result);
    })
    .catch((error) => {
      console.log("Remove answer failed");
      return res.status(500).json({
        message: "Remove answer failed.",
        error: error,
      });
    });
};

// get answers from database
exports.getAnswers = (req, res, next) => {
  console.log("In route - getAnswers");
  return mydb
    .list({ include_docs: true })
    .then((fetchedAnswers) => {
      let answers = [];
      let row = 0;
      fetchedAnswers.rows.forEach((fetchedName) => {
        answers[row] = {
          _id: fetchedName.id,
          language: fetchedName.doc.language,
          answerText: fetchedName.doc.answerText,
          timestamp: fetchedName.doc.timestamp,
          display_id: fetchedName.doc.display_id,
          rev: fetchedName.doc._rev,
        };
        row = row + 1;
      });
      console.log("Get answers successful");
      return res.status(200).json(answers);
    })
    .catch((error) => {
      console.log("Get answers failed");
      return res.status(500).json({
        message: "Get answers failed.",
        error: error,
      });
    });
};

// add name to database
exports.addAnswer = (req, res, next) => {
  console.log("In route - addAnswer");
  let answerUnit = {
    _id: req.body.id + ":" + req.body.language,
    display_id: req.body.id,
    language: req.body.language,
    answerText: req.body.answerText,
    timestamp: req.body.timestamp,
  };
  console.log(answerUnit);
  return mydb
    .insert(answerUnit)
    .then((addedAnswer) => {
      console.log("Add answer successful");
      return res.status(201).json({
        _id: addedAnswer.id,
        display_id: addedAnswer.display_id,
        language: addedAnswer.language,
        answerText: addedAnswer.answerText,
        timestamp: addedAnswer.timestamp,
      });
    })
    .catch((error) => {
      console.log("Add answer failed");
      return res.status(500).json({
        message: "Add answer failed.",
        error: error,
      });
    });
};
