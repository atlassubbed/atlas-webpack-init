import { Life, sine } from "./slightlyUsed"
import { h, render, Component } from "preact"

import "./styles.css"
import "./moreStyles.css"
import "./redundantStyles.css"

console.log("Hello from ready-project!")

console.log("using preact's hyperscript", h)

const organism = new Life("reptile")

const printHealth = () => console.log(`Our reptile has ${organism.health()} health`)

printHealth()

while (organism.health() > 0){
  console.log("He got sick :(")
  organism.sick()
  printHealth()
}

console.log("oh no")

console.log(`The sine of PI better be ${sine(Math.PI)}... what!?`)