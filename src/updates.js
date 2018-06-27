const { join } = require("path");
const { exec } = require("child_process")
const { writeFile, readFile } = require("fs")

const updatePackage = (src, dest, n, d, a, t, cb) => {
  const pkg = require(join(src,"package.json"))
  pkg.name = n
  pkg.description = d
  pkg.author = a
  pkg._title = t
  const getOS = 'process.stdout.write(os.type().toLowerCase())'
  exec(`node -v && npm -v && node -e "${getOS}"`, (err, val) => {
    if (err) return cb(err);
    val = val.split("\n")
    pkg.os = val[2] === "darwin" ? [val[2], "linux"] : [val[2]]
    pkg.engines = {
      node: `^${val[0].slice(1)}`,
      npm: `^${val[1]}`
    }
    const newPkg = `${JSON.stringify(pkg, null, 2)}\n`
    writeFile(join(dest, "package.json"), newPkg, cb)
  })
}

const updateLicense = (dest, n, a, cb) => {
  const loc = join(dest, "LICENSE.md")
  // race condition here is ok for this use case
  readFile(loc, (err, data) => {
    if (err) return cb(err);
    const year = new Date().getFullYear()
    data = data.toString().replace("[year]", year)
    if (a) data = data.replace("[author]", a)
    writeFile(loc, data, cb)
  })
}

const updateReadme = (dest, n, d, cb) => {
  const desc = d ? `\n${d}\n\n` : "";
  writeFile(join(dest, "README.md"), `# ${n}\n${desc}---\n`, cb)
}

const updateIndex = (dest, n, cb) => {
  writeFile(join(dest, "src", "index.js"), `console.log("Hello from ${n}!")\n`, cb)
}

module.exports = { updatePackage, updateLicense, updateReadme, updateIndex }
