'use client'
import Generator from './generator'
import { useState, useCallback } from 'react'
import Favicon from './favicon.svg'

// Generates dumb random password
class RandomOptions { count:number; type:number }
function generateChars(opt:RandomOptions) {
  const alphabet = alphabets[opt.type].str
  return Array.from({length:Math.ceil(opt.count / Math.log2(alphabet.length))}, (_,item) => alphabet[Math.floor(Math.random() * alphabet.length)]).join("")
}
const alphabets = [[26, 'Lowercase'], [52, 'Alphabetic'], [62, 'Alphanumeric'], [96, 'Random']].map(item => ({name:item[1], str:'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890`~!@#$%^&*()_+-=[]\\{};\':",./<>? '.slice(0, item[0])}))

// Monitors the `Generator` component and render a dumb password example when a passphrase is generated
export default function Home() {
  const [RndOpt, setRndOpt] = useState<RandomOptions>({count:0, type:0})
  function nextType() {
    setRndOpt(item => ({...item, type:(item.type+1) %alphabets.length}))
  }
  return (<>
    <h1 className="text-4xl mx-auto my-6 text-logo">
      <Favicon className="inline h-7 mb-[0.3rem] mr-[0.1rem] w-[unset] fill-logo" viewBox="0 0 512 512"/>
      umb Passphrase&nbsp;Maker
    </h1>
    <Generator className='mx-auto' onGenerate={
      useCallback((_:any, count:number) => setRndOpt(item => ({...item, count})), [])
    }/>
    <div className={(RndOpt.count ? "opacity-100" : "opacity-0") + " w-full max-w-xl mx-auto my-6 transition-opacity duration-1000"}>
      <h2 className="text-xl w-fit px-2 bg-secondary shadow-lg rounded-t-lg text-white">
        Equivalent<button className="btn-minor btn-white" onClick={nextType}>{alphabets[RndOpt.type].name}</button>Password
      </h2>
      <input className="w-full p-2 rounded-tl-none myshadow text-3xl" key={RndOpt} defaultValue={generateChars(RndOpt)}/>
      <div className="footnote">Seriously, try memorizing this random password. It will take you way longer than the passphrase!</div>
    </div>
  </>);
}
