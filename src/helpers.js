const parseArgs = require("minimist")
const prompt = require("prompt")
const { readdir } = require("fs")
const { join } = require("path")
const { exec } = require("child_process")
const { opt, project, hasFlag, contains } = require("./util")
const parallel = require("atlas-parallel")
const { 
  updatePackage, 
  updateLicense, 
  updateReadme, 
  updateIndex,
  createGitIgnore
} = require("./updates")

// get args either from CLI flags or via prompt
const getArgs = (argDefs, cb) => {
  const flagNames = argDefs.map(d => d.name),
    flagDefaults = argDefs.reduce((p,c) => (p[c.name]="")||p, {}),
    argv = process.argv.slice(2),
    parsedArgs = parseArgs(argv, {string: flagNames, default: flagDefaults}),
    projectedArgs = project(parsedArgs, flagNames),
    shouldSkipPrompt = hasFlag(projectedArgs)

  // if any CLI flags are used, assume skip prompt
  if (shouldSkipPrompt) return cb(null, projectedArgs);

  // otherwise, prompt user for args
  const opts = {
    properties: argDefs.reduce((p,c) => (p[c.name]=opt(c.desc))&&p, {})
  }
  prompt.message = "";
  prompt.get(opts, (err, args) => cb(err || null, args))
}

const build = ({n, d, a, t}, dest, cb) => {
  const src = join(__dirname, "../assets", "starter-app")
  // race condition here is ok for this use case
  readdir(process.cwd(), (err, files) => {
    if (err || contains(files, n)) 
      return cb([err || new Error(`${n} already exists.`)]);
    exec(`cp -r ${src} ${dest}`, err => {
      if (err) return cb([err]);
      parallel([
        done => createGitIgnore(dest, done),
        done => updatePackage(src, dest, n, d, a, t, done),
        done => updateLicense(dest, n, a, done),
        done => updateReadme(dest, n, d, done),
        done => updateIndex(dest, n, done)
      ], cb)
    })
  })
}

const createRepo = (cwd, cb) => exec(`git init`, {cwd}, cb)

const commit = (cwd, cb) => {
  const msg = "Adds boilerplate src/test files, prod/dev scripts, configs, etc. Commit made by atlas-webpack-init, an npm starter-app generator."
  exec(`git add -A && git commit -am '${msg}'`, {cwd}, cb)
}

module.exports = { getArgs, build, createRepo, commit }
