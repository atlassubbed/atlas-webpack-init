#!/usr/bin/env node
const { getArgs, build, createRepo, commit } = require("./helpers")
const { join } = require("path")
const { exit } = require("./util")
const { setIdentity, parseAuthor } = require("atlas-git-identity")
// get args then build starter-app


getArgs([
  {name: "n", desc: "Enter npm package name"},
  {name: "d", desc: "Enter npm package description"},
  {name: "a", desc: "Enter npm package author"},
  {name: "t", desc: "Enter index.html title"},
], (err, args) => {
  if (err) throw err;
  // default app name if not provided
  args.n = args.n || "webpack-app"
  const dest = join(process.cwd(), args.n)
  build(args, dest, errs => {
    if (errs.length) {
      errs.forEach(err => console.log(err));
      throw errs[0]
    }
    createRepo(dest, err => {
      if (err) throw err;
      const author = parseAuthor(args.a);
      if (!author) return exit(0);
      setIdentity(author, dest, err => {
        if (err) throw err;
        commit(dest, err => {
          if (err) throw err;
          exit(0)
        })
      })
    })
  })
})
