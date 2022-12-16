import * as Tone from 'tone'
import { getDefaultSchema } from '../components/Schema'
import { bufferToWave } from '../components/bufferToWav'
// import sound from '../public/sound.wav'
import { useEffect, useRef, useState } from 'react'
import w1 from './wav/w1.wav'
import w2 from './wav/w2.wav'
import w3 from './wav/w3.wav'
import w4 from './wav/w4.wav'
import w5 from './wav/w5.wav'
import w6 from './wav/w6.wav'

export default function Home() {
  const [sound, setSound] = useState(null)
  const [schema, setSchema] = useState()
  const [audioReady, setAudioReady] = useState(null)

  const AudioArray = [
    {
      name: 'w1',
      url: w1,
    },
    {
      name: 'w2',
      url: w2,
    },
    {
      name: 'w3',
      url: w3,
    },
    {
      name: 'w4',
      url: w4,
    },
    {
      name: 'w5',
      url: w5,
    },
    {
      name: 'w6',
      url: w6,
    },
  ]

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
    const reader = new FileReader()
    reader.onload = (e) => {
      const audioContext = new AudioContext()
      audioContext.decodeAudioData(e.target.result).then((buffer) => {
        setSound(buffer)
      })
    }
    reader.readAsArrayBuffer(e.target.files[0])
  }

  const processWavSound = (elm) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const audioContext = new AudioContext()
      audioContext.decodeAudioData(e.target.result).then((buffer) => {
        setSound(buffer)
      })
    }
    reader.readAsArrayBuffer(elm)
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
      {AudioArray.map((elm, idx) => (
        <div
          key={idx}
          style={{
            cursor: 'pointer',
            padding: '8px',
            border: '1px solid grey',
            width: 'fit-content',
          }}
          onClick={() => processWavSound(elm.url)}>
          {elm.name}
        </div>
      ))}
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
