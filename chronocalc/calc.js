const operators = {}
for(const [name, sign, func] of [
 ['not', '~', a=>!a],
 ['add', '+', (a,b)=>a+b],
 ['prepend', ';+', (a,b)=>b+a],
 ['subtract', '-', (a,b)=>a-b],
 ['multiply', '*', (a,b)=>a*b],
 ['divide', '/', (a,b)=>a/b],
 ['power', '^', (a,b)=>a**b],
 ['greater', '>', (a,b)=>a>b],
 ['lesser', '<', (a,b)=>a<b],
])
 operators[name] = {name, affix:sign, func, argcount:2}
affixes = []
signs = {}
for(op in operators) {
 operator = operators[op]
 if(operator.affix) {
  affixes.push(operator.affix)
  signs[operator.affix] = operator
 }
 if(operator.sign)
  signs[operator.sign] = operator
}
affixes[affixes.indexOf('-')] = '()'
function compile(script, toexe=true) {
 let wordStart = 0
 let exe = []
 const names = {}
 const exepush = item => exe.push(item)
 let constpush = value => exepush(['const', value])
 let callpush = _=> exepush(['call'])
 let accesspush = name => exepush(['access', name])
 let assignpush = _=> exepush(['assign'])
 let tmpgetpush = name => exepush(['tmpget', name])
 let tmpsetpush = name => exepush(['tmpset', name])
 let ifpush = coord => exepush(bind(['goifnot', coord]))
 let jumppush = coord => exepush(bind(['jump', coord]))
 //let jumpcmd = coord => ['jump', coord]
 //let ifcmd = coord => ['goifnot', coord]
 let varid = 0
 let bind = obj => {
  obj.bound = obj
  return obj
 }
 if(toexe) {
  bind = (func, obj) => {
   func = func.bind(obj)
   func.bound = obj
   return func
  }
  constpush = value => exepush(env => env.stack.push(value))
  callpush = _=> exepush(env => {
   const func = env.stack.pop()
   const val = func(...env.stack.splice(-func.length, Infinity))
   if(val !== undefined)
    env.stack.push(val)
  })
  accesspush = name => exepush(env => env.stack.push(env.scope[name]))
  assignpush = _=> exepush(env => {
   const name = env.stack.pop()
   env.scope[name] = env.stack.pop()
  })
  ifpush = coord => exepush(bind((function(env) {if(!env.stack.pop()) env.pos += this[1]}), ['goifnot', coord]))
  jumppush = coord => exepush(bind((function(env) {env.pos += this[1]}), ['jump', coord]))
  tmpgetpush = name => exepush(bind((function(env) {env.stack.push(env.stack[this[1]])}), ['tmpget', name]))
  tmpsetpush = name => exepush(bind((function(env) {env.stack[this[1]] = env.stack.pop()}), ['tmpget', name]))
  //jumpcmd = coord => env => env.pos += coord
  //ifcmd = coord => env => {
  // if(!env.stack.pop())
  //  env.pos += coord
  //}
 }
 const tmpreplace = (exe, from, to) => {
  for(let i = exe.length; i --> 0;) {
   const bound = exe[i].bound
   if(!bound) continue
   let name = bound[1]
   let j = name.length
   for(; j --> 0;)
    if(!name.match(/\d/))
     break
   j++
   const num = Number(name.slice(j))
   name = name.slice(0,j)
   if(name == from) {
    if(bound[0] in ['tmpget', 'tmpset']) {
     if(num)
      bound[1] = name + (num-1)
     else
      bound[1] = to
    }
   }
  }
 }
 const subcompile = str => compile(str, toexe)
 const vars = {
  if: (exe, el) => {
   if(el) {
    exe.splice(0,0, ifcmd(exe.length + 1))
    exe.push(jumpcmd(el.length), ...el)
   } else
    exe.splice(0,0, ifcmd(exe.length))
   return exe
  },
  count: (exe, init) => {
   if(init)
    [exe, init] = [init, exe]
   const i = varid++
   exe.push(...subcompile('$i+1=$i'))
   exe.splice(0,0, ...subcompile('$i'))
   exe.push(jumpcmd(-exe.length - 6))
   vars.if(exe)
   exe.splice(0,0, ...subcompile('=$l 0=$i'), ...init, ...subcompile('$i<$l'))
   tmpreplace(exe, 'i', i.toString())
   return exe
  },
 }
 for(const name in operators)
  vars[name] = operators[name].func
 const braces = []
 for(let i = 0; i <= script.length; i++) {
  if(i < script.length && script[i] != ' ')
   continue
  let word = script.slice(wordStart, i)
  const process = word => {
   let opqueue = []
   while(true) {
    const unconditional = brace => {
     if(brace.endjumps) {
      brace.endjumps.push(exe.length)
      jumppush(null)
     } else
      jumppush(brace.start - exe.length -1)
     if(!brace.start)
      brace.start = exe.length
     for(const item of brace.conditionals)
      exe[item].bound[1] = exe.length-item-1
     brace.conditionals = []
    }
    const conditional = brace => {
     brace.conditionals.push(exe.length)
     ifpush(null)
    }
    if(word.at(-1) == '{') {
     const brace = {conditionals:[]}
     if(word.slice(0,-1) == '?') {
      brace.endjumps = []
      brace.conditionals.push(exe.length)
      ifpush(null)
     } else
      brace.start = exe.length
     braces.push(brace)
    } else if(word == '?') {
     conditional(braces.at(-1))
    } else if(word == ',') {
     unconditional(braces.at(-1))
    } else if(word[0] == '}') {
     const lastbrace = braces.pop()
     if(word.slice(1) == '?')
      conditional(lastbrace)
     else
      unconditional(lastbrace)
     for(const item of lastbrace.conditionals)
      exe[item].bound[1] = lastbrace.start-item -1
     for(const item of lastbrace.endjumps || [])
      exe[item].bound[1] = exe.length-item -1
    } else if(word == '()') {
     callpush()
    } else if(word in signs) {
     const op = signs[word]
     constpush(vars[op.name])
     callpush()
    } else {
     const prefixcatch = _=> {
      const finish = affix => {
       if(opqueue.length) {
        opqueue.push(word, affix)
        return true
       }
       opqueue.push(affix)
      }
      for(const affix of affixes)
       if(word.startsWith(affix)) {
        word = word.slice(affix.length)
        return finish(affix)
       }
      if(word[0] == '-') {
       if(word[1] == '-')
        word = word.slice(1)
       else if(word[1] == '+')
        word = word.slice(2)
       else
        return
       return finish('-')
      }
     }
     if(!prefixcatch()) {
      let imin = Infinity, amin
      for(const affix of [...affixes, '-', '=']) {
       const i = word.slice(1).indexOf(affix) +1
       if(i && i < imin) {
        imin = i
        amin = affix
       }
      }
      if(amin && (word[imin-1] != '_')) {
       if(imin + amin.length < word.length && amin != '=')
        opqueue.push(word.slice(imin+amin.length), amin)
       else
        opqueue.push(word.slice(imin))
       word = word.slice(0, imin)
      }
      const num = Number(word)
      if(!isNaN(num))
       constpush(num)
      else {
       console.log(word)
       let assign = false
       if(word[0] == '=') {
        word = word.slice(1)
        assign = true
       }
       if(word[0] == '_' && word.length < 3)
        word = names[word[1]]
       else
        names[opqueue[0]] = word
       if(assign) {
        constpush(word)
        assignpush()
       } else
        accesspush(word)
      }
     }
    }
    if(opqueue.length)
     word = opqueue.shift()
    else
     break
   }
  }
  if(word.length == 0);
  else if(word.includes('"')) {
   const index = word.indexOf('"')
   for(i = wordStart + index+1; i < script.length; i++)
    if(script[i] == '"')
     break
   if(i == script.length)
    throw 'unclosed quote'
   constpush(script.slice(wordStart + index+1, i++))
   if(index)
    process(word.slice(0, index))
  } else
   process(word)
  wordStart = i+1
 }
 if(braces.length)
  throw 'unclosed brace'
 return exe
}
function execute(exe, stack=[], scope={}) {
 const env = {stack, scope, pos:0}
 for(; env.pos < exe.length;) {
  console.log(env.pos)
  const func = exe[env.pos++]
  func(env)
  console.log(env.stack, env.pos)
 }
}
