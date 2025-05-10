const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const IssueSchema = new Schema({
  issue_title: {
    type: String,
    required: true,
  },
  issue_text: {
    type: String,
    required: true,
  },
  created_on: {
    type: String,
    default: new Date().toJSON(),
  },
  updated_on: {
    type: String,
    default: new Date().toJSON(),
  },
  created_by: String,
  assigned_to: {
    type: String,
    default: "",
  },
  open: {
    type: Boolean,
    default: true,
  },
  status_text: {
    type: String,
    default: "",
  },
  project_id: {
    type: Schema.Types.ObjectId,
    ref: "ProjectModel",
  },
});
const IssueModel = mongoose.model("IssueModel", IssueSchema);

const ProjectSchema = new Schema({
  project_name: {
    type: String,
    required: true,
    uniquie: true,
  },
});
const ProjectModel = mongoose.model("ProjectModel", ProjectSchema);

module.exports = {
  IssueModel,
  ProjectModel,
};
