const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");

chai.use(chaiHttp);
suite("Functional Tests", function () {
  suite("POST", function () {
    test("Create an issue with every field: POST request to /api/issues/{project}", function (done) {
      chai
        .request(server)
        .post("/api/issues/test_project")
        .send({
          issue_title: "test_title",
          issue_text: "test_text",
          created_by: "test user",
          assigned_to: "test user 2",
          status_text: "test_status_text",
        })
        .end(function (err, res) {
          assert.hasAllKeys(
            res.body,
            [
              "issue_title",
              "issue_text",
              "created_by",
              "assigned_to",
              "status_text",
              "created_on",
              "updated_on",
              "open",
              "_id",
            ],
            "Response body should contain all expected fields"
          );
          assert.isObject(res.body, "Response should be an object");
          assert.equal(
            res.body.issue_text,
            "test_text",
            "issue_text should match"
          );
          assert.equal(
            res.body.issue_title,
            "test_title",
            "issue_title should match"
          );
          assert.equal(
            res.body.created_by,
            "test user",
            "created_by should match"
          );
          assert.equal(
            res.body.assigned_to,
            "test user 2",
            "assigned_to should match"
          );
          assert.equal(
            res.body.status_text,
            "test_status_text",
            "status_text should match"
          );
          done();
        });
    });

    test("Create an issue with only required fields: POST request to /api/issues/{project}", function (done) {
      chai
        .request(server)
        .post("/api/issues/test_project")
        .send({
          issue_title: "test_title",
          issue_text: "test_text",
          created_by: "test_user",
        })
        .end(function (err, res) {
          assert.equal(
            res.body.issue_title,
            "test_title",
            "issue_title should match"
          );
          assert.equal(
            res.body.issue_text,
            "test_text",
            "issue_text should match"
          );
          assert.equal(
            res.body.created_by,
            "test_user",
            "created_by should match"
          );
          assert.equal(res.body.assigned_to, "", "assigned_to should be empty");
          assert.equal(res.body.status_text, "", "status_text should be empty");
          done();
        });
    });
    test("Create an issue with missing required fields: POST request to /api/issues/{project}", function (done) {
      chai
        .request(server)
        .post("/api/issues/test_project")
        .send({
          created_by: "test user",
          assigned_to: "test user 2",
          status_text: "test_status_text",
        })
        .end(function (err, res) {
          assert.equal(res.body.error, "required field(s) missing");
          done();
        });
    });
  });
  suite("GET", function () {
    test("View issues on a project: GET request to /api/issues/{project}", function (done) {
      chai
        .request(server)
        .get("/api/issues/test_project")
        .end(function (err, res) {
          assert.isArray(res.body);
          res.body.forEach((obj) => {
            chai
              .expect(obj)
              .to.have.keys(
                "issue_title",
                "issue_text",
                "created_by",
                "assigned_to",
                "created_on",
                "updated_on",
                "open",
                "status_text",
                "_id"
              );
          });
        });
      done();
    });

    test("View issues on a project with one filter: GET request to /api/issues/{project}", function (done) {
      chai
        .request(server)
        .post("/api/issues/test_project")
        .send({
          issue_title: "Title",
          issue_text: "Text",
          created_by: "John Doe",
          assigned_to: "Xeen",
        })
        .end(function (err) {
          if (err) return done(err);
          chai
            .request(server)
            .get("/api/issues/test_project")
            .query({ assigned_to: "Xeen" })
            .end(function (err, res) {
              if (err) return done(err);

              chai.expect(res).to.have.status(200);
              assert.isArray(res.body);
              chai.expect(res.body).to.have.length.gte(1);
              res.body.forEach((obj) => {
                chai.expect(obj).to.contain.key({ assigned_to: "Xeen" });
              });
              done();
            });
        });
    });

    test("View issues on a project with multiple filters: GET request to /api/issues/{project}", function (done) {
      chai
        .request(server)
        .post("/api/issues/test_project")
        .send({
          issue_title: "it",
          issue_text: "itE",
          created_by: "John",
          assigned_to: "Doe",
          status_text: "PLEASE FIX!!!",
        })
        .end(function (err) {
          if (err) return done(err);
          chai
            .request(server)
            .get("/api/issues/test_project")
            .query({ assigned_to: "Doe", created_by: "John" })
            .end(function (err, res) {
              if (err) return done(err);

              chai.expect(res).to.have.status(200);
              assert.isArray(res.body);
              chai.expect(res.body).to.have.length.gte(1);
              res.body.forEach((obj) => {
                chai
                  .expect(obj)
                  .to.contain.keys({ assigned_to: "Doe", created_by: "John" });
              });
              done();
            });
        });
    });
  });
  suite("PUT", function () {
    test("Update one field on an issue: PUT request to /api/issues/{project}", function (done) {
      chai
        .request(server)
        .get("/api/issues/test_project")
        .query({ open: true })
        .end(function (err, res) {
          if (err) return done(err);
          chai.expect(res).to.have.status(200);
          assert.isArray(res.body);
          const issueId = res.body[0]._id;
          chai
            .request(server)
            .put("/api/issues/test_project")
            .send({ _id: issueId, open: false })
            .end(function (err, res) {
              if (err) return done(err);
              chai.expect(res).to.have.status(200);
              chai.expect(res.body).to.be.an("object");
              chai
                .expect(res.body)
                .to.have.property("result", "successfully updated");
              chai.expect(res.body).to.have.property("_id", issueId);

              done();
            });
        });
    });

    test("Update multiple fields on an issue: PUT request to /api/issues/{project}", function (done) {
      chai
        .request(server)
        .get("/api/issues/test_project")
        .query({ open: true, created_by: "test user" })
        .end(function (err, res) {
          if (err) return done(err);
          chai.expect(res).to.have.status(200);
          chai.expect(res.body).to.be.an("array");
          const issueId = res.body[0]._id;
          chai
            .request(server)
            .put("/api/issues/test_project")
            .send({ _id: issueId, open: false, created_by: "other test user" })
            .end(function (err, res) {
              if (err) return done(err);
              chai.expect(res).to.have.status(200);
              assert.isObject(res.body);
              chai
                .expect(res.body)
                .to.have.property("result", "successfully updated");
              chai.expect(res.body).to.have.property("_id", issueId);

              done();
            });
        });
    });

    test("Update an issue with missing _id: PUT request to /api/issues/{project}", function (done) {
      chai
        .request(server)
        .put("/api/issues/test_project")
        .send({ issue_text: "some_text" })
        .end(function (err, res) {
          if (err) return done(err);
          chai.expect(res).to.have.status(200);
          assert.isObject(res.body);
          chai.expect(res.body).to.have.property("error", "missing _id");
          done();
        });
    });

    test("Update an issue with no fields to update: PUT request to /api/issues/{project}", function (done) {
      chai
        .request(server)
        .post("/api/issues/test_project")
        .send({
          issue_title: "PUT_title",
          issue_text: "PUT_text",
          created_by: "PUT",
        })
        .end(function (err, res) {
          const _id = res.body._id;
          chai
            .request(server)
            .put("/api/issues/test_project")
            .send({ _id: _id })
            .end(function (err, res) {
              assert.deepEqual(res.body, {
                error: "no update field(s) sent",
                _id: _id,
              });
            });
          done();
        });
    });

    test("Update an issue with an invalid _id: PUT request to /api/issues/{project}", function (done) {
      chai
        .request(server)
        .put("/api/issues/test_project")
        .send({ _id: "some_invalid_id", open: false })
        .end(function (err, res) {
          assert.deepEqual(res.body, {
            error: "could not update",
            _id: "some_invalid_id",
          });
          done();
        });
    });
  });
  suite("DELETE", function () {
    test("Delete an issue: DELETE request to /api/issues/{project}", function (done) {
      chai
        .request(server)
        .post("/api/issues/test_project")
        .send({
          issue_title: "Delete",
          issue_text: "Delete text",
          created_by: "DELETE",
        })
        .end(function (err, res) {
          const _id = res.body._id;
          chai
            .request(server)
            .delete("/api/issues/test_project")
            .send({ _id: _id })
            .end(function (err, res) {
              assert.deepEqual(res.body, {
                result: "successfully deleted",
                _id: _id,
              });
              done();
            });
        });
    });

    test("Delete an issue with an invalid _id: DELETE request to /api/issues/{project}", function (done) {
      chai
        .request(server)
        .delete("/api/issues/test_project")
        .send({ _id: "some_invalid_id" })
        .end(function (err, res) {
          assert.deepEqual(res.body, {
            error: "could not delete",
            _id: "some_invalid_id",
          });
        });
      done();
    });

    test("Delete an issue with missing _id: DELETE request to /api/issues/{project}", function (done) {
      chai
        .request(server)
        .delete("/api/issues/test_project")
        .send({})
        .end(function (err, res) {
          assert.deepEqual(res.body, {error: "missing _id"})
        });
      done();
    });
  });
});
