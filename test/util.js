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

// return an array of elements which are in a1 but not in a2
const diffArray = (a1, a2) => {
  const a2hash = a2.reduce((p,c) => (p[c] = true) && p,{})
  let uniques = [];
  for (let a of a1)
    if (!a2hash[a]) uniques.push(a)
  return uniques;
}

module.exports = { flatArgs, diffArray }