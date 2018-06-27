const { describe, it } = require("mocha")
const { expect } = require("chai")
const { join } = require("path")
const { exec } = require("child_process")
const Shell = require("atlas-interactive-shell")
const parallel = require("atlas-parallel")
const { readFile, readdir } = require("fs")
const { build, tempDir, buildAndRead, buildAndCheck, buildAndRun, readZip } = require("./helpers")
const { diffArray } = require("./util")
const { 
  getLicense, 
  getPrompt, 
  sources, 
  filenames, 
  minifiedFiles, 
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
      const getOS = "process.stdout.write(os.type().toLowerCase())"
      exec(`node -v && npm -v && node -e "${getOS}"`, (err, val) => {
        if (err) return done(err);
        val = val.split("\n");
        expect(data.engines).to.be.an("object")
        expect(data.os).to.be.an("array")
        expect(data.engines.node).to.equal(`^${val[0].slice(1)}`)
        expect(data.engines.npm).equal(`^${val[1]}`)
        expect(data.os).to.deep.equal(val[2]==="darwin"?[val[2],"linux"]:[val[2]])
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

describe("production build for generated app", function(){
  const cwd = join(assets, "ready-project")
  // build all apps and establish prod/dist output
  before(function(done){
    this.timeout(120e3)
    console.log("    (building apps ~ 30s...)")
    exec("npm install", {cwd}, err => {
      if (err) return done(err);
      parallel(sources.map(name => done2 => {
        const entry = `./${name}/index.js`
        const out = `./dist-${name}`
        const bin = "./node_modules/.bin/webpack"
        const conf = "webpack.prod.js"
        const buildCmd = `rm -rf '${out}' && ${bin} '${entry}' --output-path='${out}' --config ${conf}`
        exec(buildCmd, {cwd}, done2)
      }), errs => {
        // eh, this is fine
        done(errs.length && errs[0])
      })
    })
  })
  describe("transpiling, minifying and gzipping separate runtimes", function(){
    ["app", "webpack", "vendor"].forEach(type => {
      it(`should build a correctly transpiled, min-gzipped js file for ${type}'s runtime`, function(done){
        readZip(join(cwd, "dist-src", filenames.js[type]), (err, data) => {
          if (err) return done(err);
          expect(data).to.equal(minifiedFiles.js[type])
          done()
        })
      })
    })
  })
  describe("gzipping only when it is worth it", function(){
    it("should build a correctly minified (not gzipped) merged stylesheet for small app", function(done){
      readFile(join(cwd, "dist-src", filenames.css.small), (err, data) => {
        if (err) return done(err);
        expect(data.toString()).to.equal(minifiedFiles.css.small)
        done()
      })
    })
    it("should build a correctly min-gzipped merged stylesheet for large app", function(done){
      readZip(join(cwd, "dist-src-large", filenames.css.large), (err, data) => {
        if (err) return done(err);
        expect(data).to.equal(minifiedFiles.css.large)
        done()
      })
    })
    it("should build a correctly min-gzipped index.html", function(done){
      readZip(join(cwd, "dist-src", filenames.html.index), (err, data) => {
        if (err) return done(err);
        expect(data).to.equal(minifiedFiles.html.index)
        done()
      })
    })
  })
  describe("caching assets for long-term usage", function(){
    const { js, css, html } = filenames
    const originalFilenames = [js.app, js.vendor, js.webpack, html.index, css.small]
    it("should change the name of only the app's runtime file if a js file changes", function(done){
      readdir(join(cwd, "dist-src-js-change"), (err, files) => {
        if (err) return done(err);
        expect(files.length).to.equal(originalFilenames.length)
        const diff = diffArray(files, originalFilenames);
        expect(diff.length).to.equal(1)
        expect(diff[0]).to.equal(js.delta)
        done()
      })
    })
    it("should not change any filename if only the html file changes", function(done){
      readdir(join(cwd, "dist-src-html-change"), (err, files) => {
        if (err) return done(err);
        expect(files.length).to.equal(originalFilenames.length)
        const diff = diffArray(files, originalFilenames);
        expect(diff.length).to.equal(0)
        done()
      })
    })
    it("should change the name of only the merged css file if a stylesheet changes", function(done){
      readdir(join(cwd, "dist-src-css-change"), (err, files) => {
        if (err) return done(err);
        expect(files.length).to.equal(originalFilenames.length)
        const diff = diffArray(files, originalFilenames);
        expect(diff.length).to.equal(1)
        expect(diff[0]).to.equal(css.delta)
        done()
      })
    })
  })
})



