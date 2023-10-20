import { useEffect, useRef, useState } from "react"
import './app.css'
import { Frame } from "./components/frame"

function App() {
  const [newInput, setNewInput] = useState(`Although the modern Western worldview is built on their division, nature and culture are interconnected. Culture is a complex and dynamic process of interaction and co-evolution between humans and other species, as well as technologies and environments. Thus, as seen with climate change, technology and nature are historically interconnected and should be viewed as part of the ecological niche within which the human animal lives.`)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setTimeout(() => setLoading(false), 10000)
  }, [])

  const audioRef = useRef(null)

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = .04
      audioRef.current.playbackRate = .6
      audioRef.current.play()
    }
  }, [])

  return (
    <>
      <div className="container">
        {loading &&
          <div className="first-frame">
            <h1>Intertwined Landscapes, 2023</h1>
            <p>{newInput}</p>
            <p><br /><br />[residency synopsis]<br />CADA</p>
            <p><br />[sound]<br />valt​​​Ü​​​ü​​​d by Catarina Arbusto</p>
          </div>
        }
        <Frame initialInput={newInput} getInput={setNewInput} />
      </div>
      <audio ref={audioRef} src="/3626487201.mp3" />
    </>
  )
}

export default App
