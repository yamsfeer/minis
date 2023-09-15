import webpack from '../lib/webpack'

const options = {
  entry: './entry.js'
}

const compiler = webpack(options)
compiler.run()
