import * as Tone from 'tone'

const getDefaultParams = (Plugin) => {
  let params = []
  const entries = Object.entries(Plugin)
  entries.forEach((a) => {
    // shame but idk how to get the settable params of a plugin
    if (a[1].name === 'Signal' || a[1].name === 'Param') {
      const name = a[0]
      const value = a[1].value
      const minValue = a[1].minValue
      const maxValue = a[1].maxValue
      const step = (maxValue - minValue) / 100
      params.push({ name, value, minValue, maxValue, step })
    }
  })
  return params
}

export const getDefaultSchema = () => [
  // Chorus
  {
    name: 'Chorus',
    plugin: new Tone.Chorus(),
    params: getDefaultParams(new Tone.Chorus()),
  },
  // Delay
  {
    name: 'Delay',
    plugin: new Tone.FeedbackDelay(),
    params: getDefaultParams(new Tone.FeedbackDelay()),
  },
  // Distortion
  {
    name: 'Distortion',
    plugin: new Tone.Distortion(),
    params: getDefaultParams(new Tone.Distortion()),
  },
  // Freeverb
  {
    name: 'Freeverb',
    plugin: new Tone.Freeverb(),
    params: getDefaultParams(new Tone.Freeverb()),
  },
  // Phaser
  {
    name: 'Phaser',
    plugin: new Tone.Phaser(),
    params: getDefaultParams(new Tone.Phaser()),
  },
  // Limiter
  {
    name: 'Limiter',
    plugin: new Tone.Limiter(),
    params: getDefaultParams(new Tone.Limiter()),
  },
  // PitchShift
  {
    name: 'PitchShift',
    plugin: new Tone.PitchShift(),
    params: getDefaultParams(new Tone.PitchShift()),
  },
  // Filter
  {
    name: 'Filter',
    plugin: new Tone.Filter(),
    params: getDefaultParams(new Tone.Filter()),
  },
  // StereoWidener
  {
    name: 'StereoWidener',
    plugin: new Tone.StereoWidener(),
    params: getDefaultParams(new Tone.StereoWidener()),
  },
]
