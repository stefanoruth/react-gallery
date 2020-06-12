import React from 'react'
import { hydrate } from 'react-dom'
import { App } from './App'
import './styles/tailwind.css'

hydrate(<App />, document.getElementById('root'))
