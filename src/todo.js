let R = require("ramda")
let reсentDBFile = "./todo.json"
let archiveDBFile = "./archive.json"
let FS = require("fs-extra")

//commands

let forEachI = R.addIndex(R.forEach)

let commands = {}

let writeFileX = R.curry((dbFile, todo) => {
  let str = typeof todo == "string" ? todo : JSON.stringify(todo, null, 2)
  FS.outputFileSync(dbFile, str, "utf-8")
})

let logLine = (todo, i) => {
  console.log(
    todo.done == false ? `[ ] ${i + 1}. ${todo.text}` :
    todo.done == true  ? `[x] ${i + 1}. ${todo.text}` :
                              `` // ignore archived todos
  )
}
let logRecent = forEachI(logLine)

let logLineArchive = (todo, i) => {
  console.log(
    todo.done == true ? `[#] ${i + 1}. ${todo.text}` : ``
  )
}
let logArchive = forEachI(logLineArchive)

let loadReсent = () => require(recentDBFile)
let saveReсent = (todos) => {writeFileX(recentDBFile, todos); logAll(todos) }
let loadArchive = () => require(archiveDBFile)
let saveArchive = (todos) => {writeFileArchive(archiveDBFile, todos); logArchive(todos) }

commands.init = function () {
  writeFileX(recentDBFile, [])
  writeFileX(archiveDBFile, [])
  console.log("Ready to work!")
}

commands.list = function () {
  let recentTodos = loadRecent()
  logAll(recentTodos)
}

commands.add = function (text) {
  let recentTodos = loadRecent()
  let recentTodos2 = R.append({text, "done": false}, recentTodos)
  save(recentTodos2)
}

commands.delete = function (index) {
  let recentTodos = loadRecent()
  let recentTodos2 = R.remove(index, 1, recentTodos)
  save(recentTodos2)
}

commands.done = function (index) {
  let recentTodos = loadRecent()
  let recentTodos2 = R.update(index, R.assoc("done", true, recentTodos[index]), recentTodos)
  save(recentTodos2)
}

commands.archive = function () {
  let recentTodos = loadRecent()
  let archiveTodos = loadArchive()
  let recentTodos2 = R.reject(R.prop("done"), recentTodos)
  let archiveTodos2 = R.concat(R.filter(R.prop("done"), recentTodos), archiveTodos)
  saveRecent(recentTodos2)
  saveArchive(archiveTodos2)
}

//command manager

let operation = process.argv[2]

switch (operation) {
  case "init":
    return commands.init()
  case "add":
    let text = process.argv[3]
    return commands.add(text)
  case "list":
    return commands.list()
  case "delete":
    let deleteIndex = Number(process.argv[3]) - 1
    return commands.delete(deleteIndex)
  case "done":
    let doneIndex = Number(process.argv[3]) - 1
    return commands.done(doneIndex)
  case "archive":
    return commands.archive()
  default:
    throw Error(`unsupported operation ${operation}`)
}
