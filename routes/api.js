"use strict";
const db = require("../mongodb/mongo.js");
module.exports = function (app) {
  function filterResponse(data, query) {
    if (!data) return [];

    const filters = {
      _id: (el, val) => String(el._id) === val,
      from: (el, val) => new Date(el.date) >= new Date(val),
      to: (el, val) => new Date(el.date) <= new Date(val),
      open: (el, val) => String(el.open) === val,
      issue_title: (el, val) => el.issue_title === val,
      issue_text: (el, val) => el.issue_text === val,
      assigned_to: (el, val) => el.assigned_to === val,
      created_by: (el, val) => el.created_by === val,
      status_text: (el, val) => el.status_text === val,
      created_on: (el, val) => el.created_on === val,
      updated_on: (el, val) => el.updated_on === val,
    };
    let res = data.filter((el) =>
      Object.entries(filters).every(([key, fn]) =>
        query[key] ? fn(el, query[key]) : true
      )
    );

    if (query.limit) {
      const limit = parseInt(query.limit, 10);
      if (!isNaN(limit)) {
        res = res.slice(0, limit);
      }
    }
    res = res.map((dbObj) => {
      const { project_id, __v, ...cleaned } = dbObj.toObject();
      return cleaned;
    });
    return res;
  }
  app
    .route("/api/issues/:project")
    .get(async function (req, res) {
      try {
        let project_name = req.params.project;
        const issues = await db.findIssuesByProjectName(project_name);
        const filtredIssues = filterResponse(issues, req.query);
        res.json(filtredIssues);
      } catch (err) {
        console.error("Error finding issues", err);
        res.send("error");
      }
    })

    .post(async function (req, res) {
      let issue = req.body;
      let project_name = req.params.project;
      if (!issue.issue_title || !issue.issue_text || !issue.created_by) {
        res.json({ error: "required field(s) missing" });
        return;
      }
      const savedIssue = await db.createNewIssue(issue, project_name);
      const { project_id, __v, ...cleaned } = savedIssue.toObject();
      res.json(cleaned);
    })

    .put(async function (req, res) {
      try {
        if (!req.body._id) {
          res.json({ error: "missing _id" });
          return;
        }
        const requiredAtLeastOne = [
          "issue_title",
          "issue_text",
          "created_by",
          "assigned_to",
          "status_text",
          "open",
        ];
        if (!Object.keys(req.body).some((field) =>
            requiredAtLeastOne.includes(field))
        ) {
          res.json({ error: "no update field(s) sent", _id: req.body._id });
          return;
        }

        const data = req.body;
        const result = await db.updateIssue(data);
        if (result) {
          res.json({ result: "successfully updated", _id: req.body._id });
          return;
        }
      } catch (err) {
        res.json({ error: "could not update", _id: req.body._id });
      }
    })

    .delete(async function (req, res) {
      try {
        const _id = req.body._id;
        if (!_id) {
          res.json({ error: "missing _id" });
          return;
        }
        await db.deleteIssueById(_id);
        res.json({ result: "successfully deleted", _id: _id });
      } catch (err) {
        res.json({ error: "could not delete", _id: req.body._id });
      }
    });
};
