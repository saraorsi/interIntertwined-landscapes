import { useEffect, useState } from "react"
import OpenAI from "openai"
import './frame.css'

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY
const openai = new OpenAI({
    apiKey: OPENAI_API_KEY,
    dangerouslyAllowBrowser: true
})

export function Frame({ initialInput, getInput }) {
    const [imageURL, setImageURL] = useState([])
    const [description, setDescription] = useState('')
    const [reading, setReading] = useState(false)
    const [state, setState] = useState('')
    const [count, setCount] = useState(0)

    const speakDescription = (desc) => {
        if ('speechSynthesis' in window) {
            const voices = window.speechSynthesis.getVoices()[10]
            const utterance = new SpeechSynthesisUtterance()
            utterance.text = desc
            utterance.rate = 0.7
            utterance.pitch = 1
            utterance.voice = voices
            utterance.onstart = () => {
                setReading(true)
            }
            utterance.onend = () => {
                setReading(false)
                if (count === 10) {
                    setTimeout(() => window.location.reload(), 10000)
                } else {
                    getInput(desc)
                }
            }
            window.speechSynthesis.speak(utterance)
        } else {
            console.log("Your browser does not support speech synthesis.")
        }
    }

    useEffect(() => {
        let isCancelled = false
        let retryCount = 0

        const fetchDescription = async () => {
            try {
                setState('generating prompt')
                const descResponse = await openai.completions.create({
                    model: "gpt-3.5-turbo-instruct",
                    prompt: `Elaborate on this concept in a speculative and philosophical tone, using a single sentence of no more than 20 words: ${initialInput}.`,
                    temperature: 1,
                    max_tokens: count < 0 ? 500 : 250,
                    top_p: 1
                })

                let descText = descResponse.choices[0]?.text
                console.log(descResponse)
                descText = descText.trim().replace(/^[^a-zA-Z0-9]+/, '').replace(/[^a-zA-Z0-9?!.,;]+$/, '')

                if (descText !== "" && !isCancelled) {
                    setDescription(descText)
                    await fetchImage(descText)
                } else if (retryCount < 6 && !isCancelled) {
                    retryCount++
                    setTimeout(fetchDescription, 500)
                }
            } catch (error) {
                console.error("Failed fetching description:", error)
            }
        }

        const fetchImage = async (descText) => {
            try {
                setState('generating image')
                const imgResponse = await openai.images.generate({
                    prompt: `${descText}. Craft a colorful image in an experimental cinema aesthetic.`,
                    n: 1,
                    size: "256x256"
                })

                if (!isCancelled) {
                    setImageURL(prevData => [...prevData, imgResponse.data[0].url])
                    setTimeout(() => speakDescription(descText), 3000)
                    setState('')
                    setCount(count + 1)
                }
            } catch (error) {
                console.error("Failed fetching image:", error)
            }
        }

        fetchDescription()

        return () => {
            isCancelled = true
        }

    }, [initialInput])

    return (
        <>
            {state && <div className="state">[{state}]</div>}
            {imageURL && imageURL.map((item, index) => (
                <div key={index} className={'frame'}>
                    <figure className="background">
                        <img className={`${index === imageURL.length - 1 ? 'appear' : ''}`} src={item} alt={description} />
                        {index === imageURL.length - 1 && reading && <figcaption>{description}</figcaption>}
                    </figure>
                </div>
            ))}
        </>
    )
}
