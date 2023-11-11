import { ClipboardIcon, ArrowUturnLeftIcon } from '@heroicons/react/24/outline'
import { makePassphrase } from './passphrase' // The passphrase generating algorithm
import { useState, useRef, useEffect } from 'react'

// Handles the passphrase generating form
export default function Generator({className, onGenerate=_=>{}}: {className:string, onGenerate?: (txt:string, bitCount:number) => void}) {

  // The `Passphrase` state does not control the text in the passphrase input, as users are allowed to edit it
  const [Passphrase, setPassphrase] = useState('')
  // Instead, use the submit event of the form to retrieve the passphrase
  const submit = (e:any) => {
    e.preventDefault()
    navigator.clipboard.writeText(new FormData(e.target).get('text')?.toString() || '').then(_=>
      //@ts-ignore we want a loud error when the copy popup fail to trigger
      replay(copyRef.current.getAnimations()[0])
    )
  }
  const replay = (anim:Animation) => {anim.finish(); anim.play()}
  const copyRef = useRef<HTMLDivElement>(null)

  // We don't directly control `BitCount` either
  const defaultBitCount = 64
  const [BitCount, setBitCount] = useState(defaultBitCount)

  // Use the reset event of the form to access the passphrase and bitCount, then generate the new passphrase
  const reset = (e:any) => {
    const data = new FormData(e.target)
    const bitCount = Number(data.get('bitCount')) || defaultBitCount
    const Passphrase = makePassphrase(bitCount)
    // These updates will rerender the component to the new values
    setPassphrase(Passphrase)
    setBitCount(bitCount)
    // Resize the textarea to fit the new passphrase
    const elem = textareaRef.current
    if(elem) {
      elem.value = Passphrase
      elem.style.height = ""
      elem.style.height = elem.scrollHeight + 'px'
    }
    onGenerate(Passphrase, bitCount)
  }
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  return (
    <form onSubmit={submit} onReset={reset}>
      <div className={className + " rounded-lg text-lg grid grid-cols-[1fr_3em_3em] max-w-xl"}>
        <textarea ref={textareaRef} name='text' spellCheck="false" defaultValue={Passphrase} className="transition-[height] ease-linear h-12 rounded-br-none p-2 col-span-3 myshadow"/>
        <Controls bitCount={BitCount}/>
        <button className="rounded-none rounded-bl-lg btn-primary" disabled={Passphrase.length == 0}>
          <ClipboardIcon className="icon"/>
          <div ref={copyRef} className="tooltip -ml-1">Copied</div>
        </button>
        <button type="reset" className="rounded-none rounded-br-lg btn-primary shadow-lg"><ArrowUturnLeftIcon className="icon"/></button>
      </div>
    </form>
  )
}

// Renders the strength (aka. bitCount) label and controls, allows users to switch between text input and slider
function Controls({bitCount:oldBitCount}: {bitCount:number}) {
  const [Slider, setSlider] = useState(true)

  // We don't have an onBitCountChange callback because the parent can access bitCount when the form is submitted
  const [BitCount, setBitCount] = useState(oldBitCount)
  useEffect(()=>setBitCount(oldBitCount), [oldBitCount]) // Parent can still force a change of bitCount

  // We should show both controls if there is enough space
  const [ShowBoth, setShowBoth] = useState(false)
  const parentRef = useRef<HTMLDivElement>(null)
  useEffect(()=> {
    function sizeUpdate() { // `ShowBoth` updater
      const parent = parentRef.current
      if(parent) {
        const {width} = parent.getBoundingClientRect()
        setShowBoth(width / (parseFloat(getComputedStyle(parent).fontSize) || 16) > 20)
      }
    }
    window.addEventListener('resize', sizeUpdate)
    sizeUpdate()
    return ()=> window.removeEventListener('resize', sizeUpdate)
  }, [])

  return (
    <div className="flex flex-row gap-2 pr-4" ref={parentRef} title="AES encryption keys are equivalent to strength 128-256">
      <button className="btn-minor text-black/70" type="button" disabled={ShowBoth} onClick={_=>setSlider(a=>!a)}>Strength</button>
      <input type="number" name="bitCount" value={BitCount} onChange={(e:any) => setBitCount(e.target.value)} className={(ShowBoth ? "" : Slider ? "hidden " : "w-full ") + "my-auto txt-minor"} size={2}/>
      <input type="range" name="bitCount" min="0" max="1" step="0.001" className={"my-auto" + (Slider || ShowBoth ? "" : " hidden")}
        // Use log scale to suggest that passwords with strength over 100 are overkill
        onChange={(e:any) => setBitCount(Math.round(2**(e.target.value*4 + 4)))} value={(Math.log2(BitCount)-4)/4}
      />
    </div>
  )
}
