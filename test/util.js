// if CLI arg value has spaces, wrap in quotes
const wrap = val => {
  const del = val.indexOf(" ") > -1 ? '"' : ""
  return `${del}${val}${del}`
}

// turn args obj into string
const flatArgs = args => {
  let flags = ""
  for (let arg in args){
    const val = args[arg]
    if (!val) continue;
    flags += ` -${arg} ${wrap(val)}`
  }
  return flags;
}

module.exports = { flatArgs }