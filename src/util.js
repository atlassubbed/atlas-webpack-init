// make new prompt option
const opt = description => ({
  required: false,
  type: "string",
  description
})

const contains = (arr, el) => arr.indexOf(el) > -1

// filter disallowed keys from obj
const project = (parsedArgs, allowedArgs) => {
  const projectedArgs = {}
  for (let arg in parsedArgs)
    if (contains(allowedArgs, arg))
      projectedArgs[arg] = parsedArgs[arg]
  return projectedArgs
}

// true if obj has any non-trivial key
const hasFlag = parsedArgs => {
  for (let arg in parsedArgs)
    if (parsedArgs[arg]) return true
  return false
}

const exit = code => process.exit(code)

module.exports = { opt, contains, project, hasFlag, exit }
