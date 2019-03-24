const { describe, it } = require("mocha")
const { expect } = require("chai")
const { join } = require("path")
const { exec } = require("child_process")
const Shell = require("atlas-interactive-shell")
const { build, tempDir, buildAndRead, buildAndCheck, buildAndRun } = require("./helpers")
const { 
  getLicense, 
  getPrompt, 
  getGitIgnore } = require("./assets/assets")

const assets = join(__dirname, "assets")

describe("starter app generator", function(){
  it("should create a named project in the dest folder", function(done){
    const n = "my-project"
    buildAndCheck({n}, n, (err, info) => {
      if (err) return done(err);
      expect(info.isDirectory()).to.be.true;
      done()
    })
  })
  it("should create a nameless project in the dest folder", function(done){
    buildAndCheck({d: "my desc"}, "webpack-app", (err, info) => {
      if (err) return done(err);
      expect(info.isDirectory()).to.be.true;
      done()
    })
  })
  it("should not override an existing project in the dest folder", function(done){
    const n = "existing-project"
    build(assets, {n}, (err, path) => {
      expect(err).to.be.an('error')
      done()
    })
  })
  it("should initialize a git repository in the project", function(done){
    const n = "my-project", a = "atlassubbed <atlassubbed@gmail.com>"
    buildAndCheck({n, a}, join(n, ".git"), (err, info) => {
      if (err) return done(err);
      expect(info.isDirectory()).to.be.true;
      done();
    })
  })
  it("should make an initial commit in the project if author has name and email", function(done){
    const n = "my-project", a = "atlassubbed <atlassubbed@gmail.com>"
    buildAndRun({n, a}, "git log", (err, out) => {
      if (err) return done(err);
      expect(out).to.have.string("Adds boilerplate src/test files, prod/dev scripts, configs, etc. Commit made by atlas-webpack-init, an npm starter-app generator.")
      done()
    })
  })
  it("should not make an initial commit in the project if author is incomplete", function(done){
    const n = "my-project", a = "atlassubbed"
    buildAndRun({n, a}, "git log", (err, out) => {
      expect(err).to.be.an('error')
      expect(err.message).to.have.string("does not have any commits yet")
      done()
    })
  })
  it("should not make an initial commit in the project if there is no author", function(done){
    const n = "my-project"
    buildAndRun({n}, "git log", (err, out) => {
      expect(err).to.be.an('error')
      expect(err.message).to.have.string("does not have any commits yet")
      done()
    })
  })
  it("should correctly create a .gitignore in a named project", function(done){
    const n = "my-project"
    buildAndRead({n}, join(n, ".gitignore"), (err, data) => {
      if (err) return done(err);
      expect(data).to.equal(getGitIgnore());
      done()
    })
  })
  it("should correctly create a .gitignore in a nameless project", function(done){
    const d = "my description", n = "webpack-app"
    buildAndRead({d}, join(n, ".gitignore"), (err, data) => {
      if (err) return done(err);
      expect(data).to.equal(getGitIgnore());
      done()
    })
  })
  it("should create the correct default readme in a named project", function(done){
    const n = "my-project"
    buildAndRead({n}, join(n, "README.md"), (err, data) => {
      if (err) return done(err);
      expect(data).to.equal(`# ${n}\n---\n`);
      done()
    })
  })
  it("should create the correct default readme in a named project with a description", function(done){
    const n = "my-project", d = "my description!"
    buildAndRead({n, d}, join(n, "README.md"), (err, data) => {
      if (err) return done(err);
      expect(data).to.equal(`# ${n}\n\n${d}\n\n---\n`);
      done()
    })
  })
  it("should create the correct default readme in a nameless project", function(done){
    const n = "webpack-app"
    buildAndRead({n}, join(n, "README.md"), (err, data) => {
      if (err) return done(err);
      expect(data).to.equal(`# ${n}\n---\n`);
      done()
    })
  })
  it("should create the correct default readme in a nameless project with a description", function(done){
    const n = "webpack-app", d = "my description!"
    buildAndRead({d}, join(n, "README.md"), (err, data) => {
      if (err) return done(err);
      expect(data).to.equal(`# ${n}\n\n${d}\n\n---\n`);
      done()
    })
  })
  it("should create the correct default license in an authored project", function(done){
    const n = "my-project", a = "atlassubbed", y = new Date().getFullYear()
    buildAndRead({n, a}, join(n, "LICENSE.md"), (err, data) => {
      if (err) return done(err);
      expect(data).to.equal(getLicense(y,a));
      done()
    })
  })
  it("should create the correct default license in an authorless project", function(done){
    const n = "my-project", y = new Date().getFullYear()
    buildAndRead({n}, join(n, "LICENSE.md"), (err, data) => {
      if (err) return done(err);
      expect(data).to.equal(getLicense(y,"[author]"));
      done()
    })
  })
  it("should create the correct default index.js in a named project", function(done){
    const n = "my-project"
    buildAndRead({n}, join(n, "src", "index.js"), (err, data) => {
      if (err) return done(err);
      expect(data).to.equal(`console.log("Hello from ${n}!")\n`);
      done()
    })
  })
  it("should create the correct default index.js in a nameless project", function(done){
    const n = "webpack-app"
    buildAndRead({d: "my desc"}, join(n, "src", "index.js"), (err, data) => {
      if (err) return done(err);
      expect(data.toString()).to.equal(`console.log("Hello from ${n}!")\n`);
      done()
    })
  })
  it("should keep a new line at the end of package.json", function(done){
    const n = "my-project"
    buildAndRead({n}, join(n, "package.json"), (err, data) => {
      if (err) return done(err);
      expect(data[data.length-1]).to.equal(`\n`);
      done()
    })
  })
  it("should populate the project's package.json correctly", function(done){
    const n = "my-project", d = "my desc", a = "atlassubbed", t = "My Title!"
    buildAndRead({n,d,a,t}, join(n, "package.json"), (err, data) => {
      if (err) return done(err);
      data = JSON.parse(data)
      expect(data.name).to.equal(n)
      expect(data.description).to.equal(d)
      expect(data.author).to.equal(a)
      expect(data._title).to.equal(t)
      exec(`node -v && npm -v`, (err, val) => {
        if (err) return done(err);
        val = val.split("\n");
        expect(data.engines).to.be.an("object")
        expect(data.engines.node).to.equal(`^${val[0].slice(1)}`)
        expect(data.engines.npm).equal(`^${val[1]}`)
        done();
      })
    })
  })
  it("should not populate missing fields in the package.json", function(done){
    const n = "my-project", empty = ""
    buildAndRead({n}, join(n, "package.json"), (err, data) => {
      if (err) return done(err);
      data = JSON.parse(data)
      expect(data.name).to.equal(n)
      expect(data.description).to.equal(empty)
      expect(data.author).to.equal(empty)
      expect(data._title).to.equal(empty)
      done()
    })
  })
  it("should not prompt the developer for input if any flags are used", function(done){
    tempDir((err, bin, cwd) => {
      if (err) return done(err);
      let numPrompts = 0;
      new Shell(`node ${bin} -a atlassubbed`, {cwd}).onData((err, data, reply) => {
        if (err) return reply(new Error(err));
        numPrompts++;
      }).onDone(err => {
        if (err) return done(err);
        expect(numPrompts).to.equal(0);
        done();
      })
    })
  })
  it("should prompt the developer for each input if no flags are used", function(done){
    tempDir((err, bin, cwd) => {
      if (err) return done(err);
      let numPrompts = 0;
      new Shell("node " + bin, {cwd}).onData((err, data, reply) => {
        if (err) return reply(new Error(err));
        const expectedPrompt = getPrompt(numPrompts++)
        expect(data).to.have.string(expectedPrompt)
        reply("some-answer\n")
      }).onDone(err => {
        if (err) return done(err);
        expect(numPrompts).to.equal(4);
        done();
      })
    })
  })
})
