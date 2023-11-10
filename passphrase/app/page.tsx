'use client'
import Generator from './generator'
import { useState, useCallback } from 'react'
import Favicon from './favicon.svg'

// Generates dumb random password
const generateChars = (bitcount:number) => Array.from({length:Math.ceil(bitcount / charEntropy)}, (_,item) => randomChars[Math.floor(Math.random() * randomChars.length)]).join("")
const randomChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890`~!@#$%^&*()_+-=[]\\{};\':",./<>? '
const charEntropy = Math.log2(randomChars.length)

// Monitors the `Generator` component and render a dumb password example when a passphrase is generated
export default function Home() {
  const [example, setexample] = useState<string>("")
  return (<>
    <h1 className="text-4xl mx-auto my-6 text-logo">
      <Favicon className="inline h-7 mb-[0.3rem] mr-[0.1rem] w-[unset] fill-logo" viewBox="0 0 512 512"/>umb Passphrase
    </h1>
    <Generator className='mx-auto' onGenerate={
      useCallback((_:any, count:number) => setexample(generateChars(count)), [])
    }/>
    <div className={(example.length ? "opacity-100" : "opacity-0") + " w-full max-w-xl mx-auto my-6 transition-opacity duration-1000"}>
      <h2 className="text-xl w-fit p-2 bg-secondary shadow-lg rounded-t-lg text-white">
        Equivalent Random Password
      </h2>
      <input className="w-full p-2 rounded-tl-none myshadow text-3xl" key={example} defaultValue={example}/>
      <div className="footnote">Seriously, try memorizing this random password. It will take you way longer than the passphrase!</div>
    </div>
  </>);
}
