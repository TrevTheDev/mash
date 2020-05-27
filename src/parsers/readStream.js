import fs from 'fs'
import { LOCAL } from '../util/globals.js'

const writeStream = async (fsObject, options) => fs.createReadStream(`${fsObject}`, options)
export default writeStream
