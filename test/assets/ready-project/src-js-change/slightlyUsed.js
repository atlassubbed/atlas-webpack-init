const square = x => x*x

const sine = x => Math.sin(x)

class Life {
  constructor(kind){
    this.kind = kind
    this.life = 10
  }
  health(){
    return this.life
  }
  sick(amount){
    amount = amount || .05
    this.life = Math.max(0, this.life - amount)
  }
}

class Mammal extends Life {
  constructor(name){
    super("mammal")
    this.name = name
  }
  shout(){
    console.log("rawr!")
    // health increased!
    this.sick(-.05)
  }
}

export { square, sine, Life }