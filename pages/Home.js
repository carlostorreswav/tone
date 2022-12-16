import * as Tone from 'tone'
import { getDefaultSchema } from '../components/Schema'
import { bufferToWave } from '../components/bufferToWav'
// import sound from '../public/sound.wav'
import { useEffect, useRef, useState } from 'react'

export default function Home() {
  const [sound, setSound] = useState(null)
  const [schema, setSchema] = useState()
  const [audioReady, setAudioReady] = useState(null)

  const audioRef = useRef()

  useEffect(() => {
    const rawSchema = getDefaultSchema()
    const toStateSchema = rawSchema.map((item) => {
      return {
        name: item.name,
        params: item.params,
        plugin: item.plugin,
      }
    })
    setSchema(toStateSchema)
  }, [])

  const handleUploadWavSound = (e) => {
    console.log('handleUploadWavSound')
    const reader = new FileReader()
    console.log('reader ok')
    reader.onload = (e) => {
      console.log('reader onload')
      const audioContext = new AudioContext()
      console.log('audioContext ok')
      audioContext.decodeAudioData(e.target.result).then((buffer) => {
        console.log('decodeAudioData ok')
        setSound(buffer)
      })
    }
    console.log('reader readAsArrayBuffer')
    reader.readAsArrayBuffer(e.target.files[0])
  }

  const checkPlugin = (instance) => {
    const newParams = schema.find((item) => item.name === instance.name).params
    newParams.forEach((param) => {
      instance.plugin[param.name].value = param.value
    })
    return instance
  }

  const getProperties = (schemaToChange) => {
    const newSchema = schemaToChange
    // console.log('newSchema', newSchema)
    // console.log('schemaToChange', schemaToChange)
    newSchema.forEach((item) => checkPlugin(item))
    return newSchema
  }

  const handleRender = async () => {
    setState({ msg: 'rendering...', timeStart: Date.now() })
    const buffer = await new Tone.Buffer(sound)
    console.log('buffer', buffer)
    Tone.Offline((context) => {
      const sample = new Tone.Player().toDestination()
      const defSchema = getDefaultSchema()
      const parsedSchema = getProperties(defSchema)
      sample.buffer = buffer
      const PluginArray = parsedSchema.map((elm) => elm.plugin)

      // ⬇️ COMMENT THIS LINE TO SEE THE WORKAROUND ⬇️
      sample.chain(...PluginArray, context.destination)

      sample.start(0)
    }, buffer.duration).then((buffer) => {
      const blob = bufferToWave(buffer, buffer.length)
      const url = URL.createObjectURL(blob)
      console.log('url', url)
      setAudioReady(url)
      setState((p) => ({
        msg: `Processed a ${buffer.duration}s sample in ${(
          (Date.now() - p.timeStart) /
          1000
        ).toFixed(2)}s`,
      }))
    })
  }

  const downloadAudio = (url) => {
    const a = document.createElement('a')
    a.href = url
    a.download = 'nextTest.wav'
    a.click()
  }

  const playAudio = (url) => {
    const audio = new Audio(url)
    audioRef.current = audio
    audioRef.current.play()
  }

  const stopAudio = () => {
    audioRef.current.pause()
    audioRef.current.currentTime = 0
  }

  const [state, setState] = useState({ msg: '', timeStart: null })

  return (
    <div className='App'>
      <h1>Tone.js - Trying to render offline a Tone Player chain in offline mode</h1>
      <p>
        this sandbox is a workaround for the <strong>upload - render - download</strong> process
        with <strong>Tone.js and React</strong>
      </p>
      <p>Also shows the problem when trying to connect a chain inside an offline Tone.js process</p>
      <input type='file' onChange={handleUploadWavSound} />
      <button onClick={() => handleRender()}>
        <h3>CLICK TO RENDER</h3>
      </button>

      {audioReady && <button onClick={(e) => downloadAudio(audioReady)}>DOWNLOAD AUDIO</button>}
      {audioReady && <button onClick={(e) => playAudio(audioReady)}>PLAY AUDIO</button>}
      {audioReady && <button onClick={(e) => stopAudio(e)}>STOP AUDIO</button>}
      <h3>{state.msg}</h3>
      <br />
      <div style={{ display: 'flex' }}>
        {schema &&
          schema.map((elm, idx) => (
            <div key={idx} style={{ padding: '8px', border: '1px solid grey', margin: '4px' }}>
              <div>{elm.name}</div>
              {elm?.params?.map((param, idx) => (
                <div key={idx} style={{ padding: '8px', border: '1px solid grey', margin: '4px' }}>
                  <div>Name: {param.name}</div>
                  <div>Value: {param.value}</div>
                  <div>Min: {param.minValue}</div>
                  <div>Max: {param.maxValue}</div>
                  <div>Step: {param.step}</div>
                  <input
                    type='range'
                    min={param.minValue}
                    max={param.maxValue}
                    value={param.value}
                    step={param.step}
                    onChange={(e) => {
                      const newSchema = schema.map((item) => {
                        if (item.name === elm.name) {
                          return {
                            ...item,
                            params: item.params.map((paramItem) => {
                              if (paramItem.name === param.name) {
                                return {
                                  ...paramItem,
                                  value: e.target.value,
                                }
                              }
                              return paramItem
                            }),
                          }
                        }
                        return item
                      })
                      setSchema(newSchema)
                    }}
                  />
                </div>
              ))}
            </div>
          ))}
      </div>
    </div>
  )
}
