#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

const REQUIRED_FIELDS = ['name', 'version', 'description']

function validatePlugin(filePath) {
  const content = fs.readFileSync(filePath, 'utf8')
  let plugin

  try {
    plugin = JSON.parse(content)
  } catch (e) {
    console.error(`Invalid JSON in ${filePath}: ${e.message}`)
    process.exit(1)
  }

  const missing = REQUIRED_FIELDS.filter((field) => !plugin[field])

  if (missing.length > 0) {
    console.error(`${filePath} missing required fields: ${missing.join(', ')}`)
    process.exit(1)
  }

  console.log(`✓ ${filePath}`)
}

// If specific files passed as args, validate those
// Otherwise, find all plugin.json files
const args = process.argv.slice(2)

if (args.length > 0) {
  args
    .filter((f) => f.endsWith('plugin.json'))
    .forEach((f) => validatePlugin(f))
} else {
  const pluginFiles = []

function findPlugins(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name === '.git' || entry.name === 'node_modules') {
        continue
      }
      findPlugins(fullPath)
    } else if (entry.name === 'plugin.json') {
      pluginFiles.push(fullPath)
    }
  }
  }

  findPlugins(process.cwd())
  pluginFiles.forEach(validatePlugin)
}

console.log('All plugins valid!')
