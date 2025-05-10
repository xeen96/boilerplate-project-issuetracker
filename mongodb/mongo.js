"use strict";
const mongoose = require("mongoose");
const { IssueModel, ProjectModel } = require("./schemas");
require("dotenv").config();

async function connectToDb() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");
    return true;
  } catch (err) {
    console.error("Failed to connect to MongoDB", err);
    process.exit(1);
  }
}

async function createProject(project_name) {
  try {
    let project = await findProjectByName(project_name);
    if (!project) {
      project = new ProjectModel({
        project_name: project_name,
      });
      const savedProject = await project.save();
      return savedProject;
    }
    return project;
  } catch (err) {
    throw err;
  }
}

async function findProjectByName(project_name) {
  try {
    let project = await ProjectModel.findOne({ project_name: project_name });
    if (project) {
      return project;
    }
    return null;
  } catch (err) {
    throw err;
  }
}

async function createNewIssue(data, project) {
  try {
    const projectObj = await createProject(project);
    const issue = new IssueModel({
      issue_title: data.issue_title,
      issue_text: data.issue_text,
      created_by: data.created_by,
      assigned_to: data.assigned_to,
      status_text: data.status_text,
      project_id: projectObj._id,
    });
    const savedIssue = await issue.save();
    return savedIssue;
  } catch (err) {
    throw err;
  }
}

async function findIssuesByProjectName(project_name) {
  try {
    const project = await findProjectByName(project_name);
    const issues = await IssueModel.find({ project_id: project._id });
    return issues;
  } catch (err) {
    throw err;
  }
}

async function updateIssue(data) {
  try {
    const { _id, ...params } = data;
    const issue = await IssueModel.findOneAndUpdate({ _id: _id }, params, {
      new: true,
    });
    if (!issue) {
      throw err;
    }
    return issue;

  } catch (err) {
    throw err;
  }
}
async function deleteIssueById(_id) {
  try {
    if (!(await IssueModel.findByIdAndDelete(_id))) {
      throw err;
    }
    return true;
  } catch (err) {
    throw err;
  }
}

module.exports = {
  createNewIssue,
  findIssuesByProjectName,
  findProjectByName,
  updateIssue,
  connectToDb,
  deleteIssueById,
};
